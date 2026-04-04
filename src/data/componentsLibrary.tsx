import React, { useState, useEffect } from 'react';

export interface ComponentEntry {
  id: string;
  name: string;
  category: string;
  tags: string[];
  description: string;
  preview: React.FC;
  code: string;
  fileName: string;
}

export const COMPONENT_CATEGORIES = [
  'Buttons',
  'Cards',
  'Forms',
  'Navigation',
  'Layouts',
  'UI Elements',
  'Animations',
  'Data Display',
] as const;

// ── Previews are real React elements rendered inline ──────────────────────────

const GradientButtonPreview = () => (
  <button className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 transition-all shadow-lg shadow-violet-500/30">
    Comenzar gratis
  </button>
);

const GlowButtonPreview = () => (
  <button className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm bg-violet-600 hover:bg-violet-500 transition-all shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:shadow-[0_0_30px_rgba(139,92,246,0.7)]">
    Explorar
  </button>
);

const ShimmerButtonPreview = () => (
  <div className="relative inline-block overflow-hidden rounded-xl">
    <button className="px-6 py-2.5 bg-zinc-800 text-white font-semibold text-sm border border-white/10 rounded-xl">
      Premium
    </button>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none" />
  </div>
);

const OutlineButtonPreview = () => (
  <button className="px-6 py-2.5 rounded-xl text-violet-400 font-semibold text-sm border border-violet-500/50 hover:bg-violet-500/10 transition-all">
    Ver más
  </button>
);

const IconButtonPreview = () => (
  <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-pink-600 to-rose-500 hover:opacity-90 transition-all">
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
    Generar
  </button>
);

const StatsCardPreview = () => (
  <div className="bg-zinc-800/80 border border-white/10 rounded-2xl p-5 w-56">
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs text-zinc-400">Ingresos totales</span>
      <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">+12.5%</span>
    </div>
    <div className="text-2xl font-bold text-white mb-1">$24,563</div>
    <div className="h-1 bg-zinc-700 rounded-full overflow-hidden">
      <div className="h-full w-3/4 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full" />
    </div>
  </div>
);

const PricingCardPreview = () => (
  <div className="bg-gradient-to-b from-violet-950 to-zinc-900 border border-violet-500/30 rounded-2xl p-5 w-48 text-center">
    <div className="text-xs text-violet-400 font-semibold uppercase tracking-wider mb-2">Pro</div>
    <div className="text-3xl font-bold text-white mb-0.5">$29</div>
    <div className="text-xs text-zinc-400 mb-4">/mes</div>
    <button className="w-full py-2 rounded-lg text-xs font-semibold bg-violet-600 text-white hover:bg-violet-500 transition-colors">
      Empezar
    </button>
  </div>
);

const ProfileCardPreview = () => (
  <div className="bg-zinc-800/80 border border-white/10 rounded-2xl p-5 w-52 text-center">
    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg">AZ</div>
    <div className="text-sm font-semibold text-white">Angel Zapata</div>
    <div className="text-xs text-zinc-400 mb-3">Full Stack Developer</div>
    <div className="flex justify-center gap-4 text-center">
      {[['12', 'Posts'], ['4.2k', 'Seguidores'], ['320', 'Siguiendo']].map(([n, l]) => (
        <div key={l}><div className="text-sm font-bold text-white">{n}</div><div className="text-xs text-zinc-500">{l}</div></div>
      ))}
    </div>
  </div>
);

const FeatureCardPreview = () => (
  <div className="bg-zinc-800/80 border border-white/10 rounded-2xl p-5 w-52 hover:border-violet-500/40 transition-all">
    <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center mb-3">
      <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
    </div>
    <div className="text-sm font-semibold text-white mb-1">Velocidad IA</div>
    <div className="text-xs text-zinc-400 leading-relaxed">Genera interfaces completas en segundos con IA.</div>
  </div>
);

const GlassCardPreview = () => (
  <div className="relative w-52 h-28 rounded-2xl overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 to-cyan-600/20" />
    <div className="absolute inset-0 backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-4">
      <div className="text-xs text-white/60 mb-1">Balance</div>
      <div className="text-2xl font-bold text-white">$8,420</div>
      <div className="text-xs text-emerald-400 mt-1">↑ 8.2% este mes</div>
    </div>
  </div>
);

const LoginFormPreview = () => (
  <div className="bg-zinc-800/80 border border-white/10 rounded-2xl p-5 w-56 space-y-3">
    <div className="text-sm font-bold text-white mb-2">Iniciar sesión</div>
    <div>
      <div className="text-xs text-zinc-400 mb-1">Email</div>
      <div className="h-8 bg-zinc-700/60 border border-white/10 rounded-lg px-3 flex items-center">
        <span className="text-xs text-zinc-500">usuario@email.com</span>
      </div>
    </div>
    <div>
      <div className="text-xs text-zinc-400 mb-1">Contraseña</div>
      <div className="h-8 bg-zinc-700/60 border border-white/10 rounded-lg px-3 flex items-center">
        <span className="text-xs text-zinc-500">••••••••</span>
      </div>
    </div>
    <button className="w-full h-8 rounded-lg text-xs font-semibold bg-gradient-to-r from-violet-600 to-cyan-500 text-white">
      Entrar
    </button>
  </div>
);

const SearchBarPreview = () => (
  <div className="relative w-60">
    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
    <input className="w-full h-10 bg-zinc-800 border border-white/10 rounded-xl pl-9 pr-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50" placeholder="Buscar componentes..." readOnly />
  </div>
);

const NewsletterPreview = () => (
  <div className="bg-zinc-800/80 border border-white/10 rounded-2xl p-5 w-60">
    <div className="text-sm font-bold text-white mb-1">Novedades</div>
    <div className="text-xs text-zinc-400 mb-3">Recibe actualizaciones semanales.</div>
    <div className="flex gap-2">
      <div className="flex-1 h-8 bg-zinc-700/60 border border-white/10 rounded-lg px-3 flex items-center">
        <span className="text-xs text-zinc-500">tu@email.com</span>
      </div>
      <button className="px-3 h-8 rounded-lg text-xs font-semibold bg-violet-600 text-white">OK</button>
    </div>
  </div>
);

const OTPPreview = () => (
  <div className="flex gap-2">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className={`w-9 h-11 rounded-xl border flex items-center justify-center text-sm font-bold ${i <= 3 ? 'bg-zinc-700 border-violet-500/50 text-white' : 'bg-zinc-800 border-white/10 text-zinc-500'}`}>
        {i <= 3 ? ['4', '2', '1'][i - 1] : ''}
      </div>
    ))}
  </div>
);

const NavbarPreview = () => (
  <div className="bg-zinc-900/90 border border-white/10 rounded-xl px-4 py-2.5 w-64 flex items-center justify-between">
    <div className="text-sm font-bold text-white">Orion</div>
    <div className="flex items-center gap-3">
      {['Inicio', 'Docs', 'Blog'].map(l => (
        <span key={l} className="text-xs text-zinc-400 hover:text-white cursor-pointer transition-colors">{l}</span>
      ))}
    </div>
    <button className="px-3 py-1 rounded-lg text-xs font-semibold bg-violet-600 text-white">Sign in</button>
  </div>
);

const TabNavPreview = () => {
  const [active, setActive] = useState(0);
  const tabs = ['Resumen', 'Analytics', 'Config'];
  return (
    <div className="flex bg-zinc-800 rounded-xl p-1 gap-1">
      {tabs.map((t, i) => (
        <button
          key={t}
          onClick={() => setActive(i)}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${active === i ? 'bg-violet-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
        >
          {t}
        </button>
      ))}
    </div>
  );
};

const BreadcrumbPreview = () => (
  <div className="flex items-center gap-1.5 text-xs">
    {['Inicio', 'Proyectos', 'Editor'].map((s, i, arr) => (
      <React.Fragment key={s}>
        <span className={i === arr.length - 1 ? 'text-white font-medium' : 'text-zinc-400 hover:text-white cursor-pointer transition-colors'}>{s}</span>
        {i < arr.length - 1 && <span className="text-zinc-600">/</span>}
      </React.Fragment>
    ))}
  </div>
);

const HeroPreview = () => (
  <div className="w-64 text-center py-4 space-y-3">
    <div className="inline-block text-xs font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1">✨ Nuevo — IA generativa</div>
    <div className="text-lg font-bold text-white leading-tight">Construye apps<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">increíbles con IA</span></div>
    <div className="flex justify-center gap-2">
      <button className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-violet-600 to-cyan-500 text-white">Empezar</button>
      <button className="px-4 py-1.5 rounded-lg text-xs font-semibold border border-white/10 text-zinc-300">Ver demo</button>
    </div>
  </div>
);

const FeatureGridPreview = () => (
  <div className="grid grid-cols-2 gap-2 w-56">
    {[
      { icon: '⚡', label: 'Velocidad' },
      { icon: '🔒', label: 'Seguro' },
      { icon: '🤖', label: 'IA nativa' },
      { icon: '🌐', label: 'Global' },
    ].map(({ icon, label }) => (
      <div key={label} className="bg-zinc-800 border border-white/10 rounded-xl p-3 flex flex-col items-center gap-1.5">
        <span className="text-xl">{icon}</span>
        <span className="text-xs font-medium text-zinc-300">{label}</span>
      </div>
    ))}
  </div>
);

const CTASectionPreview = () => (
  <div className="w-60 bg-gradient-to-br from-violet-900/60 to-cyan-900/30 border border-violet-500/20 rounded-2xl p-5 text-center">
    <div className="text-sm font-bold text-white mb-1">¿Listo para empezar?</div>
    <div className="text-xs text-zinc-400 mb-3">Únete a miles de developers.</div>
    <button className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-500/25">
      Crear cuenta gratis
    </button>
  </div>
);

const AnimatedBadgePreview = () => (
  <div className="flex gap-2 flex-wrap justify-center">
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-3 py-1">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      En vivo
    </span>
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-400 bg-violet-400/10 border border-violet-400/20 rounded-full px-3 py-1">
      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
      Beta
    </span>
  </div>
);

const ProgressBarPreview = () => (
  <div className="w-56 space-y-3">
    {[['React', 88, 'from-cyan-500 to-blue-500'], ['TypeScript', 72, 'from-violet-500 to-purple-500'], ['Tailwind', 95, 'from-teal-500 to-cyan-500']].map(([label, val, grad]) => (
      <div key={label as string}>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-zinc-300">{label as string}</span>
          <span className="text-zinc-400">{val}%</span>
        </div>
        <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
          <div className={`h-full bg-gradient-to-r ${grad} rounded-full`} style={{ width: `${val}%` }} />
        </div>
      </div>
    ))}
  </div>
);

const AvatarGroupPreview = () => (
  <div className="flex items-center gap-2">
    <div className="flex -space-x-2.5">
      {['#7c3aed', '#0891b2', '#db2777', '#16a34a', '#ea580c'].map((color, i) => (
        <div key={i} className="w-9 h-9 rounded-full border-2 border-zinc-900 flex items-center justify-center text-xs font-bold text-white" style={{ background: color }}>
          {String.fromCharCode(65 + i)}
        </div>
      ))}
    </div>
    <span className="text-xs text-zinc-400">+142 más</span>
  </div>
);

const NotificationPreview = () => (
  <div className="bg-zinc-800 border border-white/10 rounded-xl p-4 w-60 flex items-start gap-3 shadow-xl">
    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
    </div>
    <div>
      <div className="text-sm font-semibold text-white">¡Proyecto guardado!</div>
      <div className="text-xs text-zinc-400 mt-0.5">Todos los cambios están sincronizados.</div>
    </div>
  </div>
);

// ── Library ───────────────────────────────────────────────────────────────────

export const COMPONENTS_LIBRARY: ComponentEntry[] = [
  {
    id: 'gradient-button',
    name: 'Gradient Button',
    category: 'Buttons',
    tags: ['button', 'gradient', 'cta', 'primary', 'violeta', 'cyan'],
    description: 'Botón CTA con gradiente animado violeta-cyan',
    preview: GradientButtonPreview,
    fileName: 'GradientButton.tsx',
    code: `export function GradientButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm
        bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90
        transition-all shadow-lg shadow-violet-500/30"
    >
      {children}
    </button>
  );
}`,
  },
  {
    id: 'glow-button',
    name: 'Glow Button',
    category: 'Buttons',
    tags: ['button', 'glow', 'efecto', 'hover', 'violeta'],
    description: 'Botón con efecto de brillo neon al hacer hover',
    preview: GlowButtonPreview,
    fileName: 'GlowButton.tsx',
    code: `export function GlowButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm
        bg-violet-600 hover:bg-violet-500 transition-all
        shadow-[0_0_20px_rgba(139,92,246,0.5)]
        hover:shadow-[0_0_30px_rgba(139,92,246,0.7)]"
    >
      {children}
    </button>
  );
}`,
  },
  {
    id: 'shimmer-button',
    name: 'Shimmer Button',
    category: 'Buttons',
    tags: ['button', 'shimmer', 'animacion', 'brillo', 'premium'],
    description: 'Botón con animación de destello tipo shimmer',
    preview: ShimmerButtonPreview,
    fileName: 'ShimmerButton.tsx',
    code: `export function ShimmerButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <div className="relative inline-block overflow-hidden rounded-xl">
      <button
        onClick={onClick}
        className="relative px-6 py-2.5 bg-zinc-800 text-white font-semibold
          text-sm border border-white/10 rounded-xl z-10"
      >
        {children}
      </button>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]
        bg-gradient-to-r from-transparent via-white/10 to-transparent
        skew-x-12 pointer-events-none" />
    </div>
  );
}

// Add to tailwind.config.js:
// animation: { shimmer: 'shimmer 2s infinite' }
// keyframes: { shimmer: { '100%': { transform: 'translateX(200%)' } } }`,
  },
  {
    id: 'outline-button',
    name: 'Outline Button',
    category: 'Buttons',
    tags: ['button', 'outline', 'borde', 'secondary', 'secundario'],
    description: 'Botón outline con borde violeta y hover sutil',
    preview: OutlineButtonPreview,
    fileName: 'OutlineButton.tsx',
    code: `export function OutlineButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-2.5 rounded-xl text-violet-400 font-semibold text-sm
        border border-violet-500/50 hover:bg-violet-500/10 transition-all"
    >
      {children}
    </button>
  );
}`,
  },
  {
    id: 'icon-button',
    name: 'Icon Button',
    category: 'Buttons',
    tags: ['button', 'icon', 'icono', 'rosa', 'action'],
    description: 'Botón con icono y texto en gradiente rosa-rojo',
    preview: IconButtonPreview,
    fileName: 'IconButton.tsx',
    code: `import { Zap } from 'lucide-react';

export function IconButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white
        font-semibold text-sm bg-gradient-to-r from-pink-600 to-rose-500
        hover:opacity-90 transition-all"
    >
      <Zap className="w-4 h-4" />
      {children}
    </button>
  );
}`,
  },
  {
    id: 'stats-card',
    name: 'Stats Card',
    category: 'Cards',
    tags: ['card', 'estadisticas', 'stats', 'metrica', 'dashboard'],
    description: 'Tarjeta de métrica con indicador de tendencia y barra de progreso',
    preview: StatsCardPreview,
    fileName: 'StatsCard.tsx',
    code: `interface StatsCardProps {
  label: string;
  value: string;
  trend: string;
  trendUp?: boolean;
  progress: number;
}

export function StatsCard({ label, value, trend, trendUp = true, progress }: StatsCardProps) {
  return (
    <div className="bg-zinc-800/80 border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-zinc-400">{label}</span>
        <span className={\`text-xs px-2 py-0.5 rounded-full \${trendUp ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}\`}>
          {trend}
        </span>
      </div>
      <div className="text-2xl font-bold text-white mb-3">{value}</div>
      <div className="h-1 bg-zinc-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full"
          style={{ width: \`\${progress}%\` }}
        />
      </div>
    </div>
  );
}`,
  },
  {
    id: 'pricing-card',
    name: 'Pricing Card',
    category: 'Cards',
    tags: ['card', 'pricing', 'precio', 'plan', 'suscripcion'],
    description: 'Tarjeta de plan de precios con gradiente oscuro y CTA',
    preview: PricingCardPreview,
    fileName: 'PricingCard.tsx',
    code: `interface PricingCardProps {
  plan: string;
  price: string;
  period?: string;
  features: string[];
  onSelect?: () => void;
  highlighted?: boolean;
}

export function PricingCard({ plan, price, period = '/mes', features, onSelect, highlighted = false }: PricingCardProps) {
  return (
    <div className={\`rounded-2xl p-6 text-center border \${
      highlighted
        ? 'bg-gradient-to-b from-violet-950 to-zinc-900 border-violet-500/30'
        : 'bg-zinc-800/80 border-white/10'
    }\`}>
      <div className="text-xs text-violet-400 font-semibold uppercase tracking-wider mb-2">{plan}</div>
      <div className="text-4xl font-bold text-white mb-0.5">{price}</div>
      <div className="text-xs text-zinc-400 mb-5">{period}</div>
      <ul className="text-left space-y-2 mb-5">
        {features.map(f => (
          <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
            <span className="text-emerald-400">✓</span> {f}
          </li>
        ))}
      </ul>
      <button
        onClick={onSelect}
        className="w-full py-2.5 rounded-xl text-sm font-semibold
          bg-violet-600 text-white hover:bg-violet-500 transition-colors"
      >
        Empezar
      </button>
    </div>
  );
}`,
  },
  {
    id: 'profile-card',
    name: 'Profile Card',
    category: 'Cards',
    tags: ['card', 'perfil', 'usuario', 'avatar', 'social'],
    description: 'Tarjeta de perfil de usuario con stats sociales',
    preview: ProfileCardPreview,
    fileName: 'ProfileCard.tsx',
    code: `interface ProfileCardProps {
  name: string;
  role: string;
  avatar?: string;
  posts: number;
  followers: number;
  following: number;
}

export function ProfileCard({ name, role, avatar, posts, followers, following }: ProfileCardProps) {
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <div className="bg-zinc-800/80 border border-white/10 rounded-2xl p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500
        mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl overflow-hidden">
        {avatar ? <img src={avatar} alt={name} className="w-full h-full object-cover" /> : initials}
      </div>
      <div className="text-base font-semibold text-white">{name}</div>
      <div className="text-xs text-zinc-400 mb-4">{role}</div>
      <div className="flex justify-center gap-6 text-center">
        {[['Posts', posts], ['Seguidores', followers], ['Siguiendo', following]].map(([label, val]) => (
          <div key={label as string}>
            <div className="text-sm font-bold text-white">{val.toLocaleString()}</div>
            <div className="text-xs text-zinc-500">{label as string}</div>
          </div>
        ))}
      </div>
    </div>
  );
}`,
  },
  {
    id: 'feature-card',
    name: 'Feature Card',
    category: 'Cards',
    tags: ['card', 'feature', 'caracteristica', 'icon', 'landing'],
    description: 'Tarjeta de característica con icono y hover border',
    preview: FeatureCardPreview,
    fileName: 'FeatureCard.tsx',
    code: `import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-zinc-800/80 border border-white/10 rounded-2xl p-6
      hover:border-violet-500/40 transition-all group">
      <div className="w-11 h-11 rounded-xl bg-violet-500/15 flex items-center justify-center mb-4
        group-hover:bg-violet-500/25 transition-colors">
        <Icon className="w-5 h-5 text-violet-400" />
      </div>
      <div className="text-sm font-semibold text-white mb-2">{title}</div>
      <div className="text-xs text-zinc-400 leading-relaxed">{description}</div>
    </div>
  );
}`,
  },
  {
    id: 'glass-card',
    name: 'Glass Card',
    category: 'Cards',
    tags: ['card', 'glass', 'glassmorphism', 'blur', 'transparente'],
    description: 'Tarjeta con efecto glassmorphism y gradiente',
    preview: GlassCardPreview,
    fileName: 'GlassCard.tsx',
    code: `interface GlassCardProps {
  label: string;
  value: string;
  change?: string;
}

export function GlassCard({ label, value, change }: GlassCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 to-cyan-600/20" />
      <div className="relative backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="text-xs text-white/60 mb-2">{label}</div>
        <div className="text-3xl font-bold text-white">{value}</div>
        {change && <div className="text-xs text-emerald-400 mt-1">{change}</div>}
      </div>
    </div>
  );
}`,
  },
  {
    id: 'login-form',
    name: 'Login Form',
    category: 'Forms',
    tags: ['form', 'login', 'autenticacion', 'email', 'password'],
    description: 'Formulario de autenticación completo con diseño oscuro',
    preview: LoginFormPreview,
    fileName: 'LoginForm.tsx',
    code: `import { useState } from 'react';

interface LoginFormProps {
  onSubmit?: (email: string, password: string) => void;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="bg-zinc-800/80 border border-white/10 rounded-2xl p-8 w-full max-w-sm">
      <h2 className="text-xl font-bold text-white mb-6">Iniciar sesión</h2>
      <div className="space-y-4">
        <div>
          <label className="text-xs text-zinc-400 mb-1.5 block">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="usuario@email.com"
            className="w-full h-10 bg-zinc-700/60 border border-white/10 rounded-xl px-3
              text-sm text-white placeholder:text-zinc-500 focus:outline-none
              focus:border-violet-500/50 transition-colors"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-400 mb-1.5 block">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full h-10 bg-zinc-700/60 border border-white/10 rounded-xl px-3
              text-sm text-white placeholder:text-zinc-500 focus:outline-none
              focus:border-violet-500/50 transition-colors"
          />
        </div>
        <button
          onClick={() => onSubmit?.(email, password)}
          className="w-full h-10 rounded-xl text-sm font-semibold
            bg-gradient-to-r from-violet-600 to-cyan-500 text-white
            hover:opacity-90 transition-all"
        >
          Entrar
        </button>
      </div>
    </div>
  );
}`,
  },
  {
    id: 'search-bar',
    name: 'Search Bar',
    category: 'Forms',
    tags: ['form', 'busqueda', 'search', 'input', 'filtro'],
    description: 'Barra de búsqueda moderna con icono y focus animado',
    preview: SearchBarPreview,
    fileName: 'SearchBar.tsx',
    code: `import { Search } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export function SearchBar({ placeholder = 'Buscar...', onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
      <input
        type="text"
        value={query}
        onChange={e => { setQuery(e.target.value); onSearch?.(e.target.value); }}
        placeholder={placeholder}
        className="w-full h-10 bg-zinc-800 border border-white/10 rounded-xl
          pl-9 pr-4 text-sm text-white placeholder:text-zinc-500
          focus:outline-none focus:border-violet-500/50 transition-colors"
      />
    </div>
  );
}`,
  },
  {
    id: 'newsletter-form',
    name: 'Newsletter Form',
    category: 'Forms',
    tags: ['form', 'newsletter', 'email', 'suscripcion', 'subscribe'],
    description: 'Formulario de suscripción compacto con botón inline',
    preview: NewsletterPreview,
    fileName: 'NewsletterForm.tsx',
    code: `import { useState } from 'react';

interface NewsletterFormProps {
  onSubscribe?: (email: string) => void;
}

export function NewsletterForm({ onSubscribe }: NewsletterFormProps) {
  const [email, setEmail] = useState('');

  return (
    <div className="bg-zinc-800/80 border border-white/10 rounded-2xl p-6">
      <div className="text-sm font-bold text-white mb-1">Mantente al día</div>
      <div className="text-xs text-zinc-400 mb-4">Recibe novedades y actualizaciones semanales.</div>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="flex-1 h-9 bg-zinc-700/60 border border-white/10 rounded-xl px-3
            text-sm text-white placeholder:text-zinc-500 focus:outline-none
            focus:border-violet-500/50 transition-colors"
        />
        <button
          onClick={() => onSubscribe?.(email)}
          className="px-4 h-9 rounded-xl text-xs font-semibold bg-violet-600 text-white
            hover:bg-violet-500 transition-colors"
        >
          Suscribir
        </button>
      </div>
    </div>
  );
}`,
  },
  {
    id: 'otp-input',
    name: 'OTP Input',
    category: 'Forms',
    tags: ['form', 'otp', 'codigo', 'verificacion', '2fa', 'pin'],
    description: 'Input de código OTP con 6 campos y auto-focus',
    preview: OTPPreview,
    fileName: 'OTPInput.tsx',
    code: `import { useRef, useState, KeyboardEvent } from 'react';

interface OTPInputProps {
  length?: number;
  onComplete?: (code: string) => void;
}

export function OTPInput({ length = 6, onComplete }: OTPInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, val: string) => {
    if (!/^[0-9]*$/.test(val)) return;
    const next = [...values];
    next[i] = val.slice(-1);
    setValues(next);
    if (val && i < length - 1) refs.current[i + 1]?.focus();
    if (next.every(v => v) && next.join('').length === length) {
      onComplete?.(next.join(''));
    }
  };

  const handleKeyDown = (i: number, e: KeyboardEvent) => {
    if (e.key === 'Backspace' && !values[i] && i > 0) refs.current[i - 1]?.focus();
  };

  return (
    <div className="flex gap-2">
      {values.map((val, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={val}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          className="w-11 h-13 rounded-xl border text-center text-base font-bold
            bg-zinc-800 border-white/10 text-white
            focus:border-violet-500/70 focus:outline-none transition-colors"
        />
      ))}
    </div>
  );
}`,
  },
  {
    id: 'modern-navbar',
    name: 'Navbar',
    category: 'Navigation',
    tags: ['navbar', 'navegacion', 'header', 'menu', 'responsive'],
    description: 'Barra de navegación moderna con logo, links y CTA',
    preview: NavbarPreview,
    fileName: 'Navbar.tsx',
    code: `interface NavbarProps {
  brand?: string;
  links?: { label: string; href: string }[];
  onSignIn?: () => void;
}

export function Navbar({ brand = 'Orion', links = [], onSignIn }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md
      bg-zinc-900/80 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="text-base font-bold text-white">{brand}</div>
        <nav className="hidden md:flex items-center gap-6">
          {links.map(({ label, href }) => (
            <a key={label} href={href}
              className="text-sm text-zinc-400 hover:text-white transition-colors">
              {label}
            </a>
          ))}
        </nav>
        <button
          onClick={onSignIn}
          className="px-4 py-1.5 rounded-lg text-sm font-semibold
            bg-violet-600 text-white hover:bg-violet-500 transition-colors">
          Sign in
        </button>
      </div>
    </header>
  );
}`,
  },
  {
    id: 'tab-nav',
    name: 'Tab Navigation',
    category: 'Navigation',
    tags: ['tabs', 'navegacion', 'tab', 'switch', 'segmented'],
    description: 'Navegación por tabs con indicador activo animado',
    preview: TabNavPreview,
    fileName: 'TabNav.tsx',
    code: `import { useState } from 'react';

interface TabNavProps {
  tabs: string[];
  defaultIndex?: number;
  onChange?: (index: number) => void;
}

export function TabNav({ tabs, defaultIndex = 0, onChange }: TabNavProps) {
  const [active, setActive] = useState(defaultIndex);

  const handleSelect = (i: number) => {
    setActive(i);
    onChange?.(i);
  };

  return (
    <div className="flex bg-zinc-800 rounded-xl p-1 gap-1">
      {tabs.map((tab, i) => (
        <button
          key={tab}
          onClick={() => handleSelect(i)}
          className={\`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all \${
            active === i
              ? 'bg-violet-600 text-white shadow-lg'
              : 'text-zinc-400 hover:text-white'
          }\`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}`,
  },
  {
    id: 'hero-section',
    name: 'Hero Section',
    category: 'Layouts',
    tags: ['hero', 'landing', 'layout', 'seccion', 'portada'],
    description: 'Sección hero completa con badge, título gradiente y CTA doble',
    preview: HeroPreview,
    fileName: 'HeroSection.tsx',
    code: `interface HeroSectionProps {
  badge?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
}

export function HeroSection({ badge, title, highlight, subtitle, primaryCta = 'Empezar', secondaryCta = 'Ver demo', onPrimary, onSecondary }: HeroSectionProps) {
  return (
    <section className="flex flex-col items-center text-center py-24 px-4">
      {badge && (
        <div className="inline-block text-xs font-semibold text-violet-400
          bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-6">
          {badge}
        </div>
      )}
      <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-4">
        {title}{' '}
        {highlight && (
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
            {highlight}
          </span>
        )}
      </h1>
      {subtitle && (
        <p className="text-lg text-zinc-400 max-w-xl mb-8">{subtitle}</p>
      )}
      <div className="flex gap-3">
        <button
          onClick={onPrimary}
          className="px-6 py-3 rounded-xl text-sm font-semibold
            bg-gradient-to-r from-violet-600 to-cyan-500 text-white
            hover:opacity-90 transition-all shadow-lg shadow-violet-500/25"
        >
          {primaryCta}
        </button>
        <button
          onClick={onSecondary}
          className="px-6 py-3 rounded-xl text-sm font-semibold
            border border-white/10 text-zinc-300 hover:bg-white/5 transition-all"
        >
          {secondaryCta}
        </button>
      </div>
    </section>
  );
}`,
  },
  {
    id: 'feature-grid',
    name: 'Feature Grid',
    category: 'Layouts',
    tags: ['layout', 'features', 'grid', 'landing', 'caracteristicas'],
    description: 'Grid de características con iconos emoji y grid 2×2',
    preview: FeatureGridPreview,
    fileName: 'FeatureGrid.tsx',
    code: `interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface FeatureGridProps {
  features: Feature[];
  columns?: 2 | 3 | 4;
}

export function FeatureGrid({ features, columns = 3 }: FeatureGridProps) {
  const colClass = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' }[columns];
  return (
    <div className={\`grid \${colClass} gap-4\`}>
      {features.map(({ icon, title, description }) => (
        <div key={title}
          className="bg-zinc-800/80 border border-white/10 rounded-2xl p-5
            hover:border-violet-500/30 transition-all">
          <div className="text-3xl mb-3">{icon}</div>
          <div className="text-sm font-semibold text-white mb-1.5">{title}</div>
          <div className="text-xs text-zinc-400 leading-relaxed">{description}</div>
        </div>
      ))}
    </div>
  );
}`,
  },
  {
    id: 'cta-section',
    name: 'CTA Section',
    category: 'Layouts',
    tags: ['cta', 'llamada', 'accion', 'layout', 'conversion'],
    description: 'Sección de llamada a la acción con gradiente y CTA centrado',
    preview: CTASectionPreview,
    fileName: 'CTASection.tsx',
    code: `interface CTASectionProps {
  title: string;
  subtitle?: string;
  cta?: string;
  onCta?: () => void;
}

export function CTASection({ title, subtitle, cta = 'Comenzar gratis', onCta }: CTASectionProps) {
  return (
    <section className="py-20 px-4">
      <div className="max-w-2xl mx-auto text-center
        bg-gradient-to-br from-violet-900/60 to-cyan-900/30
        border border-violet-500/20 rounded-3xl py-16 px-8">
        <h2 className="text-3xl font-bold text-white mb-3">{title}</h2>
        {subtitle && <p className="text-zinc-400 mb-8">{subtitle}</p>}
        <button
          onClick={onCta}
          className="px-8 py-3 rounded-xl text-sm font-semibold
            bg-gradient-to-r from-violet-600 to-cyan-500 text-white
            hover:opacity-90 transition-all shadow-lg shadow-violet-500/25"
        >
          {cta}
        </button>
      </div>
    </section>
  );
}`,
  },
  {
    id: 'animated-badge',
    name: 'Animated Badge',
    category: 'UI Elements',
    tags: ['badge', 'etiqueta', 'animado', 'pulse', 'estado', 'live'],
    description: 'Badge con punto pulsante para estados en tiempo real',
    preview: AnimatedBadgePreview,
    fileName: 'AnimatedBadge.tsx',
    code: `type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'purple';

interface AnimatedBadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const VARIANTS: Record<BadgeVariant, string> = {
  success: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20 [--dot:theme(colors.emerald.400)]',
  warning: 'text-amber-400 bg-amber-400/10 border-amber-400/20 [--dot:theme(colors.amber.400)]',
  error:   'text-red-400 bg-red-400/10 border-red-400/20 [--dot:theme(colors.red.400)]',
  info:    'text-blue-400 bg-blue-400/10 border-blue-400/20 [--dot:theme(colors.blue.400)]',
  purple:  'text-violet-400 bg-violet-400/10 border-violet-400/20 [--dot:theme(colors.violet.400)]',
};

export function AnimatedBadge({ label, variant = 'success' }: AnimatedBadgeProps) {
  return (
    <span className={\`inline-flex items-center gap-1.5 text-xs font-semibold
      border rounded-full px-3 py-1 \${VARIANTS[variant]}\`}>
      <span className="w-1.5 h-1.5 rounded-full bg-[--dot] animate-pulse" />
      {label}
    </span>
  );
}`,
  },
  {
    id: 'progress-bar',
    name: 'Progress Bar',
    category: 'UI Elements',
    tags: ['progress', 'progreso', 'barra', 'carga', 'porcentaje'],
    description: 'Barra de progreso con gradiente y etiqueta de skill',
    preview: ProgressBarPreview,
    fileName: 'ProgressBar.tsx',
    code: `interface ProgressBarProps {
  label: string;
  value: number;
  gradient?: string;
}

export function ProgressBar({ label, value, gradient = 'from-violet-500 to-cyan-500' }: ProgressBarProps) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-zinc-300 font-medium">{label}</span>
        <span className="text-zinc-400">{value}%</span>
      </div>
      <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
        <div
          className={\`h-full bg-gradient-to-r \${gradient} rounded-full transition-all duration-700\`}
          style={{ width: \`\${value}%\` }}
        />
      </div>
    </div>
  );
}`,
  },
  {
    id: 'avatar-group',
    name: 'Avatar Group',
    category: 'UI Elements',
    tags: ['avatar', 'grupo', 'usuarios', 'team', 'equipo', 'social'],
    description: 'Grupo de avatares apilados con contador de excedente',
    preview: AvatarGroupPreview,
    fileName: 'AvatarGroup.tsx',
    code: `interface AvatarUser {
  name: string;
  avatar?: string;
  color?: string;
}

interface AvatarGroupProps {
  users: AvatarUser[];
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base' };

export function AvatarGroup({ users, max = 5, size = 'md' }: AvatarGroupProps) {
  const visible = users.slice(0, max);
  const rest = users.length - max;

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2.5">
        {visible.map((u, i) => (
          <div key={i}
            className={\`\${SIZES[size]} rounded-full border-2 border-zinc-900
              flex items-center justify-center font-bold text-white overflow-hidden\`}
            style={{ background: u.color ?? '#7c3aed' }}
            title={u.name}
          >
            {u.avatar
              ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
              : u.name.slice(0, 2).toUpperCase()
            }
          </div>
        ))}
        {rest > 0 && (
          <div className={\`\${SIZES[size]} rounded-full border-2 border-zinc-900
            bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300\`}>
            +{rest}
          </div>
        )}
      </div>
    </div>
  );
}`,
  },
  {
    id: 'notification-toast',
    name: 'Notification Toast',
    category: 'UI Elements',
    tags: ['notification', 'toast', 'alerta', 'mensaje', 'feedback'],
    description: 'Toast de notificación con icono, título y descripción',
    preview: NotificationPreview,
    fileName: 'NotificationToast.tsx',
    code: `import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface NotificationToastProps {
  type?: ToastType;
  title: string;
  description?: string;
  onClose?: () => void;
}

const CONFIG: Record<ToastType, { icon: typeof CheckCircle; bg: string; color: string }> = {
  success: { icon: CheckCircle, bg: 'bg-emerald-500/15', color: 'text-emerald-400' },
  error:   { icon: XCircle,    bg: 'bg-red-500/15',     color: 'text-red-400' },
  warning: { icon: AlertCircle, bg: 'bg-amber-500/15',  color: 'text-amber-400' },
  info:    { icon: Info,        bg: 'bg-blue-500/15',   color: 'text-blue-400' },
};

export function NotificationToast({ type = 'success', title, description, onClose }: NotificationToastProps) {
  const { icon: Icon, bg, color } = CONFIG[type];
  return (
    <div className="bg-zinc-800 border border-white/10 rounded-xl p-4 flex items-start gap-3 shadow-xl max-w-sm">
      <div className={\`w-9 h-9 rounded-lg \${bg} flex items-center justify-center flex-shrink-0\`}>
        <Icon className={\`w-5 h-5 \${color}\`} />
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-white">{title}</div>
        {description && <div className="text-xs text-zinc-400 mt-0.5">{description}</div>}
      </div>
      {onClose && (
        <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
          <span className="text-lg leading-none">×</span>
        </button>
      )}
    </div>
  );
}`,
  },
];

export function findComponentByPrompt(prompt: string): ComponentEntry | null {
  const lower = prompt.toLowerCase();
  return COMPONENTS_LIBRARY.find(c =>
    lower.includes(c.name.toLowerCase()) ||
    lower.includes(c.id.toLowerCase()) ||
    c.tags.some(t => lower.includes(t))
  ) ?? null;
}

export function findComponentsByPrompt(prompt: string): ComponentEntry[] {
  const lower = prompt.toLowerCase();
  return COMPONENTS_LIBRARY.filter(c =>
    lower.includes(c.name.toLowerCase()) ||
    lower.includes(c.id.toLowerCase()) ||
    c.tags.some(t => lower.includes(t))
  );
}
