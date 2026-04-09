import { Request, Response } from 'express';
import { pool } from '../config/database';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt';
import { HTTP_STATUS } from '../utils/constants';
import { ApiResponse } from '../types/api';
import { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { emailService } from '../services/emailService'; 
import crypto from 'crypto';
import { getCreditStatus, initializeCredits } from '../services/creditService';

interface ProfileUpdates {
  username?: string; 
  avatar?: string;
  preferences?: Record<string, unknown>;
  profile?: Record<string, unknown>;
}

// Registro de usuario
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password }: RegisterRequest = req.body;
  console.log('Email recibido en backend:', email);

  // Verificar si el usuario ya existe
  const existingUser = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );
  console.log('Resultado de búsqueda:', existingUser.rows);

  if (existingUser.rows.length > 0) {
    throw createError('User already exists with this email', HTTP_STATUS.CONFLICT);
  }

  // Hashear contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  // Crear usuario
  const insertQuery = `
    INSERT INTO users (username, email, password)
    VALUES ($1, $2, $3)
    RETURNING id, username, email, role, preferences
  `;
  const result = await pool.query(insertQuery, [username, email, hashedPassword]);
  const user = result.rows[0];

  // Generar token de verificacion de email
  const verificationToken = crypto.randomBytes(32).toString('hex');
  await pool.query(
    'UPDATE users SET email_verification_token = $1 WHERE id = $2',
    [verificationToken, user.id]
  );

  // Enviar email de verificacion (reemplaza el de bienvenida)
  await emailService.sendEmailVerification(user.email, user.username, verificationToken);

  // Inicializar créditos del plan free
  try {
    await initializeCredits(String(user.id), 'free');
  } catch (err) {
    console.error('Failed to initialize credits on register:', err);
  }

  // Generar token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role
  });

  const response: ApiResponse<AuthResponse> = {
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        preferences: user.preferences
      },
      token
    }
  };

  res.status(HTTP_STATUS.CREATED).json(response);
});

// Login de usuario
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password }: LoginRequest = req.body;

  // Buscar usuario
  const userResult = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  if (userResult.rows.length === 0) {
    throw createError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED);
  }
  const user = userResult.rows[0];

  // Verificar contraseña
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw createError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED);
  }

  // Generar token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role
  });

  // Notificacion de login (fire-and-forget, no bloquea la respuesta)
  const loginDate = new Date().toLocaleString('es-ES', { timeZone: 'America/Bogota', dateStyle: 'full', timeStyle: 'short' });
  const rawUA = req.headers['user-agent'] || 'Dispositivo desconocido';
  const userAgent = rawUA.length > 80 ? rawUA.substring(0, 80) + '...' : rawUA;
  emailService.sendLoginNotification(user.email, user.username, loginDate, userAgent).catch(() => {});

  const response: ApiResponse<AuthResponse> = {
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        preferences: user.preferences
      },
      token
    }
  };

  res.status(HTTP_STATUS.OK).json(response);
});

// Obtener perfil
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userResult = await pool.query(
    'SELECT id, username, email, avatar, role, github_id, preferences, created_at, updated_at, (password IS NOT NULL) as has_password FROM users WHERE id = $1',
    [req.user?.id]
  );
  if (userResult.rows.length === 0) {
    throw createError('User not found', HTTP_STATUS.NOT_FOUND);
  }
  const user = userResult.rows[0];

  // Obtener estado de créditos en tiempo real (con auto-reset incluido)
  let credits = null;
  try {
    credits = await getCreditStatus(String(user.id));
  } catch {
    // fail-open: si falla, no bloqueamos el perfil
  }

  const response: ApiResponse = {
    success: true,
    message: 'Profile retrieved successfully',
    data: { ...user, credits }
  };

  res.status(HTTP_STATUS.OK).json(response);
});

// Actualizar perfil
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const allowedUpdates = ['username', 'avatar', 'preferences', 'profile'];
  const updates: ProfileUpdates = {};

  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updates[key as keyof ProfileUpdates] = req.body[key];
    }
  });

  // Construir query dinámica
  const updateFields: string[] = [];
  const updateValues: Array<string | object> = [];
  let paramIndex = 1;

  if (updates.username !== undefined) {
    updateFields.push(`username = $${paramIndex++}`);
    updateValues.push(updates.username);
  }
  if (updates.avatar !== undefined) {
    updateFields.push(`avatar = $${paramIndex++}`);
    updateValues.push(updates.avatar);
  }
  if (updates.preferences !== undefined) {
    updateFields.push(`preferences = $${paramIndex++}`);
    updateValues.push(JSON.stringify(updates.preferences));
  }
  if (updates.profile !== undefined) {
    updateFields.push(`profile = $${paramIndex++}`);
    updateValues.push(JSON.stringify(updates.profile));
  }

  if (updateFields.length === 0) {
    throw createError('No valid fields to update', HTTP_STATUS.BAD_REQUEST);
  }

  const updateQuery = `
    UPDATE users
    SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramIndex}
    RETURNING id, username, email, avatar, role, preferences, created_at, updated_at
  `;
  if (!req.user?.id) {
    throw createError('User ID is required', HTTP_STATUS.BAD_REQUEST);
  }
  updateValues.push(req.user.id);

  const result = await pool.query(updateQuery, updateValues);
  if (result.rows.length === 0) {
    throw createError('User not found', HTTP_STATUS.NOT_FOUND);
  }
  const user = result.rows[0];

  const response: ApiResponse = {
    success: true,
    message: 'Profile updated successfully',
    data: user
  };

  res.status(HTTP_STATUS.OK).json(response);
});

// Solicitar restablecimiento de contraseña
export const requestPasswordReset = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  // Buscar usuario
  const userResult = await pool.query('SELECT id, username, email FROM users WHERE email = $1', [email]);
  if (userResult.rows.length === 0) {
    throw createError('No user found with this email', HTTP_STATUS.NOT_FOUND);
  }
  const user = userResult.rows[0];

  // Generar token seguro
  const resetToken = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

  // Guardar token y expiración en la base de datos
  await pool.query(
    'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
    [resetToken, expires, user.id]
  );

  // Enviar email de recuperación
  await emailService.sendPasswordResetEmail(user.email, resetToken);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Password reset email sent'
  });
});

// Verificar email con token
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.query as { token: string };

  if (!token) {
    throw createError('Token is required', HTTP_STATUS.BAD_REQUEST);
  }

  const userResult = await pool.query(
    'SELECT id, username, email FROM users WHERE email_verification_token = $1 AND email_verified = false',
    [token]
  );
  if (userResult.rows.length === 0) {
    throw createError('Invalid or already used verification token', HTTP_STATUS.BAD_REQUEST);
  }
  const user = userResult.rows[0];

  await pool.query(
    'UPDATE users SET email_verified = true, email_verification_token = NULL WHERE id = $1',
    [user.id]
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Email verified successfully'
  });
});

// Restablecer contraseña usando el token
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  // Buscar usuario por token y verificar expiración
  const userResult = await pool.query(
    'SELECT id, username, email FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
    [token]
  );
  if (userResult.rows.length === 0) {
    throw createError('Invalid or expired token', HTTP_STATUS.BAD_REQUEST);
  }
  const user = userResult.rows[0];

  // Hashear nueva contraseña
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Actualizar contraseña y limpiar token
  await pool.query(
    'UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
    [hashedPassword, user.id]
  );

  // Notificacion de cambio de contrasena (fire-and-forget)
  const changedAt = new Date().toLocaleString('es-ES', { timeZone: 'America/Bogota', dateStyle: 'full', timeStyle: 'short' });
  emailService.sendPasswordChangedNotification(user.email, user.username, changedAt).catch(() => {});

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Password reset successful'
  });
});

// Cambiar contraseña (autenticado)
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!req.user?.id) {
    throw createError('User ID is required', HTTP_STATUS.BAD_REQUEST);
  }

  const userResult = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
  if (userResult.rows.length === 0) {
    throw createError('User not found', HTTP_STATUS.NOT_FOUND);
  }

  const existingPassword = userResult.rows[0].password;

  // Usuario GitHub sin contraseña local: permitir establecerla sin currentPassword
  if (!existingPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, req.user.id]
    );
    return res.status(HTTP_STATUS.OK).json({ success: true, message: 'Password set successfully' });
  }

  const isValid = await bcrypt.compare(currentPassword, existingPassword);
  if (!isValid) {
    throw createError('La contraseña actual es incorrecta', HTTP_STATUS.UNAUTHORIZED);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await pool.query(
    'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [hashedPassword, req.user.id]
  );

  // Notificacion de cambio de contrasena (fire-and-forget)
  const changedAt = new Date().toLocaleString('es-ES', { timeZone: 'America/Bogota', dateStyle: 'full', timeStyle: 'short' });
  const userEmail = await pool.query('SELECT email, username FROM users WHERE id = $1', [req.user.id]);
  if (userEmail.rows.length > 0) {
    emailService.sendPasswordChangedNotification(userEmail.rows[0].email, userEmail.rows[0].username, changedAt).catch(() => {});
  }

  return res.status(HTTP_STATUS.OK).json({ success: true, message: 'Password changed successfully' });
});

// Desconectar GitHub
export const disconnectGithub = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw createError('User ID is required', HTTP_STATUS.BAD_REQUEST);
  }

  await pool.query(
    'UPDATE users SET github_id = NULL, github_access_token = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
    [req.user.id]
  );

  const userResult = await pool.query(
    'SELECT id, username, email, avatar, role, github_id, preferences, created_at, updated_at FROM users WHERE id = $1',
    [req.user.id]
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'GitHub disconnected successfully',
    data: userResult.rows[0]
  });
});

// GitHub OAuth callback
export const githubCallback = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/login?error=authentication_failed`);
  }

  // Generar token JWT
  const token = generateToken({
    userId: req.user.id,
    email: req.user.email,
    role: req.user.role
  });

  // Redirigir al frontend con el token
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/auth/callback?token=${token}`);
});