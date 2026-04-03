import passport from "passport";
import { Strategy as GitHubStrategy, Profile, VerifyCallback } from "passport-github2";
import { pool } from "./database";

passport.serializeUser((user: unknown, done: (err: Error | null, id?: string | null) => void) => {
  // Si recibimos un objeto con `id` como string
  if (user && typeof user === 'object') {
    const maybeId = (user as { id?: unknown }).id;
    if (typeof maybeId === 'string') {
      return done(null, maybeId);
    }
  }

  if (typeof user === 'string') {
    return done(null, user);
  }

  // Fallback con error claro
  return done(new Error('serializeUser: invalid user object'), null);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const result = await pool.query("SELECT id, email, role FROM users WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return done(new Error("User not found"), null);
    }

    const user = result.rows[0];
    const expressUser: Express.User = {
      id: user.id.toString(),
      email: user.email,
      role: user.role,
    };

    done(null, expressUser);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.GITHUB_CALLBACK_URL!,
    },
    async (accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) => {
      try {
        const email = profile.emails?.[0]?.value || "";
        const githubId = profile.id;

        const userResult = await pool.query(
          "SELECT id, email, role FROM users WHERE github_id = $1 OR email = $2",
          [githubId, email]
        );
        let user = userResult.rows[0];

        if (!user) {
          const insertResult = await pool.query(
            `INSERT INTO users (username, email, github_id, role)
             VALUES ($1, $2, $3, $4)
             RETURNING id, email, role`,
            [profile.username, email, githubId, "user"]
          );
          user = insertResult.rows[0];
        } else if (!user.github_id) {
          await pool.query(
            'UPDATE users SET github_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [githubId, user.id]
          );
        }

        const expressUser: Express.User = {
          id: user.id.toString(),
          email: user.email,
          role: user.role,
        };

        return done(null, expressUser);
      } catch (error) {
        return done(error instanceof Error ? error : new Error(String(error)));
      }
    }
  )
);

export default passport;
