import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('Email service not configured');
        return;
      }

      await this.transporter.sendMail({
        from: `${process.env.EMAIL_FROM_NAME || 'Orion Builder'} <${process.env.SMTP_USER}>`,
        to: options.to,
        replyTo: process.env.EMAIL_REPLY_TO || process.env.SMTP_USER,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      console.log(`Email sent successfully to: ${options.to}`);
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background: #0F172A; 
            border-radius: 16px;
            overflow: hidden;
          }
          .header { 
            background: linear-gradient(135deg, #0891b2 0%, #06b6d4 50%, #67e8f9 100%); 
            padding: 48px 32px; 
            text-align: center; 
            color: white; 
          }
          .content { 
            padding: 40px 32px; 
            background: #1e293b; 
            color: #e2e8f0;
          }
          .button { 
            display: inline-block; 
            padding: 16px 32px; 
            background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%); 
            color: white; 
            text-decoration: none; 
            border-radius: 12px; 
            margin: 24px 0;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 8px 25px rgba(8, 145, 178, 0.3);
            transition: all 0.3s ease;
          }
          .footer { 
            padding: 32px; 
            text-align: center; 
            color: #94a3b8; 
            font-size: 14px; 
            background: #0f172a;
          }
          .feature-list {
            background: #334155;
            border-radius: 16px;
            padding: 32px;
            margin: 32px 0;
            border: 1px solid #475569;
          }
          .feature-item {
            display: flex;
            align-items: center;
            margin: 20px 0;
            color: #e2e8f0;
            font-size: 16px;
          }
          .icon {
            width: 48px;
            height: 48px;
            margin-right: 16px;
            background: linear-gradient(135deg, #0891b2, #06b6d4);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .logo-icon {
            width: 64px;
            height: 64px;
            margin: 0 auto 16px;
            background: rgba(255,255,255,0.1);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h1 style="margin: 0; font-size: 36px; font-weight: 700;">Orion Builder</h1>
            <p style="margin: 12px 0 0 0; font-size: 18px; opacity: 0.9;">Desarrollo con IA al alcance de tus manos</p>
          </div>
          <div class="content">
            <h2 style="color: #06b6d4; margin-top: 0; font-size: 28px;">¡Hola ${name}!</h2>
            <p style="font-size: 18px; line-height: 1.6; margin: 24px 0;">Bienvenido a <strong style="color: #06b6d4;">Orion Builder</strong>, la plataforma de desarrollo con IA más avanzada.</p>
            
            <div class="feature-list">
              <h3 style="color: #06b6d4; margin-top: 0; font-size: 22px; margin-bottom: 24px;">Con tu cuenta, ahora puedes:</h3>
              
              <div class="feature-item">
                <div class="icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73L12 2L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73L12 22l8-4.27A2 2 0 0 0 21 16z" stroke="white" stroke-width="2"/>
                    <polyline points="7.5,10.5 12,15 16.5,10.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <span>Generar aplicaciones completas con IA</span>
              </div>
              
              <div class="feature-item">
                <div class="icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polyline points="16 18 22 12 16 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <polyline points="8 6 2 12 8 18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <span>Editor en tiempo real con preview instantáneo</span>
              </div>
              
              <div class="feature-item">
                <div class="icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.93 2.31a1.5 1.5 0 0 0-2.62 0l-.8 1.38a1.5 1.5 0 0 0 0 1.5l.8 1.38a1.5 1.5 0 0 0 1.31.75h1.6a1.5 1.5 0 0 0 1.31-.75l.8-1.38a1.5 1.5 0 0 0 0-1.5l-.8-1.38z" stroke="white" stroke-width="2"/>
                    <path d="M12 8L8 21l4-7h4l-4-6z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <span>Deploy con un solo click</span>
              </div>
              
              <div class="feature-item">
                <div class="icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="white" stroke-width="2"/>
                    <rect x="9" y="9" width="6" height="6" stroke="white" stroke-width="2"/>
                    <path d="M9 1v6M15 1v6M9 15v6M15 15v6M1 9h6M1 15h6M17 9h6M17 15h6" stroke="white" stroke-width="2"/>
                  </svg>
                </div>
                <span>Templates profesionales listos para usar</span>
              </div>
              
              <div class="feature-item">
                <div class="icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="white" stroke-width="2"/>
                    <circle cx="9" cy="7" r="4" stroke="white" stroke-width="2"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="white" stroke-width="2"/>
                  </svg>
                </div>
                <span>Colaboración en tiempo real</span>
              </div>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.FRONTEND_URL}/dashboard" class="button">
                Comenzar a Desarrollar
                <svg style="margin-left: 8px; vertical-align: middle;" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <polyline points="9 18 15 12 9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </a>
            </div>

            <div style="background: #334155; border-radius: 12px; padding: 24px; border-left: 4px solid #06b6d4; margin: 32px 0;">
              <p style="margin: 0; font-size: 16px; line-height: 1.6;">
                <strong style="color: #06b6d4;">¿Tienes preguntas?</strong><br>
                Responde a este email, estaremos encantados de ayudarte.
              </p>
            </div>
            
            <p style="font-size: 18px; margin: 32px 0 8px 0; color: #67e8f9;">¡Happy Coding!</p>
            <p style="color: #06b6d4; font-weight: 600; margin: 0; font-size: 16px;"><strong>El equipo de Orion Builder</strong></p>
          </div>
          <div class="footer">
            <p style="margin: 0 0 8px 0;">© 2025 Orion Builder. Construyendo el futuro del desarrollo.</p>
            <p style="margin: 0; font-size: 12px; color: #64748b;">Este email fue enviado porque te registraste en nuestra plataforma.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: '¡Bienvenido a Orion Builder!',
      html,
      text: `¡Hola ${name}! Bienvenido a Orion Builder. Visita ${process.env.FRONTEND_URL}/dashboard para comenzar.`
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background: #0F172A; 
            border-radius: 16px;
            overflow: hidden;
          }
          .header { 
            background: linear-gradient(135deg, #0891b2 0%, #06b6d4 50%, #67e8f9 100%); 
            padding: 48px 32px; 
            text-align: center; 
            color: white; 
          }
          .content { 
            padding: 40px 32px; 
            background: #1e293b; 
            color: #e2e8f0;
          }
          .button { 
            display: inline-block; 
            padding: 16px 32px; 
            background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%); 
            color: white; 
            text-decoration: none; 
            border-radius: 12px; 
            margin: 24px 0;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 8px 25px rgba(8, 145, 178, 0.3);
          }
          .footer { 
            padding: 32px; 
            text-align: center; 
            color: #94a3b8; 
            font-size: 14px; 
            background: #0f172a;
          }
          .warning { 
            background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); 
            border-radius: 12px; 
            padding: 24px; 
            margin: 32px 0; 
            color: white;
          }
          .logo-icon {
            width: 64px;
            height: 64px;
            margin: 0 auto 16px;
            background: rgba(255,255,255,0.1);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="white" stroke-width="2"/>
                <circle cx="12" cy="16" r="1" fill="white"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="white" stroke-width="2"/>
              </svg>
            </div>
            <h1 style="margin: 0; font-size: 36px; font-weight: 700;">Recuperar Contraseña</h1>
            <p style="margin: 12px 0 0 0; font-size: 18px; opacity: 0.9;">Orion Builder</p>
          </div>
          <div class="content">
            <h2 style="color: #06b6d4; margin-top: 0; font-size: 28px;">Restablecer contraseña</h2>
            <p style="font-size: 18px; line-height: 1.6;">Has solicitado restablecer la contraseña de tu cuenta en Orion Builder.</p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${resetUrl}" class="button">
                <svg style="margin-right: 8px; vertical-align: middle;" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                </svg>
                Restablecer Contraseña
              </a>
            </div>

            <div class="warning">
              <h4 style="margin: 0 0 16px 0; display: flex; align-items: center; font-size: 18px;">
                <svg style="margin-right: 12px;" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="white" stroke-width="2"/>
                  <line x1="12" y1="9" x2="12" y2="13" stroke="white" stroke-width="2"/>
                  <line x1="12" y1="17" x2="12.01" y2="17" stroke="white" stroke-width="2"/>
                </svg>
                Información importante:
              </h4>
              <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
                <li>Este enlace expirará en 1 hora</li>
                <li>Si no solicitaste este cambio, ignora este email</li>
                <li>Por seguridad, cambia tu contraseña regularmente</li>
              </ul>
            </div>

            <div style="background: #334155; border-radius: 12px; padding: 20px; margin: 32px 0;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #94a3b8;">Si el botón no funciona, copia y pega este enlace:</p>
              <p style="word-break: break-all; color: #06b6d4; font-family: monospace; font-size: 14px; margin: 0; padding: 12px; background: #1e293b; border-radius: 6px;">${resetUrl}</p>
            </div>
            
            <p style="color: #06b6d4; font-weight: 600; margin: 32px 0 0 0; font-size: 16px;"><strong>El equipo de Orion Builder</strong></p>
          </div>
          <div class="footer">
            <p style="margin: 0;">© 2025 Orion Builder. Construyendo el futuro del desarrollo.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Restablecer contraseña - Orion Builder',
      html,
      text: `Restablecer contraseña solicitado. Visita: ${resetUrl}. Este enlace expira en 1 hora.`
    });
  }

  async sendEmailVerification(email: string, name: string, verificationToken: string): Promise<void> {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { margin: 0; padding: 32px; background: #04060d; }
          .container { max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0F172A; border-radius: 16px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #0891b2 0%, #06b6d4 50%, #67e8f9 100%); padding: 48px 32px; text-align: center; color: white; }
          .content { padding: 40px 32px; background: #1e293b; color: #e2e8f0; }
          .button { display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%); color: white; text-decoration: none; border-radius: 12px; margin: 24px 0; font-weight: 600; font-size: 16px; box-shadow: 0 8px 25px rgba(8,145,178,0.3); }
          .footer { padding: 24px 32px; text-align: center; color: #64748b; font-size: 13px; background: #0f172a; }
          .badge { display: inline-block; background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.3); color: #06b6d4; border-radius: 8px; padding: 4px 12px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div style="width:64px;height:64px;margin:0 auto 16px;background:rgba(255,255,255,0.1);border-radius:16px;display:flex;align-items:center;justify-content:center;">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.59a16 16 0 0 0 6.29 6.29l.96-.85a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" stroke="white" stroke-width="2"/></svg>
            </div>
            <h1 style="margin:0;font-size:32px;font-weight:700;">Verifica tu email</h1>
            <p style="margin:10px 0 0;font-size:16px;opacity:0.9;">Orion Builder — Un paso mas</p>
          </div>
          <div class="content">
            <span class="badge">Verificacion requerida</span>
            <h2 style="color:#06b6d4;margin-top:0;font-size:26px;">Hola, ${name}!</h2>
            <p style="font-size:16px;line-height:1.7;">Gracias por registrarte en <strong style="color:#06b6d4;">Orion Builder</strong>. Para activar tu cuenta y acceder a todas las funciones, confirma tu direccion de email haciendo clic en el boton:</p>

            <div style="text-align:center;margin:36px 0;">
              <a href="${verifyUrl}" class="button">Verificar mi email</a>
            </div>

            <div style="background:#334155;border-radius:12px;padding:20px;border-left:4px solid #f59e0b;margin:24px 0;">
              <p style="margin:0;font-size:14px;color:#fbbf24;font-weight:600;">Importante</p>
              <p style="margin:8px 0 0;font-size:14px;color:#94a3b8;line-height:1.6;">Este enlace expira en <strong style="color:#e2e8f0;">24 horas</strong>. Si no creaste esta cuenta, ignora este email.</p>
            </div>

            <div style="background:#1e293b;border:1px solid #334155;border-radius:10px;padding:16px;margin-top:24px;">
              <p style="margin:0 0 6px;font-size:12px;color:#64748b;">Si el boton no funciona, copia este enlace:</p>
              <p style="word-break:break-all;color:#06b6d4;font-family:monospace;font-size:12px;margin:0;padding:10px;background:#0f172a;border-radius:6px;">${verifyUrl}</p>
            </div>
          </div>
          <div class="footer">
            <p style="margin:0 0 4px;">© 2026 Orion Builder. Construyendo el futuro del desarrollo.</p>
            <p style="margin:0;font-size:11px;">Recibiste este email porque te registraste en nuestra plataforma.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Verifica tu email — Orion Builder',
      html,
      text: `Hola ${name}! Verifica tu email en Orion Builder: ${verifyUrl} (expira en 24 horas)`
    });
  }

  async sendLoginNotification(email: string, name: string, loginDate: string, userAgent: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { margin: 0; padding: 32px; background: #04060d; }
          .container { max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0F172A; border-radius: 16px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%); padding: 36px 32px; text-align: center; color: white; }
          .content { padding: 36px 32px; background: #1e293b; color: #e2e8f0; }
          .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #334155; font-size: 14px; }
          .footer { padding: 24px 32px; text-align: center; color: #64748b; font-size: 13px; background: #0f172a; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div style="width:56px;height:56px;margin:0 auto 14px;background:rgba(255,255,255,0.1);border-radius:14px;display:flex;align-items:center;justify-content:center;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <h1 style="margin:0;font-size:26px;font-weight:700;">Nuevo inicio de sesion</h1>
            <p style="margin:8px 0 0;font-size:14px;opacity:0.8;">Orion Builder — Alerta de seguridad</p>
          </div>
          <div class="content">
            <p style="font-size:16px;line-height:1.7;margin-top:0;">Hola <strong style="color:#93c5fd;">${name}</strong>, detectamos un nuevo inicio de sesion en tu cuenta.</p>

            <div style="background:#0f172a;border:1px solid #334155;border-radius:12px;padding:20px;margin:24px 0;">
              <div class="info-row">
                <span style="color:#64748b;">Fecha y hora</span>
                <span style="color:#e2e8f0;font-weight:500;">${loginDate}</span>
              </div>
              <div class="info-row" style="border-bottom:none;">
                <span style="color:#64748b;">Dispositivo</span>
                <span style="color:#e2e8f0;font-weight:500;max-width:260px;text-align:right;font-size:13px;">${userAgent}</span>
              </div>
            </div>

            <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);border-radius:12px;padding:20px;margin:24px 0;">
              <p style="margin:0;font-size:15px;color:#fca5a5;font-weight:600;">No fuiste tu?</p>
              <p style="margin:8px 0 0;font-size:14px;color:#94a3b8;line-height:1.6;">Cambia tu contrasena inmediatamente desde <a href="${process.env.FRONTEND_URL}/settings" style="color:#60a5fa;">Configuracion</a> o solicita un <a href="${process.env.FRONTEND_URL}/login" style="color:#60a5fa;">restablecimiento de contrasena</a>.</p>
            </div>

            <p style="font-size:13px;color:#64748b;line-height:1.6;">Si fuiste tu, puedes ignorar este mensaje. Te enviamos esto para mantener tu cuenta segura.</p>
          </div>
          <div class="footer">
            <p style="margin:0 0 4px;">© 2026 Orion Builder.</p>
            <p style="margin:0;font-size:11px;">Para desactivar estas alertas, ve a <a href="${process.env.FRONTEND_URL}/settings" style="color:#06b6d4;">Configuracion → Notificaciones</a>.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Nuevo inicio de sesion en tu cuenta — Orion Builder',
      html,
      text: `Hola ${name}, nuevo inicio de sesion detectado el ${loginDate} desde ${userAgent}. Si no fuiste tu, cambia tu contrasena en ${process.env.FRONTEND_URL}/settings`
    });
  }

  async sendPasswordChangedNotification(email: string, name: string, changedAt: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { margin: 0; padding: 32px; background: #04060d; }
          .container { max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0F172A; border-radius: 16px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #065f46 0%, #059669 100%); padding: 36px 32px; text-align: center; color: white; }
          .content { padding: 36px 32px; background: #1e293b; color: #e2e8f0; }
          .footer { padding: 24px 32px; text-align: center; color: #64748b; font-size: 13px; background: #0f172a; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div style="width:56px;height:56px;margin:0 auto 14px;background:rgba(255,255,255,0.1);border-radius:14px;display:flex;align-items:center;justify-content:center;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke="white" stroke-width="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="white" stroke-width="2"/><circle cx="12" cy="16" r="1" fill="white"/></svg>
            </div>
            <h1 style="margin:0;font-size:26px;font-weight:700;">Contrasena actualizada</h1>
            <p style="margin:8px 0 0;font-size:14px;opacity:0.8;">Orion Builder — Confirmacion de seguridad</p>
          </div>
          <div class="content">
            <p style="font-size:16px;line-height:1.7;margin-top:0;">Hola <strong style="color:#6ee7b7;">${name}</strong>, tu contrasena fue cambiada exitosamente.</p>

            <div style="background:#0f172a;border:1px solid #334155;border-radius:12px;padding:20px;margin:24px 0;">
              <p style="margin:0;font-size:13px;color:#64748b;">Fecha y hora del cambio</p>
              <p style="margin:6px 0 0;font-size:15px;color:#e2e8f0;font-weight:500;">${changedAt}</p>
            </div>

            <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);border-radius:12px;padding:20px;margin:24px 0;">
              <p style="margin:0;font-size:15px;color:#fca5a5;font-weight:600;">No realizaste este cambio?</p>
              <p style="margin:8px 0 0;font-size:14px;color:#94a3b8;line-height:1.6;">Contacta a soporte inmediatamente o solicita un nuevo <a href="${process.env.FRONTEND_URL}/login" style="color:#60a5fa;">restablecimiento de contrasena</a> para asegurar tu cuenta.</p>
            </div>

            <p style="font-size:13px;color:#64748b;">Si fuiste tu quien realizo este cambio, no necesitas hacer nada mas. Tu cuenta esta segura.</p>
          </div>
          <div class="footer">
            <p style="margin:0;">© 2026 Orion Builder. Construyendo el futuro del desarrollo.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Tu contrasena fue cambiada — Orion Builder',
      html,
      text: `Hola ${name}, tu contrasena de Orion Builder fue cambiada el ${changedAt}. Si no fuiste tu, contacta soporte o ve a ${process.env.FRONTEND_URL}/login`
    });
  }

  async sendProjectInviteEmail(email: string, projectName: string, inviterName: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background: #0F172A; 
            border-radius: 16px;
            overflow: hidden;
          }
          .header { 
            background: linear-gradient(135deg, #0891b2 0%, #06b6d4 50%, #67e8f9 100%); 
            padding: 48px 32px; 
            text-align: center; 
            color: white; 
          }
          .content { 
            padding: 40px 32px; 
            background: #1e293b; 
            color: #e2e8f0;
          }
          .button { 
            display: inline-block; 
            padding: 16px 32px; 
            background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%); 
            color: white; 
            text-decoration: none; 
            border-radius: 12px; 
            margin: 24px 0;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 8px 25px rgba(8, 145, 178, 0.3);
          }
          .footer { 
            padding: 32px; 
            text-align: center; 
            color: #94a3b8; 
            font-size: 14px; 
            background: #0f172a;
          }
          .project-info { 
            background: linear-gradient(135deg, #334155 0%, #475569 100%); 
            border-radius: 16px; 
            padding: 32px; 
            margin: 32px 0; 
            border-left: 4px solid #06b6d4;
          }
          .feature-item {
            display: flex;
            align-items: center;
            margin: 16px 0;
            color: #e2e8f0;
            font-size: 16px;
          }
          .icon {
            width: 40px;
            height: 40px;
            margin-right: 16px;
            background: linear-gradient(135deg, #0891b2, #06b6d4);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .logo-icon {
            width: 64px;
            height: 64px;
            margin: 0 auto 16px;
            background: rgba(255,255,255,0.1);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="white" stroke-width="2"/>
                <circle cx="9" cy="7" r="4" stroke="white" stroke-width="2"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="white" stroke-width="2"/>
              </svg>
            </div>
            <h1 style="margin: 0; font-size: 36px; font-weight: 700;">Invitación a Colaborar</h1>
            <p style="margin: 12px 0 0 0; font-size: 18px; opacity: 0.9;">Orion Builder</p>
          </div>
          <div class="content">
            <h2 style="color: #06b6d4; margin-top: 0; font-size: 28px;">¡Te han invitado a colaborar!</h2>
            <p style="font-size: 18px; line-height: 1.6;"><strong style="color: #67e8f9;">${inviterName}</strong> te ha invitado a colaborar en un proyecto increíble.</p>
            
            <div class="project-info">
              <h3 style="color: #06b6d4; margin: 0 0 16px 0; display: flex; align-items: center; font-size: 22px;">
                <svg style="margin-right: 12px;" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2"/>
                </svg>
                Proyecto: ${projectName}
              </h3>
              <p style="margin: 0; color: #cbd5e1; font-size: 16px; line-height: 1.6;">Únete para desarrollar juntos con IA, compartir código y crear algo asombroso.</p>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.FRONTEND_URL}/projects" class="button">
                <svg style="margin-right: 8px; vertical-align: middle;" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                </svg>
                Ver Proyecto
              </a>
            </div>

            <h4 style="color: #06b6d4; font-size: 20px; margin: 32px 0 20px 0;">¿Qué puedes hacer como colaborador?</h4>
            
            <div class="feature-item">
              <div class="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="white" stroke-width="2"/>
                  <circle cx="9" cy="7" r="4" stroke="white" stroke-width="2"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="white" stroke-width="2"/>
                </svg>
              </div>
              <span>Trabajar en tiempo real con el equipo</span>
            </div>
            
            <div class="feature-item">
              <div class="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <polyline points="16 18 22 12 16 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <polyline points="8 6 2 12 8 18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span>Editar código colaborativamente</span>
            </div>
            
            <div class="feature-item">
              <div class="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73L12 2L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73L12 22l8-4.27A2 2 0 0 0 21 16z" stroke="white" stroke-width="2"/>
                  <polyline points="7.5,10.5 12,15 16.5,10.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span>Usar IA para generar código juntos</span>
            </div>
            
            <div class="feature-item">
              <div class="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <polyline points="23 4 23 10 17 10" stroke="white" stroke-width="2"/>
                  <polyline points="1 20 1 14 7 14" stroke="white" stroke-width="2"/>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="white" stroke-width="2"/>
                </svg>
              </div>
              <span>Sincronizar cambios instantáneamente</span>
            </div>
            
            <div style="background: #334155; border-radius: 12px; padding: 24px; border-left: 4px solid #06b6d4; margin: 32px 0;">
              <p style="margin: 0; font-size: 16px; line-height: 1.6;">
                <strong style="color: #06b6d4;">¡Esperamos verte pronto en el proyecto!</strong>
              </p>
            </div>
            
            <p style="color: #06b6d4; font-weight: 600; margin: 32px 0 0 0; font-size: 16px;"><strong>El equipo de Orion Builder</strong></p>
          </div>
          <div class="footer">
            <p style="margin: 0;">© 2025 Orion Builder. Construyendo el futuro del desarrollo.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: `Invitación al proyecto: ${projectName}`,
      html,
      text: `${inviterName} te invitó a colaborar en ${projectName} en Orion Builder. Visita: ${process.env.FRONTEND_URL}/projects`
    });
  }

  async sendProjectNotification(
    email: string,
    username: string,
    projectName: string,
    action: string
  ): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0F172A;color:#e2e8f0;padding:32px;margin:0;">
        <div style="max-width:560px;margin:0 auto;background:#1e293b;border-radius:16px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#0891b2 0%,#06b6d4 100%);padding:32px;text-align:center;">
            <h1 style="margin:0;color:white;font-size:24px;">📦 Orion Builder</h1>
          </div>
          <div style="padding:32px;">
            <h2 style="color:#06b6d4;margin-top:0;">Actualización de tu proyecto</h2>
            <p style="font-size:16px;line-height:1.6;">Hola <strong>${username}</strong>,</p>
            <p style="font-size:16px;line-height:1.6;">Tu proyecto <strong style="color:#06b6d4;">${projectName}</strong> ha sido <strong>${action}</strong>.</p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${process.env.FRONTEND_URL}/projects"
                 style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#0891b2,#06b6d4);color:white;text-decoration:none;border-radius:10px;font-weight:600;font-size:15px;">
                Ver mis proyectos
              </a>
            </div>
            <p style="color:#64748b;font-size:12px;margin-top:32px;border-top:1px solid #334155;padding-top:16px;">
              Para desactivar estas notificaciones, ve a
              <a href="${process.env.FRONTEND_URL}/settings" style="color:#06b6d4;">Configuración → Notificaciones</a>.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: `Orion Builder — Proyecto "${projectName}" ${action}`,
      html,
      text: `Hola ${username}, tu proyecto "${projectName}" ha sido ${action}. Visita: ${process.env.FRONTEND_URL}/projects`,
    });
  }
}

export const emailService = new EmailService();