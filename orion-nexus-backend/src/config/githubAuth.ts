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
    const result = await pool.query(
      `SELECT id, email, role, COALESCE(preferences->>'subscription', 'free') AS plan
       FROM users WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return done(new Error("User not found"), null);
    }

    const user = result.rows[0];
    const rawPlan = user.plan as string;
    const expressUser: Express.User = {
      id: user.id.toString(),
      email: user.email,
      role: user.role,
      plan: (['pro', 'business', 'enterprise'].includes(rawPlan) ? rawPlan : 'free') as 'free' | 'pro' | 'business' | 'enterprise',
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
          `SELECT id, email, role, COALESCE(preferences->>'subscription', 'free') AS plan
           FROM users WHERE github_id = $1 OR email = $2`,
          [githubId, email]
        );
        let user = userResult.rows[0];

        if (!user) {
          const insertResult = await pool.query(
            `INSERT INTO users (username, email, github_id, github_access_token, role)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, email, role, COALESCE(preferences->>'subscription', 'free') AS plan`,
            [profile.username, email, githubId, accessToken, "user"]
          );
          user = insertResult.rows[0];
        } else {
          await pool.query(
            'UPDATE users SET github_id = COALESCE(github_id, $1), github_access_token = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
            [githubId, accessToken, user.id]
          );
        }

        const rawPlan = user.plan as string;
        const expressUser: Express.User = {
          id: user.id.toString(),
          email: user.email,
          role: user.role,
          plan: (['pro', 'business', 'enterprise'].includes(rawPlan) ? rawPlan : 'free') as 'free' | 'pro' | 'business' | 'enterprise',
        };

        return done(null, expressUser);
      } catch (error) {
        return done(error instanceof Error ? error : new Error(String(error)));
      }
    }
  )
);

export default passport;
