const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'orion-nexus',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// All 46 system components
const COMPONENTS = [
  // ── BUTTONS ────────────────────────────────────────────────────────────────
  {
    slug: 'gradient-button', name: 'Gradient Button', category: 'Buttons',
    description: 'Botón CTA con gradiente animado violeta-cyan',
    tags: ['button','gradient','cta','primary','violeta','cyan'],
    file_name: 'GradientButton.tsx', framework: 'react',
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
    slug: 'glow-button', name: 'Glow Button', category: 'Buttons',
    description: 'Botón con efecto de brillo neon al hacer hover',
    tags: ['button','glow','efecto','hover','violeta'],
    file_name: 'GlowButton.tsx', framework: 'react',
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
    slug: 'shimmer-button', name: 'Shimmer Button', category: 'Buttons',
    description: 'Botón con animación de destello tipo shimmer',
    tags: ['button','shimmer','animacion','brillo','premium'],
    file_name: 'ShimmerButton.tsx', framework: 'react',
    code: `export function ShimmerButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <div className="relative inline-block overflow-hidden rounded-xl">
      <button onClick={onClick} className="relative px-6 py-2.5 bg-zinc-800 text-white font-semibold text-sm border border-white/10 rounded-xl z-10">{children}</button>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none" />
    </div>
  );
}`,
  },
  {
    slug: 'outline-button', name: 'Outline Button', category: 'Buttons',
    description: 'Botón outline con borde violeta y hover sutil',
    tags: ['button','outline','borde','secondary','secundario'],
    file_name: 'OutlineButton.tsx', framework: 'react',
    code: `export function OutlineButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="px-6 py-2.5 rounded-xl text-violet-400 font-semibold text-sm border border-violet-500/50 hover:bg-violet-500/10 transition-all">{children}</button>
  );
}`,
  },
  {
    slug: 'icon-button', name: 'Icon Button', category: 'Buttons',
    description: 'Botón con icono y texto en gradiente rosa-rojo',
    tags: ['button','icon','icono','rosa','action'],
    file_name: 'IconButton.tsx', framework: 'react',
    code: `import { Zap } from 'lucide-react';

export function IconButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-pink-600 to-rose-500 hover:opacity-90 transition-all">
      <Zap className="w-4 h-4" />
      {children}
    </button>
  );
}`,
  },
  {
    slug: 'ripple-button', name: 'Ripple Button', category: 'Animations',
    description: 'Botón con efecto onda al hacer click estilo Material',
    tags: ['button','ripple','animacion','click','onda','material'],
    file_name: 'RippleButton.tsx', framework: 'react',
    code: `import { useState, MouseEvent } from 'react';

interface Ripple { id: number; x: number; y: number; }

export function RippleButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples(r => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples(r => r.filter(rr => rr.id !== id)), 600);
    onClick?.();
  };
  return (
    <button onClick={handleClick} className="relative overflow-hidden px-6 py-2.5 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-500">
      {ripples.map(r => (<span key={r.id} className="absolute rounded-full bg-white/30 animate-ping pointer-events-none" style={{ left: r.x - 20, top: r.y - 20, width: 40, height: 40, animationDuration: '0.6s' }} />))}
      {children}
    </button>
  );
}`,
  },

  // ── CARDS ────────────────────────────────────────────────────────────────
  {
    slug: 'stats-card', name: 'Stats Card', category: 'Cards',
    description: 'Tarjeta de métrica con indicador de tendencia y barra de progreso',
    tags: ['card','estadisticas','stats','metrica','dashboard'],
    file_name: 'StatsCard.tsx', framework: 'react',
    code: `interface StatsCardProps { label: string; value: string; trend: string; trendUp?: boolean; progress: number; }

export function StatsCard({ label, value, trend, trendUp = true, progress }: StatsCardProps) {
  return (
    <div className="bg-zinc-800/80 border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-zinc-400">{label}</span>
        <span className={\`text-xs px-2 py-0.5 rounded-full \${trendUp ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}\`}>{trend}</span>
      </div>
      <div className="text-2xl font-bold text-white mb-3">{value}</div>
      <div className="h-1 bg-zinc-700 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full" style={{ width: \`\${progress}%\` }} /></div>
    </div>
  );
}`,
  },
  {
    slug: 'pricing-card', name: 'Pricing Card', category: 'Cards',
    description: 'Tarjeta de plan de precios con gradiente oscuro y CTA',
    tags: ['card','pricing','precio','plan','suscripcion'],
    file_name: 'PricingCard.tsx', framework: 'react',
    code: `interface PricingCardProps { plan: string; price: string; period?: string; features: string[]; onSelect?: () => void; highlighted?: boolean; }

export function PricingCard({ plan, price, period = '/mes', features, onSelect, highlighted = false }: PricingCardProps) {
  return (
    <div className={\`rounded-2xl p-6 text-center border \${highlighted ? 'bg-gradient-to-b from-violet-950 to-zinc-900 border-violet-500/30' : 'bg-zinc-800/80 border-white/10'}\`}>
      <div className="text-xs text-violet-400 font-semibold uppercase tracking-wider mb-2">{plan}</div>
      <div className="text-4xl font-bold text-white mb-0.5">{price}</div>
      <div className="text-xs text-zinc-400 mb-5">{period}</div>
      <ul className="text-left space-y-2 mb-5">{features.map(f => (<li key={f} className="flex items-center gap-2 text-sm text-zinc-300"><span className="text-emerald-400">✓</span> {f}</li>))}</ul>
      <button onClick={onSelect} className="w-full py-2.5 rounded-xl text-sm font-semibold bg-violet-600 text-white hover:bg-violet-500 transition-colors">Empezar</button>
    </div>
  );
}`,
  },
  {
    slug: 'profile-card', name: 'Profile Card', category: 'Cards',
    description: 'Tarjeta de perfil de usuario con stats sociales',
    tags: ['card','perfil','usuario','avatar','social'],
    file_name: 'ProfileCard.tsx', framework: 'react',
    code: `interface ProfileCardProps { name: string; role: string; avatar?: string; posts: number; followers: number; following: number; }

export function ProfileCard({ name, role, avatar, posts, followers, following }: ProfileCardProps) {
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <div className="bg-zinc-800/80 border border-white/10 rounded-2xl p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl overflow-hidden">{avatar ? <img src={avatar} alt={name} className="w-full h-full object-cover" /> : initials}</div>
      <div className="text-base font-semibold text-white">{name}</div>
      <div className="text-xs text-zinc-400 mb-4">{role}</div>
      <div className="flex justify-center gap-6 text-center">{[['Posts', posts], ['Seguidores', followers], ['Siguiendo', following]].map(([label, val]) => (<div key={label as string}><div className="text-sm font-bold text-white">{val as number}</div><div className="text-xs text-zinc-500">{label as string}</div></div>))}</div>
    </div>
  );
}`,
  },
  {
    slug: 'feature-card', name: 'Feature Card', category: 'Cards',
    description: 'Tarjeta de característica con icono y hover border',
    tags: ['card','feature','caracteristica','icon','landing'],
    file_name: 'FeatureCard.tsx', framework: 'react',
    code: `import { LucideIcon } from 'lucide-react';

interface FeatureCardProps { icon: LucideIcon; title: string; description: string; }

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-zinc-800/80 border border-white/10 rounded-2xl p-6 hover:border-violet-500/40 transition-all group">
      <div className="w-11 h-11 rounded-xl bg-violet-500/15 flex items-center justify-center mb-4 group-hover:bg-violet-500/25 transition-colors"><Icon className="w-5 h-5 text-violet-400" /></div>
      <div className="text-sm font-semibold text-white mb-2">{title}</div>
      <div className="text-xs text-zinc-400 leading-relaxed">{description}</div>
    </div>
  );
}`,
  },
  {
    slug: 'glass-card', name: 'Glass Card', category: 'Cards',
    description: 'Tarjeta con efecto glassmorphism y gradiente',
    tags: ['card','glass','glassmorphism','blur','transparente'],
    file_name: 'GlassCard.tsx', framework: 'react',
    code: `interface GlassCardProps { label: string; value: string; change?: string; }

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
    slug: 'kanban-card', name: 'Kanban Card', category: 'Cards',
    description: 'Tarjeta de tarea estilo Kanban con estado y progreso',
    tags: ['kanban','task','tarea','board','ticket','proyecto','trello'],
    file_name: 'KanbanCard.tsx', framework: 'react',
    code: `interface KanbanCardProps { title: string; description?: string; status?: 'todo' | 'in-progress' | 'review' | 'done'; progress?: number; }

export function KanbanCard({ title, description, status = 'todo', progress }: KanbanCardProps) {
  const STATUS = { todo: { label: 'Por hacer', color: 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20' }, 'in-progress': { label: 'En progreso', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' }, review: { label: 'En revisión', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' }, done: { label: 'Completado', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' } };
  const s = STATUS[status];
  return (
    <div className="bg-zinc-800/90 border border-white/10 rounded-xl p-4 shadow-lg hover:border-violet-500/30 transition-all cursor-grab">
      <span className={\`inline-flex items-center gap-1 text-[10px] font-semibold border rounded-full px-2 py-0.5 mb-3 \${s.color}\`}><span className="w-1 h-1 rounded-full bg-current animate-pulse" />{s.label}</span>
      <p className="text-sm font-semibold text-white mb-1.5">{title}</p>
      {description && <p className="text-xs text-zinc-400 mb-3">{description}</p>}
      {progress !== undefined && <div className="h-1 bg-zinc-700 rounded-full mb-3"><div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: \`\${progress}%\` }} /></div>}
    </div>
  );
}`,
  },
  {
    slug: 'testimonial-card', name: 'Testimonial Card', category: 'Cards',
    description: 'Tarjeta de testimonio con cita, estrellas y perfil del autor',
    tags: ['testimonial','review','opinion','cliente','cita','quote'],
    file_name: 'TestimonialCard.tsx', framework: 'react',
    code: `interface TestimonialCardProps { quote: string; author: string; role?: string; avatar?: string; rating?: number; }

export function TestimonialCard({ quote, author, role, avatar, rating = 5 }: TestimonialCardProps) {
  const initials = author.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="bg-zinc-800/80 border border-white/10 rounded-2xl p-6">
      <div className="text-3xl text-violet-400/40 mb-2 font-serif">"</div>
      <p className="text-sm text-zinc-300 leading-relaxed mb-4">{quote}</p>
      <div className="flex gap-0.5 mb-4">{Array.from({ length: 5 }).map((_, i) => (<svg key={i} className={\`w-4 h-4 \${i < rating ? 'text-amber-400' : 'text-zinc-700'}\`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>))}</div>
      <div className="flex items-center gap-3 border-t border-white/5 pt-4"><div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white">{initials}</div><div><p className="text-sm font-semibold text-white">{author}</p>{role && <p className="text-xs text-zinc-500">{role}</p>}</div></div>
    </div>
  );
}`,
  },

  // ── FORMS ────────────────────────────────────────────────────────────────
  {
    slug: 'login-form', name: 'Login Form', category: 'Forms',
    description: 'Formulario de autenticación completo con diseño oscuro',
    tags: ['form','login','autenticacion','email','password'],
    file_name: 'LoginForm.tsx', framework: 'react',
    code: `import { useState } from 'react';

export function LoginForm({ onSubmit }: { onSubmit?: (email: string, password: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <div className="bg-zinc-800/80 border border-white/10 rounded-2xl p-8 w-full max-w-sm">
      <h2 className="text-xl font-bold text-white mb-6">Iniciar sesión</h2>
      <div className="space-y-4">
        <div><label className="text-xs text-zinc-400 mb-1.5 block">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="usuario@email.com" className="w-full h-10 bg-zinc-700/60 border border-white/10 rounded-xl px-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50" /></div>
        <div><label className="text-xs text-zinc-400 mb-1.5 block">Contraseña</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full h-10 bg-zinc-700/60 border border-white/10 rounded-xl px-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50" /></div>
        <button onClick={() => onSubmit?.(email, password)} className="w-full h-10 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-cyan-500 text-white hover:opacity-90">Entrar</button>
      </div>
    </div>
  );
}`,
  },
  {
    slug: 'search-bar', name: 'Search Bar', category: 'Forms',
    description: 'Barra de búsqueda moderna con icono y focus animado',
    tags: ['form','busqueda','search','input','filtro'],
    file_name: 'SearchBar.tsx', framework: 'react',
    code: `import { Search } from 'lucide-react';
import { useState } from 'react';

export function SearchBar({ placeholder = 'Buscar...', onSearch }: { placeholder?: string; onSearch?: (q: string) => void }) {
  const [query, setQuery] = useState('');
  return (
    <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" /><input type="text" value={query} onChange={e => { setQuery(e.target.value); onSearch?.(e.target.value); }} placeholder={placeholder} className="w-full h-10 bg-zinc-800 border border-white/10 rounded-xl pl-9 pr-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50" /></div>
  );
}`,
  },
  {
    slug: 'newsletter-form', name: 'Newsletter Form', category: 'Forms',
    description: 'Formulario de suscripción compacto con botón inline',
    tags: ['form','newsletter','email','suscripcion','subscribe'],
    file_name: 'NewsletterForm.tsx', framework: 'react',
    code: `import { useState } from 'react';

export function NewsletterForm({ onSubscribe }: { onSubscribe?: (email: string) => void }) {
  const [email, setEmail] = useState('');
  return (
    <div className="bg-zinc-800/80 border border-white/10 rounded-2xl p-6"><div className="text-sm font-bold text-white mb-1">Mantente al día</div><div className="text-xs text-zinc-400 mb-4">Recibe novedades y actualizaciones semanales.</div><div className="flex gap-2"><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" className="flex-1 h-9 bg-zinc-700/60 border border-white/10 rounded-xl px-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50" /><button onClick={() => onSubscribe?.(email)} className="px-4 h-9 rounded-xl text-xs font-semibold bg-violet-600 text-white hover:bg-violet-500">Suscribir</button></div></div>
  );
}`,
  },
  {
    slug: 'otp-input', name: 'OTP Input', category: 'Forms',
    description: 'Input de código OTP con 6 campos y auto-focus',
    tags: ['form','otp','codigo','verificacion','2fa','pin'],
    file_name: 'OTPInput.tsx', framework: 'react',
    code: `import { useRef, useState, KeyboardEvent } from 'react';

export function OTPInput({ length = 6, onComplete }: { length?: number; onComplete?: (code: string) => void }) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const handleChange = (i: number, val: string) => {
    if (!/^[0-9]*$/.test(val)) return;
    const next = [...values]; next[i] = val.slice(-1); setValues(next);
    if (val && i < length - 1) refs.current[i + 1]?.focus();
    if (next.every(v => v) && next.join('').length === length) onComplete?.(next.join(''));
  };
  const handleKeyDown = (i: number, e: KeyboardEvent) => { if (e.key === 'Backspace' && !values[i] && i > 0) refs.current[i - 1]?.focus(); };
  return (
    <div className="flex gap-2">{values.map((val, i) => (<input key={i} ref={el => { refs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1} value={val} onChange={e => handleChange(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)} className="w-11 h-12 rounded-xl border text-center text-base font-bold bg-zinc-800 border-white/10 text-white focus:border-violet-500/70 focus:outline-none" />))}</div>
  );
}`,
  },
  {
    slug: 'tags-input', name: 'Tags Input', category: 'Forms',
    description: 'Input de etiquetas removibles estilo chip con teclado',
    tags: ['tags','chips','etiquetas','input','multiselect','removable'],
    file_name: 'TagsInput.tsx', framework: 'react',
    code: `import { useState, KeyboardEvent } from 'react';

export function TagsInput({ initialTags = [], placeholder = 'Añadir...', onChange }: { initialTags?: string[]; placeholder?: string; onChange?: (tags: string[]) => void }) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [input, setInput] = useState('');
  const addTag = (value: string) => { const tag = value.trim(); if (!tag || tags.includes(tag)) return; const next = [...tags, tag]; setTags(next); onChange?.(next); setInput(''); };
  const removeTag = (tag: string) => { const next = tags.filter(t => t !== tag); setTags(next); onChange?.(next); };
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(input); } if (e.key === 'Backspace' && !input && tags.length) removeTag(tags[tags.length - 1]); };
  return (
    <div className="flex flex-wrap gap-2 p-2.5 bg-zinc-800/80 border border-white/10 rounded-xl focus-within:border-violet-500/40 min-h-[44px]">
      {tags.map(tag => (<span key={tag} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/15 border border-violet-500/25 text-xs text-violet-300 font-medium">{tag}<button onClick={() => removeTag(tag)} className="text-violet-400/50 hover:text-violet-200">×</button></span>))}
      <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={tags.length === 0 ? placeholder : ''} className="flex-1 min-w-[80px] bg-transparent text-sm text-white placeholder:text-zinc-600 outline-none" />
    </div>
  );
}`,
  },

  // ── NAVIGATION ──────────────────────────────────────────────────────────
  {
    slug: 'modern-navbar', name: 'Navbar', category: 'Navigation',
    description: 'Barra de navegación moderna con logo, links y CTA',
    tags: ['navbar','navegacion','header','menu','responsive'],
    file_name: 'Navbar.tsx', framework: 'react',
    code: `interface NavbarProps { brand?: string; links?: { label: string; href: string }[]; onSignIn?: () => void; }

export function Navbar({ brand = 'Orion', links = [], onSignIn }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-zinc-900/80 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="text-base font-bold text-white">{brand}</div>
        <nav className="hidden md:flex items-center gap-6">{links.map(({ label, href }) => (<a key={label} href={href} className="text-sm text-zinc-400 hover:text-white transition-colors">{label}</a>))}</nav>
        <button onClick={onSignIn} className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-violet-600 text-white hover:bg-violet-500">Sign in</button>
      </div>
    </header>
  );
}`,
  },
  {
    slug: 'tab-nav', name: 'Tab Navigation', category: 'Navigation',
    description: 'Navegación por tabs con indicador activo animado',
    tags: ['tabs','navegacion','tab','switch','segmented'],
    file_name: 'TabNav.tsx', framework: 'react',
    code: `import { useState } from 'react';

export function TabNav({ tabs, defaultIndex = 0, onChange }: { tabs: string[]; defaultIndex?: number; onChange?: (i: number) => void }) {
  const [active, setActive] = useState(defaultIndex);
  return (
    <div className="flex bg-zinc-800 rounded-xl p-1 gap-1">{tabs.map((tab, i) => (<button key={tab} onClick={() => { setActive(i); onChange?.(i); }} className={\`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all \${active === i ? 'bg-violet-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}\`}>{tab}</button>))}</div>
  );
}`,
  },
  {
    slug: 'breadcrumb', name: 'Breadcrumb', category: 'Navigation',
    description: 'Indicador de ruta jerárquica con separadores',
    tags: ['breadcrumb','navegacion','ruta','path','migas'],
    file_name: 'Breadcrumb.tsx', framework: 'react',
    code: `interface BreadcrumbProps { items: { label: string; href?: string }[]; }

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1.5 text-sm">{items.map((item, i) => (<span key={item.label} className="flex items-center gap-1.5">{i > 0 && <span className="text-zinc-600">/</span>}{item.href && i < items.length - 1 ? (<a href={item.href} className="text-zinc-400 hover:text-white transition-colors">{item.label}</a>) : (<span className="text-white font-medium">{item.label}</span>)}</span>))}</nav>
  );
}`,
  },

  // ── LAYOUTS ─────────────────────────────────────────────────────────────
  {
    slug: 'hero-section', name: 'Hero Section', category: 'Layouts',
    description: 'Sección hero completa con badge, título gradiente y CTA doble',
    tags: ['hero','landing','layout','seccion','portada'],
    file_name: 'HeroSection.tsx', framework: 'react',
    code: `interface HeroSectionProps { badge?: string; title: string; highlight?: string; subtitle?: string; primaryCta?: string; secondaryCta?: string; onPrimary?: () => void; onSecondary?: () => void; }

export function HeroSection({ badge, title, highlight, subtitle, primaryCta = 'Empezar', secondaryCta = 'Ver demo', onPrimary, onSecondary }: HeroSectionProps) {
  return (
    <section className="flex flex-col items-center text-center py-24 px-4">
      {badge && <div className="inline-block text-xs font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-6">{badge}</div>}
      <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-4">{title} {highlight && <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">{highlight}</span>}</h1>
      {subtitle && <p className="text-lg text-zinc-400 max-w-xl mb-8">{subtitle}</p>}
      <div className="flex gap-3"><button onClick={onPrimary} className="px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-cyan-500 text-white hover:opacity-90">{primaryCta}</button><button onClick={onSecondary} className="px-6 py-3 rounded-xl text-sm font-semibold border border-white/10 text-zinc-300 hover:bg-white/5">{secondaryCta}</button></div>
    </section>
  );
}`,
  },
  {
    slug: 'feature-grid', name: 'Feature Grid', category: 'Layouts',
    description: 'Grid de características con iconos emoji y grid responsive',
    tags: ['layout','features','grid','landing','caracteristicas'],
    file_name: 'FeatureGrid.tsx', framework: 'react',
    code: `interface Feature { icon: string; title: string; description: string; }
interface FeatureGridProps { features: Feature[]; columns?: 2 | 3 | 4; }

export function FeatureGrid({ features, columns = 3 }: FeatureGridProps) {
  const colClass = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' }[columns];
  return (
    <div className={\`grid \${colClass} gap-4\`}>{features.map(({ icon, title, description }) => (<div key={title} className="bg-zinc-800/80 border border-white/10 rounded-2xl p-5 hover:border-violet-500/30 transition-all"><div className="text-3xl mb-3">{icon}</div><div className="text-sm font-semibold text-white mb-1.5">{title}</div><div className="text-xs text-zinc-400 leading-relaxed">{description}</div></div>))}</div>
  );
}`,
  },
  {
    slug: 'cta-section', name: 'CTA Section', category: 'Layouts',
    description: 'Sección de llamada a la acción con gradiente y CTA centrado',
    tags: ['cta','llamada','accion','layout','conversion'],
    file_name: 'CTASection.tsx', framework: 'react',
    code: `interface CTASectionProps { title: string; subtitle?: string; cta?: string; onCta?: () => void; }

export function CTASection({ title, subtitle, cta = 'Comenzar gratis', onCta }: CTASectionProps) {
  return (
    <section className="py-20 px-4"><div className="max-w-2xl mx-auto text-center bg-gradient-to-br from-violet-900/60 to-cyan-900/30 border border-violet-500/20 rounded-3xl py-16 px-8"><h2 className="text-3xl font-bold text-white mb-3">{title}</h2>{subtitle && <p className="text-zinc-400 mb-8">{subtitle}</p>}<button onClick={onCta} className="px-8 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-cyan-500 text-white hover:opacity-90">{cta}</button></div></section>
  );
}`,
  },

  // ── UI ELEMENTS ──────────────────────────────────────────────────────────
  {
    slug: 'animated-badge', name: 'Animated Badge', category: 'UI Elements',
    description: 'Badge con punto pulsante para estados en tiempo real',
    tags: ['badge','etiqueta','animado','pulse','estado','live'],
    file_name: 'AnimatedBadge.tsx', framework: 'react',
    code: `type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'purple';
const VARIANTS: Record<BadgeVariant, string> = { success: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', warning: 'text-amber-400 bg-amber-400/10 border-amber-400/20', error: 'text-red-400 bg-red-400/10 border-red-400/20', info: 'text-blue-400 bg-blue-400/10 border-blue-400/20', purple: 'text-violet-400 bg-violet-400/10 border-violet-400/20' };

export function AnimatedBadge({ label, variant = 'success' }: { label: string; variant?: BadgeVariant }) {
  return (<span className={\`inline-flex items-center gap-1.5 text-xs font-semibold border rounded-full px-3 py-1 \${VARIANTS[variant]}\`}><span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />{label}</span>);
}`,
  },
  {
    slug: 'progress-bar', name: 'Progress Bar', category: 'UI Elements',
    description: 'Barra de progreso con gradiente y etiqueta de skill',
    tags: ['progress','progreso','barra','carga','porcentaje'],
    file_name: 'ProgressBar.tsx', framework: 'react',
    code: `interface ProgressBarProps { label: string; value: number; gradient?: string; }

export function ProgressBar({ label, value, gradient = 'from-violet-500 to-cyan-500' }: ProgressBarProps) {
  return (
    <div><div className="flex justify-between text-xs mb-1.5"><span className="text-zinc-300 font-medium">{label}</span><span className="text-zinc-400">{value}%</span></div><div className="h-2 bg-zinc-700 rounded-full overflow-hidden"><div className={\`h-full bg-gradient-to-r \${gradient} rounded-full transition-all duration-700\`} style={{ width: \`\${value}%\` }} /></div></div>
  );
}`,
  },
  {
    slug: 'avatar-group', name: 'Avatar Group', category: 'UI Elements',
    description: 'Grupo de avatares apilados con contador de excedente',
    tags: ['avatar','grupo','usuarios','team','equipo','social'],
    file_name: 'AvatarGroup.tsx', framework: 'react',
    code: `interface AvatarGroupProps { users: { name: string; avatar?: string; color?: string }[]; max?: number; size?: 'sm' | 'md' | 'lg'; }
const SIZES = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base' };

export function AvatarGroup({ users, max = 5, size = 'md' }: AvatarGroupProps) {
  const visible = users.slice(0, max);
  const rest = users.length - max;
  return (
    <div className="flex items-center gap-2"><div className="flex -space-x-2.5">{visible.map((u, i) => (<div key={i} className={\`\${SIZES[size]} rounded-full border-2 border-zinc-900 flex items-center justify-center font-bold text-white overflow-hidden\`} style={{ background: u.color ?? '#7c3aed' }}>{u.avatar ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" /> : u.name.slice(0, 2).toUpperCase()}</div>))}{rest > 0 && <div className={\`\${SIZES[size]} rounded-full border-2 border-zinc-900 bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300\`}>+{rest}</div>}</div></div>
  );
}`,
  },
  {
    slug: 'notification-toast', name: 'Notification Toast', category: 'UI Elements',
    description: 'Toast de notificación con icono, título y descripción',
    tags: ['notification','toast','alerta','mensaje','feedback'],
    file_name: 'NotificationToast.tsx', framework: 'react',
    code: `import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';
const CONFIG = { success: { icon: CheckCircle, bg: 'bg-emerald-500/15', color: 'text-emerald-400' }, error: { icon: XCircle, bg: 'bg-red-500/15', color: 'text-red-400' }, warning: { icon: AlertCircle, bg: 'bg-amber-500/15', color: 'text-amber-400' }, info: { icon: Info, bg: 'bg-blue-500/15', color: 'text-blue-400' } };

export function NotificationToast({ type = 'success', title, description, onClose }: { type?: ToastType; title: string; description?: string; onClose?: () => void }) {
  const { icon: Icon, bg, color } = CONFIG[type];
  return (<div className="bg-zinc-800 border border-white/10 rounded-xl p-4 flex items-start gap-3 shadow-xl max-w-sm"><div className={\`w-9 h-9 rounded-lg \${bg} flex items-center justify-center flex-shrink-0\`}><Icon className={\`w-5 h-5 \${color}\`} /></div><div className="flex-1"><div className="text-sm font-semibold text-white">{title}</div>{description && <div className="text-xs text-zinc-400 mt-0.5">{description}</div>}</div>{onClose && <button onClick={onClose} className="text-zinc-500 hover:text-white">×</button>}</div>);
}`,
  },
  {
    slug: 'toggle-switch', name: 'Toggle Switch', category: 'UI Elements',
    description: 'Toggle animado con transición suave para configuraciones on/off',
    tags: ['toggle','switch','interruptor','on','off','settings','boolean'],
    file_name: 'ToggleSwitch.tsx', framework: 'react',
    code: `import { useState } from 'react';

export function ToggleSwitch({ label, defaultChecked = false, onChange, disabled = false }: { label?: string; defaultChecked?: boolean; onChange?: (checked: boolean) => void; disabled?: boolean }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <div className="flex items-center gap-3"><button onClick={() => { if (disabled) return; const next = !on; setOn(next); onChange?.(next); }} disabled={disabled} className={\`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none \${on ? 'bg-violet-600' : 'bg-zinc-700'} \${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}\`} role="switch" aria-checked={on}><div className={\`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 \${on ? 'translate-x-6' : 'translate-x-1'}\`} /></button>{label && <span className={\`text-sm \${on ? 'text-white' : 'text-zinc-400'} transition-colors\`}>{label}</span>}</div>
  );
}`,
  },
  {
    slug: 'rating-stars', name: 'Rating Stars', category: 'UI Elements',
    description: 'Componente de calificación interactivo con hover animado',
    tags: ['rating','stars','estrellas','calificacion','review','score'],
    file_name: 'RatingStars.tsx', framework: 'react',
    code: `import { useState } from 'react';

export function RatingStars({ defaultRating = 0, max = 5, onChange, readOnly = false }: { defaultRating?: number; max?: number; onChange?: (r: number) => void; readOnly?: boolean }) {
  const [rating, setRating] = useState(defaultRating);
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">{Array.from({ length: max }).map((_, i) => { const star = i + 1; return (<button key={star} type="button" disabled={readOnly} onMouseEnter={() => !readOnly && setHover(star)} onMouseLeave={() => !readOnly && setHover(0)} onClick={() => { if (!readOnly) { setRating(star); onChange?.(star); } }} className={\`transition-transform \${readOnly ? 'cursor-default' : 'hover:scale-125 active:scale-110'}\`}><svg className={\`w-7 h-7 transition-colors \${star <= (hover || rating) ? 'text-amber-400' : 'text-zinc-700'}\`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg></button>); })}</div>
  );
}`,
  },
  {
    slug: 'accordion', name: 'Accordion', category: 'UI Elements',
    description: 'Acordeón colapsable con animación suave tipo FAQ',
    tags: ['accordion','collapse','faq','expandir','plegar','pregunta'],
    file_name: 'Accordion.tsx', framework: 'react',
    code: `import { useState } from 'react';

export function Accordion({ items, allowMultiple = false }: { items: { question: string; answer: string }[]; allowMultiple?: boolean }) {
  const [open, setOpen] = useState<Set<number>>(new Set());
  const toggle = (i: number) => setOpen(prev => { const next = new Set(allowMultiple ? prev : []); if (prev.has(i)) next.delete(i); else next.add(i); return next; });
  return (
    <div className="space-y-2">{items.map((item, i) => (<div key={i} className="bg-zinc-800/80 border border-white/10 rounded-xl overflow-hidden"><button onClick={() => toggle(i)} className="w-full flex items-center justify-between px-4 py-3.5 text-left gap-3"><span className="text-sm font-semibold text-white">{item.question}</span><svg className={\`w-4 h-4 flex-shrink-0 transition-transform duration-300 \${open.has(i) ? 'rotate-180 text-violet-400' : 'text-zinc-500'}\`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></button>{open.has(i) && <div className="px-4 pb-4 border-t border-white/5"><p className="text-sm text-zinc-400 pt-3 leading-relaxed">{item.answer}</p></div>}</div>))}</div>
  );
}`,
  },
  {
    slug: 'stepper', name: 'Stepper', category: 'UI Elements',
    description: 'Indicador de pasos multi-etapa para wizards y onboarding',
    tags: ['stepper','pasos','wizard','onboarding','progreso','steps'],
    file_name: 'Stepper.tsx', framework: 'react',
    code: `import { useState } from 'react';

export function Stepper({ steps, initialStep = 0, onStepChange }: { steps: string[]; initialStep?: number; onStepChange?: (step: number) => void }) {
  const [current, setCurrent] = useState(initialStep);
  const goTo = (i: number) => { setCurrent(i); onStepChange?.(i); };
  return (
    <div><div className="flex items-center">{steps.map((step, i) => (<div key={step} className="flex items-center flex-1 last:flex-none"><button onClick={() => goTo(i)} className={\`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 z-10 transition-all \${i < current ? 'bg-violet-600 border-violet-600 text-white' : i === current ? 'border-violet-500 text-violet-400 bg-violet-500/10' : 'border-zinc-700 text-zinc-600'}\`}>{i < current ? '✓' : i + 1}</button>{i < steps.length - 1 && <div className={\`flex-1 h-0.5 transition-colors mx-1 \${i < current ? 'bg-violet-600' : 'bg-zinc-700'}\`} />}</div>))}</div><div className="flex mt-2">{steps.map((step, i) => (<div key={step} className="flex-1"><span className={\`text-xs block text-center transition-colors \${i === current ? 'text-white font-semibold' : i < current ? 'text-violet-400' : 'text-zinc-600'}\`}>{step}</span></div>))}</div></div>
  );
}`,
  },

  // ── ANIMATIONS ───────────────────────────────────────────────────────────
  {
    slug: 'typewriter', name: 'Typewriter Text', category: 'Animations',
    description: 'Efecto máquina de escribir con borrado y loop infinito',
    tags: ['typewriter','texto','animacion','escritura','loop'],
    file_name: 'TypewriterText.tsx', framework: 'react',
    code: `import { useState, useEffect } from 'react';

export function TypewriterText({ words, prefix = 'Build better', speed = 90, deleteSpeed = 50, pauseMs = 1200 }: { words: string[]; prefix?: string; speed?: number; deleteSpeed?: number; pauseMs?: number }) {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const word = words[idx];
    if (!deleting && displayed === word) { const t = setTimeout(() => setDeleting(true), pauseMs); return () => clearTimeout(t); }
    if (deleting && displayed === '') { setDeleting(false); setIdx(i => (i + 1) % words.length); return; }
    const t = setTimeout(() => setDisplayed(deleting ? displayed.slice(0, -1) : word.slice(0, displayed.length + 1)), deleting ? deleteSpeed : speed);
    return () => clearTimeout(t);
  }, [displayed, deleting, idx, words, speed, deleteSpeed, pauseMs]);
  return (<p className="text-2xl font-bold text-white">{prefix} <span className="text-violet-400">{displayed}</span><span className="animate-pulse text-violet-400">|</span></p>);
}`,
  },
  {
    slug: 'floating-card', name: 'Floating Card', category: 'Animations',
    description: 'Tarjeta con animación de levitación continua',
    tags: ['card','flotante','animacion','levitacion','hover'],
    file_name: 'FloatingCard.tsx', framework: 'react',
    code: `export function FloatingCard({ emoji = '🚀', title, subtitle }: { emoji?: string; title: string; subtitle?: string }) {
  return (
    <>
      <style>{\`@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }\`}</style>
      <div style={{ animation: 'float 3s ease-in-out infinite' }}>
        <div className="bg-gradient-to-br from-violet-900/80 to-cyan-900/40 border border-violet-500/30 rounded-2xl p-6 text-center shadow-xl shadow-violet-500/20">
          <div className="text-4xl mb-3">{emoji}</div>
          <div className="text-sm font-bold text-white">{title}</div>
          {subtitle && <div className="text-xs text-zinc-400 mt-1">{subtitle}</div>}
        </div>
      </div>
    </>
  );
}`,
  },
  {
    slug: 'skeleton-loader', name: 'Skeleton Loader', category: 'Animations',
    description: 'Placeholder animado tipo skeleton para estados de carga',
    tags: ['skeleton','loader','carga','placeholder','shimmer'],
    file_name: 'SkeletonLoader.tsx', framework: 'react',
    code: `export function SkeletonLoader() {
  return (
    <div className="space-y-3 w-full max-w-sm">
      <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-zinc-700 animate-pulse flex-shrink-0" /><div className="flex-1 space-y-1.5"><div className="h-2.5 bg-zinc-700 rounded-full animate-pulse w-3/4" /><div className="h-2 bg-zinc-700/60 rounded-full animate-pulse w-1/2" /></div></div>
      <div className="h-2 bg-zinc-700 rounded-full animate-pulse" />
      <div className="h-2 bg-zinc-700 rounded-full animate-pulse w-5/6" />
      <div className="h-2 bg-zinc-700/60 rounded-full animate-pulse w-4/6" />
      <div className="h-20 bg-zinc-700/40 rounded-xl animate-pulse" />
    </div>
  );
}`,
  },
  {
    slug: 'glow-border-card', name: 'Glow Border Card', category: 'Animations',
    description: 'Tarjeta con borde de gradiente animado en loop',
    tags: ['card','borde','glow','gradiente','animado','aurora'],
    file_name: 'GlowBorderCard.tsx', framework: 'react',
    code: `interface GlowBorderCardProps { title: string; subtitle?: string; children?: React.ReactNode; }

export function GlowBorderCard({ title, subtitle, children }: GlowBorderCardProps) {
  return (
    <>
      <style>{\`@keyframes border-flow { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }\`}</style>
      <div className="relative p-[1.5px] rounded-2xl" style={{ background: 'linear-gradient(90deg, #7c3aed, #06b6d4, #db2777, #7c3aed)', backgroundSize: '300% 100%', animation: 'border-flow 4s linear infinite' }}>
        <div className="bg-zinc-900 rounded-2xl p-6"><div className="text-base font-bold text-white">{title}</div>{subtitle && <div className="text-xs text-zinc-400 mt-1">{subtitle}</div>}{children}</div>
      </div>
    </>
  );
}`,
  },

  // ── LOADERS ──────────────────────────────────────────────────────────────
  {
    slug: 'gradient-spinner', name: 'Gradient Spinner', category: 'Loaders',
    description: 'Spinner circular con gradiente cónico violet-cyan',
    tags: ['loader','spinner','cargando','animado','gradiente','circular'],
    file_name: 'GradientSpinner.tsx', framework: 'react',
    code: `type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
const SIZES: Record<SpinnerSize, string> = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12', xl: 'w-16 h-16' };

export function GradientSpinner({ size = 'md', className = '' }: { size?: SpinnerSize; className?: string }) {
  return (
    <div className={\`relative animate-spin \${SIZES[size]} \${className}\`}>
      <div className="absolute inset-0 rounded-full" style={{ background: 'conic-gradient(from 0deg, transparent 0%, #7c3aed 40%, #06b6d4 70%, transparent 100%)' }} />
      <div className="absolute inset-[3px] bg-background rounded-full" />
    </div>
  );
}`,
  },
  {
    slug: 'dots-loader', name: 'Dots Loader', category: 'Loaders',
    description: 'Loader de puntos con variante bounce y wave',
    tags: ['loader','dots','puntos','bounce','wave','cargando'],
    file_name: 'DotsLoader.tsx', framework: 'react',
    code: `type DotsVariant = 'bounce' | 'wave';

export function DotsLoader({ variant = 'bounce', color = 'bg-violet-500', count = 3 }: { variant?: DotsVariant; color?: string; count?: number }) {
  return (
    <div className="flex gap-2 items-center">{Array.from({ length: count }).map((_, i) => (<div key={i} className={\`w-3 h-3 rounded-full \${color} \${variant === 'bounce' ? 'animate-bounce' : 'animate-pulse'}\`} style={{ animationDelay: \`\${i * 0.15}s\` }} />))}</div>
  );
}`,
  },
  {
    slug: 'bar-loader', name: 'Bar Loader', category: 'Loaders',
    description: 'Barra de carga indeterminada con efecto sweep',
    tags: ['loader','barra','progreso','sweep','indeterminado','cargando'],
    file_name: 'BarLoader.tsx', framework: 'react',
    code: `export function BarLoader({ value, label, className = '' }: { value?: number; label?: string; className?: string }) {
  const indeterminate = value === undefined;
  return (
    <div className={\`space-y-1.5 \${className}\`}>
      {label !== undefined && (<div className="flex justify-between items-center text-xs text-zinc-400"><span>{label}</span>{indeterminate ? <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-700 border-t-violet-500 animate-spin" /> : <span className="text-cyan-400 font-medium">{value}%</span>}</div>)}
      <div className="relative h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        {indeterminate ? (<><style>{\`@keyframes bar-sweep { 0% { transform: translateX(-100%); } 100% { transform: translateX(350%); } }\`}</style><div className="absolute h-full w-1/2 bg-gradient-to-r from-violet-600 via-cyan-400 to-violet-600 rounded-full" style={{ animation: 'bar-sweep 1.4s ease-in-out infinite' }} /></>) : (<div className="h-full bg-gradient-to-r from-cyan-600 to-blue-500 rounded-full transition-all duration-500" style={{ width: \`\${value}%\` }} />)}
      </div>
    </div>
  );
}`,
  },
  {
    slug: 'pulse-ring-loader', name: 'Pulse Ring Loader', category: 'Loaders',
    description: 'Loader de anillos concéntricos expandiéndose tipo radar',
    tags: ['loader','pulse','ring','anillos','ondas','ping','radar'],
    file_name: 'PulseRingLoader.tsx', framework: 'react',
    code: `type RingColor = 'violet' | 'cyan' | 'emerald' | 'rose';
const COLORS: Record<RingColor, { border: string; center: string; shadow: string }> = { violet: { border: 'border-violet-500', center: 'from-violet-500 to-violet-700', shadow: 'shadow-violet-500/40' }, cyan: { border: 'border-cyan-400', center: 'from-cyan-400 to-blue-600', shadow: 'shadow-cyan-500/30' }, emerald: { border: 'border-emerald-400', center: 'from-emerald-400 to-teal-600', shadow: 'shadow-emerald-500/30' }, rose: { border: 'border-rose-400', center: 'from-rose-400 to-pink-600', shadow: 'shadow-rose-500/30' } };

export function PulseRingLoader({ color = 'violet', size = 56, rings = 3 }: { color?: RingColor; size?: number; rings?: number }) {
  const c = COLORS[color];
  const dotSize = Math.round(size * 0.43);
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>{Array.from({ length: rings }).map((_, i) => { const ringSize = dotSize + (size - dotSize) * ((i + 1) / rings); return (<div key={i} className={\`absolute rounded-full border \${c.border} animate-ping\`} style={{ width: ringSize, height: ringSize, animationDuration: '1.5s', animationDelay: \`\${i * 0.3}s\`, opacity: 0.7 - i * 0.2 }} />); })}<div className={\`rounded-full bg-gradient-to-br \${c.center} shadow-lg \${c.shadow} z-10\`} style={{ width: dotSize, height: dotSize }} /></div>
  );
}`,
  },
  {
    slug: 'orbit-loader', name: 'Orbit Loader', category: 'Loaders',
    description: 'Loader estilo sistema solar con puntos orbitando un núcleo',
    tags: ['loader','orbit','orbita','planeta','girar','solar','animacion'],
    file_name: 'OrbitLoader.tsx', framework: 'react',
    code: `export function OrbitLoader() {
  return (
    <>
      <style>{\`@keyframes orbit-a { from { transform: rotate(0deg) translateX(24px) rotate(0deg); } to { transform: rotate(360deg) translateX(24px) rotate(-360deg); } } @keyframes orbit-b { from { transform: rotate(90deg) translateX(16px) rotate(-90deg); } to { transform: rotate(450deg) translateX(16px) rotate(-450deg); } }\`}</style>
      <div className="relative w-16 h-16 flex items-center justify-center"><div className="absolute w-full h-full rounded-full border border-zinc-700/50" /><div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 shadow-lg shadow-violet-500/50 z-10" /><div className="absolute w-3.5 h-3.5 rounded-full bg-cyan-400 shadow shadow-cyan-400/60" style={{ animation: 'orbit-a 1.1s linear infinite' }} /><div className="absolute w-2 h-2 rounded-full bg-pink-400 shadow shadow-pink-400/60" style={{ animation: 'orbit-b 0.75s linear infinite' }} /></div>
    </>
  );
}`,
  },

  // ── DATA DISPLAY ─────────────────────────────────────────────────────────
  {
    slug: 'stat-counter', name: 'Stat Counter', category: 'Data Display',
    description: 'Contador animado que incrementa hasta el valor objetivo',
    tags: ['contador','numero','animado','estadistica','kpi','count'],
    file_name: 'StatCounter.tsx', framework: 'react',
    code: `import { useState, useEffect } from 'react';

export function StatCounter({ target, label, change, duration = 1000, prefix = '', suffix = '' }: { target: number; label: string; change?: string; duration?: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const steps = 60; const step = target / steps; const interval = duration / steps;
    const timer = setInterval(() => { setCount(c => { const next = c + step; if (next >= target) { clearInterval(timer); return target; } return next; }); }, interval);
    return () => clearInterval(timer);
  }, [target, duration]);
  return (<div className="text-center space-y-1"><div className="text-4xl font-black text-white tabular-nums">{prefix}{Math.floor(count).toLocaleString()}{suffix}</div><div className="text-sm text-zinc-500">{label}</div>{change && <div className="text-xs text-emerald-400 font-medium">{change}</div>}</div>);
}`,
  },
  {
    slug: 'donut-chart', name: 'Donut Chart', category: 'Data Display',
    description: 'Gráfica de dona SVG con leyenda y animación de entrada',
    tags: ['grafica','donut','pie','chart','porcentaje','svg'],
    file_name: 'DonutChart.tsx', framework: 'react',
    code: `interface DonutSegment { label: string; value: number; color: string; }

export function DonutChart({ segments, size = 120, strokeWidth = 18 }: { segments: DonutSegment[]; size?: number; strokeWidth?: number }) {
  const r = (size - strokeWidth) / 2; const cx = size / 2; const cy = size / 2; const circumference = 2 * Math.PI * r; let cumulative = 0;
  return (
    <div className="flex items-center gap-5"><svg width={size} height={size} viewBox={\`0 0 \${size} \${size}\`}>{segments.map(s => { const dash = (s.value / 100) * circumference; const gap = circumference - dash; const offset = circumference - (cumulative / 100) * circumference; cumulative += s.value; return (<circle key={s.label} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={strokeWidth} strokeDasharray={\`\${dash} \${gap}\`} strokeDashoffset={offset} strokeLinecap="round" />); })}<text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={12} fill="white" fontWeight="bold">100%</text></svg><div className="space-y-2">{segments.map(s => (<div key={s.label} className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} /><span className="text-sm text-zinc-400">{s.label}</span><span className="text-sm text-white font-semibold ml-auto pl-3">{s.value}%</span></div>))}</div></div>
  );
}`,
  },
  {
    slug: 'timeline', name: 'Timeline', category: 'Data Display',
    description: 'Línea de tiempo vertical con eventos y colores personalizables',
    tags: ['timeline','linea','tiempo','historial','eventos','log'],
    file_name: 'Timeline.tsx', framework: 'react',
    code: `interface TimelineEvent { label: string; time: string; color?: string; description?: string; }

export function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="space-y-0">{events.map((event, i) => (<div key={event.label} className="flex gap-3"><div className="flex flex-col items-center"><div className="w-3 h-3 rounded-full flex-shrink-0 mt-1 ring-2 ring-zinc-900" style={{ background: event.color ?? '#7c3aed' }} />{i < events.length - 1 && <div className="w-px flex-1 bg-zinc-700/60 mt-1" style={{ minHeight: 24 }} />}</div><div className="pb-5"><p className="text-sm font-semibold text-white leading-none">{event.label}</p>{event.description && <p className="text-xs text-zinc-400 mt-0.5">{event.description}</p>}<p className="text-xs text-zinc-600 mt-1">{event.time}</p></div></div>))}</div>
  );
}`,
  },
  {
    slug: 'bar-chart', name: 'Bar Chart', category: 'Data Display',
    description: 'Gráfica de barras verticales animada con datos personalizables',
    tags: ['grafica','barra','bar','chart','datos','estadistica','semana'],
    file_name: 'BarChart.tsx', framework: 'react',
    code: `interface BarChartDataPoint { label: string; value: number; highlight?: boolean; }

export function BarChart({ data, height = 120, primaryColor = 'from-violet-700 to-violet-500', highlightColor = 'from-cyan-600 to-cyan-400', showValues = false }: { data: BarChartDataPoint[]; height?: number; primaryColor?: string; highlightColor?: string; showValues?: boolean }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div><div className="flex items-end gap-1.5 mb-2" style={{ height }}>{data.map(d => (<div key={d.label} className="flex-1 flex flex-col items-center justify-end gap-1">{showValues && <span className="text-[10px] text-zinc-500">{d.value}</span>}<div className={\`w-full rounded-t-md bg-gradient-to-t transition-all duration-700 \${d.highlight ? highlightColor : primaryColor}\`} style={{ height: \`\${(d.value / max) * 100}%\`, minHeight: 4 }} /></div>))}</div><div className="flex gap-1.5">{data.map(d => (<div key={d.label} className="flex-1 text-center text-[10px] text-zinc-600 truncate">{d.label}</div>))}</div></div>
  );
}`,
  },
  {
    slug: 'code-block', name: 'Code Block', category: 'Data Display',
    description: 'Bloque de código estilizado con cabecera macOS y botón copiar',
    tags: ['codigo','code','snippet','syntax','copiar','monospace','bloque'],
    file_name: 'CodeBlock.tsx', framework: 'react',
    code: `import { useState } from 'react';

export function CodeBlock({ code, language = 'tsx', fileName, showLineNumbers = false }: { code: string; language?: string; fileName?: string; showLineNumbers?: boolean }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const lines = code.split('\\n');
  return (
    <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-xl"><div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-zinc-800/50"><div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500/70" /><div className="w-3 h-3 rounded-full bg-amber-500/70" /><div className="w-3 h-3 rounded-full bg-emerald-500/70" /></div><span className="text-xs text-zinc-500 font-mono">{fileName ?? language}</span><button onClick={handleCopy} className={\`flex items-center gap-1.5 text-xs font-medium transition-colors \${copied ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}\`}>{copied ? '✓ Copiado' : 'Copiar'}</button></div><div className="p-4 overflow-x-auto"><pre className="text-sm font-mono leading-relaxed">{lines.map((line, i) => (<div key={i} className="flex gap-4">{showLineNumbers && <span className="select-none text-zinc-600 w-6 text-right flex-shrink-0">{i + 1}</span>}<span className="text-zinc-200">{line}</span></div>))}</pre></div></div>
  );
}`,
  },
];

async function seed() {
  console.log(`\nSeeding ${COMPONENTS.length} system components...\n`);
  let inserted = 0;
  let skipped = 0;

  for (const comp of COMPONENTS) {
    try {
      const result = await pool.query(
        `INSERT INTO components (name, description, category, code, props, framework, tags, is_public, is_system, slug, file_name, creator_id)
         VALUES ($1, $2, $3, $4, '[]', $5, $6, true, true, $7, $8, NULL)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [comp.name, comp.description, comp.category, comp.code, comp.framework, comp.tags, comp.slug, comp.file_name]
      );
      if (result.rowCount > 0) {
        console.log(`  ✓  ${comp.slug}`);
        inserted++;
      } else {
        console.log(`  ~  ${comp.slug} (ya existe, omitido)`);
        skipped++;
      }
    } catch (err) {
      console.error(`  ✗  ${comp.slug}: ${err.message}`);
    }
  }

  console.log(`\nListo: ${inserted} insertados, ${skipped} omitidos.\n`);
}

seed()
  .catch(err => { console.error('Error fatal:', err.message); process.exit(1); })
  .finally(() => pool.end());
