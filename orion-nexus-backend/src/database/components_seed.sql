-- ============================================================
-- ORION NEXUS STUDIO — Seed de Componentes de Biblioteca
-- Ejecutar DESPUÉS de migrate.js para tener las columnas slug/file_name/is_system
-- ============================================================

-- Evita duplicados al re-ejecutar: solo inserta si el slug no existe
INSERT INTO components (name, description, category, code, props, framework, tags, is_public, is_system, slug, file_name, creator_id)
SELECT * FROM (VALUES

  -- ── BUTTONS ──────────────────────────────────────────────────────────────
  ('Gradient Button',
   'Botón CTA con gradiente animado violeta-cyan',
   'Buttons',
   E'export function GradientButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {\n  return (\n    <button\n      onClick={onClick}\n      className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm\n        bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90\n        transition-all shadow-lg shadow-violet-500/30"\n    >\n      {children}\n    </button>\n  );\n}',
   '[]', 'react', ARRAY['button','gradient','cta','primary','violeta','cyan'], true, true, 'gradient-button', 'GradientButton.tsx', NULL),

  ('Glow Button',
   'Botón con efecto de brillo neon al hacer hover',
   'Buttons',
   E'export function GlowButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {\n  return (\n    <button\n      onClick={onClick}\n      className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm\n        bg-violet-600 hover:bg-violet-500 transition-all\n        shadow-[0_0_20px_rgba(139,92,246,0.5)]\n        hover:shadow-[0_0_30px_rgba(139,92,246,0.7)]"\n    >\n      {children}\n    </button>\n  );\n}',
   '[]', 'react', ARRAY['button','glow','efecto','hover','violeta'], true, true, 'glow-button', 'GlowButton.tsx', NULL),

  ('Shimmer Button',
   'Botón con animación de destello tipo shimmer',
   'Buttons',
   E'export function ShimmerButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {\n  return (\n    <div className="relative inline-block overflow-hidden rounded-xl">\n      <button onClick={onClick} className="relative px-6 py-2.5 bg-zinc-800 text-white font-semibold text-sm border border-white/10 rounded-xl z-10">{children}</button>\n      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none" />\n    </div>\n  );\n}',
   '[]', 'react', ARRAY['button','shimmer','animacion','brillo','premium'], true, true, 'shimmer-button', 'ShimmerButton.tsx', NULL),

  ('Outline Button',
   'Botón outline con borde violeta y hover sutil',
   'Buttons',
   E'export function OutlineButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {\n  return (\n    <button onClick={onClick} className="px-6 py-2.5 rounded-xl text-violet-400 font-semibold text-sm border border-violet-500/50 hover:bg-violet-500/10 transition-all">{children}</button>\n  );\n}',
   '[]', 'react', ARRAY['button','outline','borde','secondary','secundario'], true, true, 'outline-button', 'OutlineButton.tsx', NULL),

  ('Icon Button',
   'Botón con icono y texto en gradiente rosa-rojo',
   'Buttons',
   E'import { Zap } from ''lucide-react'';\n\nexport function IconButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {\n  return (\n    <button onClick={onClick} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-pink-600 to-rose-500 hover:opacity-90 transition-all">\n      <Zap className="w-4 h-4" />\n      {children}\n    </button>\n  );\n}',
   '[]', 'react', ARRAY['button','icon','icono','rosa','action'], true, true, 'icon-button', 'IconButton.tsx', NULL),

  ('Ripple Button',
   'Botón con efecto onda al hacer click estilo Material',
   'Animations',
   E'import { useState, MouseEvent } from ''react'';\n\ninterface Ripple { id: number; x: number; y: number; }\n\nexport function RippleButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {\n  const [ripples, setRipples] = useState<Ripple[]>([]);\n  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {\n    const rect = e.currentTarget.getBoundingClientRect();\n    const id = Date.now();\n    setRipples(r => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);\n    setTimeout(() => setRipples(r => r.filter(rr => rr.id !== id)), 600);\n    onClick?.();\n  };\n  return (\n    <button onClick={handleClick} className="relative overflow-hidden px-6 py-2.5 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-500">\n      {ripples.map(r => (<span key={r.id} className="absolute rounded-full bg-white/30 animate-ping pointer-events-none" style={{ left: r.x - 20, top: r.y - 20, width: 40, height: 40, animationDuration: ''0.6s'' }} />))}\n      {children}\n    </button>\n  );\n}',
   '[]', 'react', ARRAY['button','ripple','animacion','click','onda','material'], true, true, 'ripple-button', 'RippleButton.tsx', NULL),

  -- ── CARDS ────────────────────────────────────────────────────────────────
  ('Stats Card',
   'Tarjeta de métrica con indicador de tendencia y barra de progreso',
   'Cards',
   E'interface StatsCardProps { label: string; value: string; trend: string; trendUp?: boolean; progress: number; }\n\nexport function StatsCard({ label, value, trend, trendUp = true, progress }: StatsCardProps) {\n  return (\n    <div className="bg-zinc-800/80 border border-white/10 rounded-2xl p-5">\n      <div className="flex items-center justify-between mb-3">\n        <span className="text-xs text-zinc-400">{label}</span>\n        <span className={`text-xs px-2 py-0.5 rounded-full ${trendUp ? ''text-emerald-400 bg-emerald-400/10'' : ''text-red-400 bg-red-400/10''}`}>{trend}</span>\n      </div>\n      <div className="text-2xl font-bold text-white mb-3">{value}</div>\n      <div className="h-1 bg-zinc-700 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full" style={{ width: `${progress}%` }} /></div>\n    </div>\n  );\n}',
   '[]', 'react', ARRAY['card','estadisticas','stats','metrica','dashboard'], true, true, 'stats-card', 'StatsCard.tsx', NULL),

  ('Pricing Card',
   'Tarjeta de plan de precios con gradiente oscuro y CTA',
   'Cards',
   E'interface PricingCardProps { plan: string; price: string; period?: string; features: string[]; onSelect?: () => void; highlighted?: boolean; }\n\nexport function PricingCard({ plan, price, period = ''/mes'', features, onSelect, highlighted = false }: PricingCardProps) {\n  return (\n    <div className={`rounded-2xl p-6 text-center border ${highlighted ? ''bg-gradient-to-b from-violet-950 to-zinc-900 border-violet-500/30'' : ''bg-zinc-800/80 border-white/10''}`}>\n      <div className="text-xs text-violet-400 font-semibold uppercase tracking-wider mb-2">{plan}</div>\n      <div className="text-4xl font-bold text-white mb-0.5">{price}</div>\n      <div className="text-xs text-zinc-400 mb-5">{period}</div>\n      <ul className="text-left space-y-2 mb-5">{features.map(f => (<li key={f} className="flex items-center gap-2 text-sm text-zinc-300"><span className="text-emerald-400">✓</span> {f}</li>))}</ul>\n      <button onClick={onSelect} className="w-full py-2.5 rounded-xl text-sm font-semibold bg-violet-600 text-white hover:bg-violet-500 transition-colors">Empezar</button>\n    </div>\n  );\n}',
   '[]', 'react', ARRAY['card','pricing','precio','plan','suscripcion'], true, true, 'pricing-card', 'PricingCard.tsx', NULL),

  ('Profile Card',
   'Tarjeta de perfil de usuario con stats sociales',
   'Cards',
   E'interface ProfileCardProps { name: string; role: string; avatar?: string; posts: number; followers: number; following: number; }\n\nexport function ProfileCard({ name, role, avatar, posts, followers, following }: ProfileCardProps) {\n  const initials = name.slice(0, 2).toUpperCase();\n  return (\n    <div className="bg-zinc-800/80 border border-white/10 rounded-2xl p-6 text-center">\n      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl overflow-hidden">{avatar ? <img src={avatar} alt={name} className="w-full h-full object-cover" /> : initials}</div>\n      <div className="text-base font-semibold text-white">{name}</div>\n      <div className="text-xs text-zinc-400 mb-4">{role}</div>\n      <div className="flex justify-center gap-6 text-center">{[[''Posts'', posts], [''Seguidores'', followers], [''Siguiendo'', following]].map(([label, val]) => (<div key={label as string}><div className="text-sm font-bold text-white">{val as number}</div><div className="text-xs text-zinc-500">{label as string}</div></div>))}</div>\n    </div>\n  );\n}',
   '[]', 'react', ARRAY['card','perfil','usuario','avatar','social'], true, true, 'profile-card', 'ProfileCard.tsx', NULL),

  ('Feature Card',
   'Tarjeta de característica con icono y hover border',
   'Cards',
   E'import { LucideIcon } from ''lucide-react'';\n\ninterface FeatureCardProps { icon: LucideIcon; title: string; description: string; }\n\nexport function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {\n  return (\n    <div className="bg-zinc-800/80 border border-white/10 rounded-2xl p-6 hover:border-violet-500/40 transition-all group">\n      <div className="w-11 h-11 rounded-xl bg-violet-500/15 flex items-center justify-center mb-4 group-hover:bg-violet-500/25 transition-colors"><Icon className="w-5 h-5 text-violet-400" /></div>\n      <div className="text-sm font-semibold text-white mb-2">{title}</div>\n      <div className="text-xs text-zinc-400 leading-relaxed">{description}</div>\n    </div>\n  );\n}',
   '[]', 'react', ARRAY['card','feature','caracteristica','icon','landing'], true, true, 'feature-card', 'FeatureCard.tsx', NULL),

  ('Glass Card',
   'Tarjeta con efecto glassmorphism y gradiente',
   'Cards',
   E'interface GlassCardProps { label: string; value: string; change?: string; }\n\nexport function GlassCard({ label, value, change }: GlassCardProps) {\n  return (\n    <div className="relative overflow-hidden rounded-2xl">\n      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 to-cyan-600/20" />\n      <div className="relative backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6">\n        <div className="text-xs text-white/60 mb-2">{label}</div>\n        <div className="text-3xl font-bold text-white">{value}</div>\n        {change && <div className="text-xs text-emerald-400 mt-1">{change}</div>}\n      </div>\n    </div>\n  );\n}',
   '[]', 'react', ARRAY['card','glass','glassmorphism','blur','transparente'], true, true, 'glass-card', 'GlassCard.tsx', NULL),

  ('Kanban Card',
   'Tarjeta de tarea estilo Kanban con estado, progreso y avatares de equipo',
   'Cards',
   E'interface KanbanCardProps { title: string; description?: string; status?: ''todo'' | ''in-progress'' | ''review'' | ''done''; progress?: number; assignees?: { name: string; color?: string }[]; attachments?: number; comments?: number; }\n\nexport function KanbanCard({ title, description, status = ''todo'', progress, assignees = [], attachments, comments }: KanbanCardProps) {\n  const STATUS = { todo: { label: ''Por hacer'', color: ''text-zinc-400 bg-zinc-400/10 border-zinc-400/20'' }, ''in-progress'': { label: ''En progreso'', color: ''text-amber-400 bg-amber-400/10 border-amber-400/20'' }, review: { label: ''En revisión'', color: ''text-blue-400 bg-blue-400/10 border-blue-400/20'' }, done: { label: ''Completado'', color: ''text-emerald-400 bg-emerald-400/10 border-emerald-400/20'' } };\n  const s = STATUS[status];\n  return (\n    <div className="bg-zinc-800/90 border border-white/10 rounded-xl p-4 shadow-lg hover:border-violet-500/30 transition-all cursor-grab">\n      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold border rounded-full px-2 py-0.5 mb-3 ${s.color}`}><span className="w-1 h-1 rounded-full bg-current animate-pulse" />{s.label}</span>\n      <p className="text-sm font-semibold text-white mb-1.5">{title}</p>\n      {description && <p className="text-xs text-zinc-400 mb-3">{description}</p>}\n      {progress !== undefined && <div className="h-1 bg-zinc-700 rounded-full mb-3"><div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: `${progress}%` }} /></div>}\n    </div>\n  );\n}',
   '[]', 'react', ARRAY['kanban','task','tarea','board','ticket','proyecto','trello'], true, true, 'kanban-card', 'KanbanCard.tsx', NULL),

  ('Testimonial Card',
   'Tarjeta de testimonio con cita, estrellas y perfil del autor',
   'Cards',
   E'interface TestimonialCardProps { quote: string; author: string; role?: string; avatar?: string; rating?: number; }\n\nexport function TestimonialCard({ quote, author, role, avatar, rating = 5 }: TestimonialCardProps) {\n  const initials = author.split('' '').map(n => n[0]).join('''').slice(0, 2).toUpperCase();\n  return (\n    <div className="bg-zinc-800/80 border border-white/10 rounded-2xl p-6">\n      <div className="text-3xl text-violet-400/40 mb-2 font-serif">"</div>\n      <p className="text-sm text-zinc-300 leading-relaxed mb-4">{quote}</p>\n      <div className="flex gap-0.5 mb-4">{Array.from({ length: 5 }).map((_, i) => (<svg key={i} className={`w-4 h-4 ${i < rating ? ''text-amber-400'' : ''text-zinc-700''}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>))}</div>\n      <div className="flex items-center gap-3 border-t border-white/5 pt-4"><div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white">{avatar ? <img src={avatar} alt={author} className="w-full h-full object-cover rounded-full" /> : initials}</div><div><p className="text-sm font-semibold text-white">{author}</p>{role && <p className="text-xs text-zinc-500">{role}</p>}</div></div>\n    </div>\n  );\n}',
   '[]', 'react', ARRAY['testimonial','review','opinion','cliente','cita','quote'], true, true, 'testimonial-card', 'TestimonialCard.tsx', NULL),

  -- ── FORMS ────────────────────────────────────────────────────────────────
  ('Login Form',
   'Formulario de autenticación completo con diseño oscuro',
   'Forms',
   E'import { useState } from ''react'';\n\nexport function LoginForm({ onSubmit }: { onSubmit?: (email: string, password: string) => void }) {\n  const [email, setEmail] = useState('''');\n  const [password, setPassword] = useState('''');\n  return (\n    <div className="bg-zinc-800/80 border border-white/10 rounded-2xl p-8 w-full max-w-sm">\n      <h2 className="text-xl font-bold text-white mb-6">Iniciar sesión</h2>\n      <div className="space-y-4">\n        <div><label className="text-xs text-zinc-400 mb-1.5 block">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="usuario@email.com" className="w-full h-10 bg-zinc-700/60 border border-white/10 rounded-xl px-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50" /></div>\n        <div><label className="text-xs text-zinc-400 mb-1.5 block">Contraseña</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full h-10 bg-zinc-700/60 border border-white/10 rounded-xl px-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50" /></div>\n        <button onClick={() => onSubmit?.(email, password)} className="w-full h-10 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-cyan-500 text-white hover:opacity-90">Entrar</button>\n      </div>\n    </div>\n  );\n}',
   '[]', 'react', ARRAY['form','login','autenticacion','email','password'], true, true, 'login-form', 'LoginForm.tsx', NULL),

  ('Search Bar',
   'Barra de búsqueda moderna con icono y focus animado',
   'Forms',
   E'import { Search } from ''lucide-react'';\nimport { useState } from ''react'';\n\nexport function SearchBar({ placeholder = ''Buscar...'', onSearch }: { placeholder?: string; onSearch?: (q: string) => void }) {\n  const [query, setQuery] = useState('''');\n  return (\n    <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" /><input type="text" value={query} onChange={e => { setQuery(e.target.value); onSearch?.(e.target.value); }} placeholder={placeholder} className="w-full h-10 bg-zinc-800 border border-white/10 rounded-xl pl-9 pr-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50" /></div>\n  );\n}',
   '[]', 'react', ARRAY['form','busqueda','search','input','filtro'], true, true, 'search-bar', 'SearchBar.tsx', NULL),

  ('Newsletter Form',
   'Formulario de suscripción compacto con botón inline',
   'Forms',
   E'import { useState } from ''react'';\n\nexport function NewsletterForm({ onSubscribe }: { onSubscribe?: (email: string) => void }) {\n  const [email, setEmail] = useState('''');\n  return (\n    <div className="bg-zinc-800/80 border border-white/10 rounded-2xl p-6"><div className="text-sm font-bold text-white mb-1">Mantente al día</div><div className="text-xs text-zinc-400 mb-4">Recibe novedades y actualizaciones semanales.</div><div className="flex gap-2"><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" className="flex-1 h-9 bg-zinc-700/60 border border-white/10 rounded-xl px-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50" /><button onClick={() => onSubscribe?.(email)} className="px-4 h-9 rounded-xl text-xs font-semibold bg-violet-600 text-white hover:bg-violet-500">Suscribir</button></div></div>\n  );\n}',
   '[]', 'react', ARRAY['form','newsletter','email','suscripcion','subscribe'], true, true, 'newsletter-form', 'NewsletterForm.tsx', NULL),

  ('OTP Input',
   'Input de código OTP con 6 campos y auto-focus',
   'Forms',
   E'import { useRef, useState, KeyboardEvent } from ''react'';\n\nexport function OTPInput({ length = 6, onComplete }: { length?: number; onComplete?: (code: string) => void }) {\n  const [values, setValues] = useState<string[]>(Array(length).fill(''''));\n  const refs = useRef<(HTMLInputElement | null)[]>([]);\n  const handleChange = (i: number, val: string) => {\n    if (!/^[0-9]*$/.test(val)) return;\n    const next = [...values]; next[i] = val.slice(-1); setValues(next);\n    if (val && i < length - 1) refs.current[i + 1]?.focus();\n    if (next.every(v => v) && next.join('''').length === length) onComplete?.(next.join(''''));\n  };\n  const handleKeyDown = (i: number, e: KeyboardEvent) => { if (e.key === ''Backspace'' && !values[i] && i > 0) refs.current[i - 1]?.focus(); };\n  return (\n    <div className="flex gap-2">{values.map((val, i) => (<input key={i} ref={el => { refs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1} value={val} onChange={e => handleChange(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)} className="w-11 h-12 rounded-xl border text-center text-base font-bold bg-zinc-800 border-white/10 text-white focus:border-violet-500/70 focus:outline-none" />))}</div>\n  );\n}',
   '[]', 'react', ARRAY['form','otp','codigo','verificacion','2fa','pin'], true, true, 'otp-input', 'OTPInput.tsx', NULL),

  ('Tags Input',
   'Input de etiquetas removibles estilo chip con teclado',
   'Forms',
   E'import { useState, KeyboardEvent } from ''react'';\n\nexport function TagsInput({ initialTags = [], placeholder = ''Añadir...'', onChange }: { initialTags?: string[]; placeholder?: string; onChange?: (tags: string[]) => void }) {\n  const [tags, setTags] = useState<string[]>(initialTags);\n  const [input, setInput] = useState('''');\n  const addTag = (value: string) => { const tag = value.trim(); if (!tag || tags.includes(tag)) return; const next = [...tags, tag]; setTags(next); onChange?.(next); setInput(''''); };\n  const removeTag = (tag: string) => { const next = tags.filter(t => t !== tag); setTags(next); onChange?.(next); };\n  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === ''Enter'' || e.key === '','') { e.preventDefault(); addTag(input); } if (e.key === ''Backspace'' && !input && tags.length) removeTag(tags[tags.length - 1]); };\n  return (\n    <div className="flex flex-wrap gap-2 p-2.5 bg-zinc-800/80 border border-white/10 rounded-xl focus-within:border-violet-500/40 min-h-[44px]">\n      {tags.map(tag => (<span key={tag} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/15 border border-violet-500/25 text-xs text-violet-300 font-medium">{tag}<button onClick={() => removeTag(tag)} className="text-violet-400/50 hover:text-violet-200">×</button></span>))}\n      <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={tags.length === 0 ? placeholder : ''''} className="flex-1 min-w-[80px] bg-transparent text-sm text-white placeholder:text-zinc-600 outline-none" />\n    </div>\n  );\n}',
   '[]', 'react', ARRAY['tags','chips','etiquetas','input','multiselect','removable'], true, true, 'tags-input', 'TagsInput.tsx', NULL),

  -- ── NAVIGATION ──────────────────────────────────────────────────────────
  ('Navbar',
   'Barra de navegación moderna con logo, links y CTA',
   'Navigation',
   E'interface NavbarProps { brand?: string; links?: { label: string; href: string }[]; onSignIn?: () => void; }\n\nexport function Navbar({ brand = ''Orion'', links = [], onSignIn }: NavbarProps) {\n  return (\n    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-zinc-900/80 border-b border-white/10">\n      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">\n        <div className="text-base font-bold text-white">{brand}</div>\n        <nav className="hidden md:flex items-center gap-6">{links.map(({ label, href }) => (<a key={label} href={href} className="text-sm text-zinc-400 hover:text-white transition-colors">{label}</a>))}</nav>\n        <button onClick={onSignIn} className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-violet-600 text-white hover:bg-violet-500">Sign in</button>\n      </div>\n    </header>\n  );\n}',
   '[]', 'react', ARRAY['navbar','navegacion','header','menu','responsive'], true, true, 'modern-navbar', 'Navbar.tsx', NULL),

  ('Tab Navigation',
   'Navegación por tabs con indicador activo animado',
   'Navigation',
   E'import { useState } from ''react'';\n\nexport function TabNav({ tabs, defaultIndex = 0, onChange }: { tabs: string[]; defaultIndex?: number; onChange?: (i: number) => void }) {\n  const [active, setActive] = useState(defaultIndex);\n  return (\n    <div className="flex bg-zinc-800 rounded-xl p-1 gap-1">{tabs.map((tab, i) => (<button key={tab} onClick={() => { setActive(i); onChange?.(i); }} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${active === i ? ''bg-violet-600 text-white shadow-lg'' : ''text-zinc-400 hover:text-white''}`}>{tab}</button>))}</div>\n  );\n}',
   '[]', 'react', ARRAY['tabs','navegacion','tab','switch','segmented'], true, true, 'tab-nav', 'TabNav.tsx', NULL),

  ('Breadcrumb',
   'Indicador de ruta jerárquica con separadores',
   'Navigation',
   E'interface BreadcrumbProps { items: { label: string; href?: string }[]; }\n\nexport function Breadcrumb({ items }: BreadcrumbProps) {\n  return (\n    <nav className="flex items-center gap-1.5 text-sm">{items.map((item, i) => (<span key={item.label} className="flex items-center gap-1.5">{i > 0 && <span className="text-zinc-600">/</span>}{item.href && i < items.length - 1 ? (<a href={item.href} className="text-zinc-400 hover:text-white transition-colors">{item.label}</a>) : (<span className="text-white font-medium">{item.label}</span>)}</span>))}</nav>\n  );\n}',
   '[]', 'react', ARRAY['breadcrumb','navegacion','ruta','path','migas'], true, true, 'breadcrumb', 'Breadcrumb.tsx', NULL),

  -- ── LAYOUTS ─────────────────────────────────────────────────────────────
  ('Hero Section',
   'Sección hero completa con badge, título gradiente y CTA doble',
   'Layouts',
   E'interface HeroSectionProps { badge?: string; title: string; highlight?: string; subtitle?: string; primaryCta?: string; secondaryCta?: string; onPrimary?: () => void; onSecondary?: () => void; }\n\nexport function HeroSection({ badge, title, highlight, subtitle, primaryCta = ''Empezar'', secondaryCta = ''Ver demo'', onPrimary, onSecondary }: HeroSectionProps) {\n  return (\n    <section className="flex flex-col items-center text-center py-24 px-4">\n      {badge && <div className="inline-block text-xs font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-6">{badge}</div>}\n      <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-4">{title} {highlight && <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">{highlight}</span>}</h1>\n      {subtitle && <p className="text-lg text-zinc-400 max-w-xl mb-8">{subtitle}</p>}\n      <div className="flex gap-3"><button onClick={onPrimary} className="px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-cyan-500 text-white hover:opacity-90">{primaryCta}</button><button onClick={onSecondary} className="px-6 py-3 rounded-xl text-sm font-semibold border border-white/10 text-zinc-300 hover:bg-white/5">{secondaryCta}</button></div>\n    </section>\n  );\n}',
   '[]', 'react', ARRAY['hero','landing','layout','seccion','portada'], true, true, 'hero-section', 'HeroSection.tsx', NULL),

  ('Feature Grid',
   'Grid de características con iconos emoji y grid 2×2',
   'Layouts',
   E'interface Feature { icon: string; title: string; description: string; }\ninterface FeatureGridProps { features: Feature[]; columns?: 2 | 3 | 4; }\n\nexport function FeatureGrid({ features, columns = 3 }: FeatureGridProps) {\n  const colClass = { 2: ''grid-cols-2'', 3: ''grid-cols-3'', 4: ''grid-cols-4'' }[columns];\n  return (\n    <div className={`grid ${colClass} gap-4`}>{features.map(({ icon, title, description }) => (<div key={title} className="bg-zinc-800/80 border border-white/10 rounded-2xl p-5 hover:border-violet-500/30 transition-all"><div className="text-3xl mb-3">{icon}</div><div className="text-sm font-semibold text-white mb-1.5">{title}</div><div className="text-xs text-zinc-400 leading-relaxed">{description}</div></div>))}</div>\n  );\n}',
   '[]', 'react', ARRAY['layout','features','grid','landing','caracteristicas'], true, true, 'feature-grid', 'FeatureGrid.tsx', NULL),

  ('CTA Section',
   'Sección de llamada a la acción con gradiente y CTA centrado',
   'Layouts',
   E'interface CTASectionProps { title: string; subtitle?: string; cta?: string; onCta?: () => void; }\n\nexport function CTASection({ title, subtitle, cta = ''Comenzar gratis'', onCta }: CTASectionProps) {\n  return (\n    <section className="py-20 px-4"><div className="max-w-2xl mx-auto text-center bg-gradient-to-br from-violet-900/60 to-cyan-900/30 border border-violet-500/20 rounded-3xl py-16 px-8"><h2 className="text-3xl font-bold text-white mb-3">{title}</h2>{subtitle && <p className="text-zinc-400 mb-8">{subtitle}</p>}<button onClick={onCta} className="px-8 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-cyan-500 text-white hover:opacity-90">{cta}</button></div></section>\n  );\n}',
   '[]', 'react', ARRAY['cta','llamada','accion','layout','conversion'], true, true, 'cta-section', 'CTASection.tsx', NULL),

  -- ── UI ELEMENTS ──────────────────────────────────────────────────────────
  ('Animated Badge',
   'Badge con punto pulsante para estados en tiempo real',
   'UI Elements',
   E'type BadgeVariant = ''success'' | ''warning'' | ''error'' | ''info'' | ''purple'';\nconst VARIANTS: Record<BadgeVariant, string> = { success: ''text-emerald-400 bg-emerald-400/10 border-emerald-400/20'', warning: ''text-amber-400 bg-amber-400/10 border-amber-400/20'', error: ''text-red-400 bg-red-400/10 border-red-400/20'', info: ''text-blue-400 bg-blue-400/10 border-blue-400/20'', purple: ''text-violet-400 bg-violet-400/10 border-violet-400/20'' };\n\nexport function AnimatedBadge({ label, variant = ''success'' }: { label: string; variant?: BadgeVariant }) {\n  return (<span className={`inline-flex items-center gap-1.5 text-xs font-semibold border rounded-full px-3 py-1 ${VARIANTS[variant]}`}><span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />{label}</span>);\n}',
   '[]', 'react', ARRAY['badge','etiqueta','animado','pulse','estado','live'], true, true, 'animated-badge', 'AnimatedBadge.tsx', NULL),

  ('Progress Bar',
   'Barra de progreso con gradiente y etiqueta de skill',
   'UI Elements',
   E'interface ProgressBarProps { label: string; value: number; gradient?: string; }\n\nexport function ProgressBar({ label, value, gradient = ''from-violet-500 to-cyan-500'' }: ProgressBarProps) {\n  return (\n    <div><div className="flex justify-between text-xs mb-1.5"><span className="text-zinc-300 font-medium">{label}</span><span className="text-zinc-400">{value}%</span></div><div className="h-2 bg-zinc-700 rounded-full overflow-hidden"><div className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-700`} style={{ width: `${value}%` }} /></div></div>\n  );\n}',
   '[]', 'react', ARRAY['progress','progreso','barra','carga','porcentaje'], true, true, 'progress-bar', 'ProgressBar.tsx', NULL),

  ('Avatar Group',
   'Grupo de avatares apilados con contador de excedente',
   'UI Elements',
   E'interface AvatarGroupProps { users: { name: string; avatar?: string; color?: string }[]; max?: number; size?: ''sm'' | ''md'' | ''lg''; }\nconst SIZES = { sm: ''w-7 h-7 text-xs'', md: ''w-9 h-9 text-sm'', lg: ''w-11 h-11 text-base'' };\n\nexport function AvatarGroup({ users, max = 5, size = ''md'' }: AvatarGroupProps) {\n  const visible = users.slice(0, max);\n  const rest = users.length - max;\n  return (\n    <div className="flex items-center gap-2"><div className="flex -space-x-2.5">{visible.map((u, i) => (<div key={i} className={`${SIZES[size]} rounded-full border-2 border-zinc-900 flex items-center justify-center font-bold text-white overflow-hidden`} style={{ background: u.color ?? ''#7c3aed'' }}>{u.avatar ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" /> : u.name.slice(0, 2).toUpperCase()}</div>))}{rest > 0 && <div className={`${SIZES[size]} rounded-full border-2 border-zinc-900 bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300`}>+{rest}</div>}</div></div>\n  );\n}',
   '[]', 'react', ARRAY['avatar','grupo','usuarios','team','equipo','social'], true, true, 'avatar-group', 'AvatarGroup.tsx', NULL),

  ('Notification Toast',
   'Toast de notificación con icono, título y descripción',
   'UI Elements',
   E'import { CheckCircle, XCircle, AlertCircle, Info } from ''lucide-react'';\n\ntype ToastType = ''success'' | ''error'' | ''warning'' | ''info'';\nconst CONFIG = { success: { icon: CheckCircle, bg: ''bg-emerald-500/15'', color: ''text-emerald-400'' }, error: { icon: XCircle, bg: ''bg-red-500/15'', color: ''text-red-400'' }, warning: { icon: AlertCircle, bg: ''bg-amber-500/15'', color: ''text-amber-400'' }, info: { icon: Info, bg: ''bg-blue-500/15'', color: ''text-blue-400'' } };\n\nexport function NotificationToast({ type = ''success'', title, description, onClose }: { type?: ToastType; title: string; description?: string; onClose?: () => void }) {\n  const { icon: Icon, bg, color } = CONFIG[type];\n  return (<div className="bg-zinc-800 border border-white/10 rounded-xl p-4 flex items-start gap-3 shadow-xl max-w-sm"><div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}><Icon className={`w-5 h-5 ${color}`} /></div><div className="flex-1"><div className="text-sm font-semibold text-white">{title}</div>{description && <div className="text-xs text-zinc-400 mt-0.5">{description}</div>}</div>{onClose && <button onClick={onClose} className="text-zinc-500 hover:text-white">×</button>}</div>);\n}',
   '[]', 'react', ARRAY['notification','toast','alerta','mensaje','feedback'], true, true, 'notification-toast', 'NotificationToast.tsx', NULL),

  ('Toggle Switch',
   'Toggle animado con transición suave para configuraciones on/off',
   'UI Elements',
   E'import { useState } from ''react'';\n\nexport function ToggleSwitch({ label, defaultChecked = false, onChange, disabled = false }: { label?: string; defaultChecked?: boolean; onChange?: (checked: boolean) => void; disabled?: boolean }) {\n  const [on, setOn] = useState(defaultChecked);\n  return (\n    <div className="flex items-center gap-3"><button onClick={() => { if (disabled) return; const next = !on; setOn(next); onChange?.(next); }} disabled={disabled} className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none ${on ? ''bg-violet-600'' : ''bg-zinc-700''} ${disabled ? ''opacity-50 cursor-not-allowed'' : ''cursor-pointer''}`} role="switch" aria-checked={on}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${on ? ''translate-x-6'' : ''translate-x-1''}`} /></button>{label && <span className={`text-sm ${on ? ''text-white'' : ''text-zinc-400''} transition-colors`}>{label}</span>}</div>\n  );\n}',
   '[]', 'react', ARRAY['toggle','switch','interruptor','on','off','settings','boolean'], true, true, 'toggle-switch', 'ToggleSwitch.tsx', NULL),

  ('Rating Stars',
   'Componente de calificación interactivo con hover animado y escala de 1-5',
   'UI Elements',
   E'import { useState } from ''react'';\n\nexport function RatingStars({ defaultRating = 0, max = 5, onChange, readOnly = false }: { defaultRating?: number; max?: number; onChange?: (r: number) => void; readOnly?: boolean }) {\n  const [rating, setRating] = useState(defaultRating);\n  const [hover, setHover] = useState(0);\n  return (\n    <div className="flex gap-1">{Array.from({ length: max }).map((_, i) => { const star = i + 1; return (<button key={star} type="button" disabled={readOnly} onMouseEnter={() => !readOnly && setHover(star)} onMouseLeave={() => !readOnly && setHover(0)} onClick={() => { if (!readOnly) { setRating(star); onChange?.(star); } }} className={`transition-transform ${readOnly ? ''cursor-default'' : ''hover:scale-125 active:scale-110''}`}><svg className={`w-7 h-7 transition-colors ${star <= (hover || rating) ? ''text-amber-400'' : ''text-zinc-700''}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg></button>); })}</div>\n  );\n}',
   '[]', 'react', ARRAY['rating','stars','estrellas','calificacion','review','score'], true, true, 'rating-stars', 'RatingStars.tsx', NULL),

  ('Accordion',
   'Acordeón colapsable con animación suave tipo FAQ o settings',
   'UI Elements',
   E'import { useState } from ''react'';\n\nexport function Accordion({ items, allowMultiple = false }: { items: { question: string; answer: string }[]; allowMultiple?: boolean }) {\n  const [open, setOpen] = useState<Set<number>>(new Set());\n  const toggle = (i: number) => setOpen(prev => { const next = new Set(allowMultiple ? prev : []); if (prev.has(i)) next.delete(i); else next.add(i); return next; });\n  return (\n    <div className="space-y-2">{items.map((item, i) => (<div key={i} className="bg-zinc-800/80 border border-white/10 rounded-xl overflow-hidden"><button onClick={() => toggle(i)} className="w-full flex items-center justify-between px-4 py-3.5 text-left gap-3"><span className="text-sm font-semibold text-white">{item.question}</span><svg className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${open.has(i) ? ''rotate-180 text-violet-400'' : ''text-zinc-500''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></button>{open.has(i) && <div className="px-4 pb-4 border-t border-white/5"><p className="text-sm text-zinc-400 pt-3 leading-relaxed">{item.answer}</p></div>}</div>))}</div>\n  );\n}',
   '[]', 'react', ARRAY['accordion','collapse','faq','expandir','plegar','pregunta'], true, true, 'accordion', 'Accordion.tsx', NULL),

  ('Stepper',
   'Indicador de pasos multi-etapa para wizards y onboarding flows',
   'UI Elements',
   E'import { useState } from ''react'';\n\nexport function Stepper({ steps, initialStep = 0, onStepChange }: { steps: string[]; initialStep?: number; onStepChange?: (step: number) => void }) {\n  const [current, setCurrent] = useState(initialStep);\n  const goTo = (i: number) => { setCurrent(i); onStepChange?.(i); };\n  return (\n    <div><div className="flex items-center">{steps.map((step, i) => (<div key={step} className="flex items-center flex-1 last:flex-none"><button onClick={() => goTo(i)} className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 z-10 transition-all ${i < current ? ''bg-violet-600 border-violet-600 text-white'' : i === current ? ''border-violet-500 text-violet-400 bg-violet-500/10'' : ''border-zinc-700 text-zinc-600''}`}>{i < current ? ''✓'' : i + 1}</button>{i < steps.length - 1 && <div className={`flex-1 h-0.5 transition-colors mx-1 ${i < current ? ''bg-violet-600'' : ''bg-zinc-700''}`} />}</div>))}</div><div className="flex mt-2">{steps.map((step, i) => (<div key={step} className="flex-1"><span className={`text-xs block text-center transition-colors ${i === current ? ''text-white font-semibold'' : i < current ? ''text-violet-400'' : ''text-zinc-600''}`}>{step}</span></div>))}</div></div>\n  );\n}',
   '[]', 'react', ARRAY['stepper','pasos','wizard','onboarding','progreso','steps'], true, true, 'stepper', 'Stepper.tsx', NULL),

  -- ── ANIMATIONS ───────────────────────────────────────────────────────────
  ('Typewriter Text',
   'Efecto máquina de escribir con borrado y loop infinito',
   'Animations',
   E'import { useState, useEffect } from ''react'';\n\nexport function TypewriterText({ words, prefix = ''Build better'', speed = 90, deleteSpeed = 50, pauseMs = 1200 }: { words: string[]; prefix?: string; speed?: number; deleteSpeed?: number; pauseMs?: number }) {\n  const [idx, setIdx] = useState(0);\n  const [displayed, setDisplayed] = useState('''');\n  const [deleting, setDeleting] = useState(false);\n  useEffect(() => {\n    const word = words[idx];\n    if (!deleting && displayed === word) { const t = setTimeout(() => setDeleting(true), pauseMs); return () => clearTimeout(t); }\n    if (deleting && displayed === '''') { setDeleting(false); setIdx(i => (i + 1) % words.length); return; }\n    const t = setTimeout(() => setDisplayed(deleting ? displayed.slice(0, -1) : word.slice(0, displayed.length + 1)), deleting ? deleteSpeed : speed);\n    return () => clearTimeout(t);\n  }, [displayed, deleting, idx, words, speed, deleteSpeed, pauseMs]);\n  return (<p className="text-2xl font-bold text-white">{prefix} <span className="text-violet-400">{displayed}</span><span className="animate-pulse text-violet-400">|</span></p>);\n}',
   '[]', 'react', ARRAY['typewriter','texto','animacion','escritura','loop'], true, true, 'typewriter', 'TypewriterText.tsx', NULL),

  ('Floating Card',
   'Tarjeta con animación de levitación continua',
   'Animations',
   E'export function FloatingCard({ emoji = ''🚀'', title, subtitle }: { emoji?: string; title: string; subtitle?: string }) {\n  return (\n    <>\n      <style>{`@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }`}</style>\n      <div style={{ animation: ''float 3s ease-in-out infinite'' }}>\n        <div className="bg-gradient-to-br from-violet-900/80 to-cyan-900/40 border border-violet-500/30 rounded-2xl p-6 text-center shadow-xl shadow-violet-500/20">\n          <div className="text-4xl mb-3">{emoji}</div>\n          <div className="text-sm font-bold text-white">{title}</div>\n          {subtitle && <div className="text-xs text-zinc-400 mt-1">{subtitle}</div>}\n        </div>\n      </div>\n    </>\n  );\n}',
   '[]', 'react', ARRAY['card','flotante','animacion','levitacion','hover'], true, true, 'floating-card', 'FloatingCard.tsx', NULL),

  ('Skeleton Loader',
   'Placeholder animado tipo skeleton para estados de carga',
   'Animations',
   E'export function SkeletonLoader() {\n  return (\n    <div className="space-y-3 w-full max-w-sm">\n      <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-zinc-700 animate-pulse flex-shrink-0" /><div className="flex-1 space-y-1.5"><div className="h-2.5 bg-zinc-700 rounded-full animate-pulse w-3/4" /><div className="h-2 bg-zinc-700/60 rounded-full animate-pulse w-1/2" /></div></div>\n      <div className="h-2 bg-zinc-700 rounded-full animate-pulse" />\n      <div className="h-2 bg-zinc-700 rounded-full animate-pulse w-5/6" />\n      <div className="h-2 bg-zinc-700/60 rounded-full animate-pulse w-4/6" />\n      <div className="h-20 bg-zinc-700/40 rounded-xl animate-pulse" />\n    </div>\n  );\n}',
   '[]', 'react', ARRAY['skeleton','loader','carga','placeholder','shimmer'], true, true, 'skeleton-loader', 'SkeletonLoader.tsx', NULL),

  ('Glow Border Card',
   'Tarjeta con borde de gradiente animado en loop',
   'Animations',
   E'interface GlowBorderCardProps { title: string; subtitle?: string; children?: React.ReactNode; }\n\nexport function GlowBorderCard({ title, subtitle, children }: GlowBorderCardProps) {\n  return (\n    <>\n      <style>{`@keyframes border-flow { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }`}</style>\n      <div className="relative p-[1.5px] rounded-2xl" style={{ background: ''linear-gradient(90deg, #7c3aed, #06b6d4, #db2777, #7c3aed)'', backgroundSize: ''300% 100%'', animation: ''border-flow 4s linear infinite'' }}>\n        <div className="bg-zinc-900 rounded-2xl p-6"><div className="text-base font-bold text-white">{title}</div>{subtitle && <div className="text-xs text-zinc-400 mt-1">{subtitle}</div>}{children}</div>\n      </div>\n    </>\n  );\n}',
   '[]', 'react', ARRAY['card','borde','glow','gradiente','animado','aurora'], true, true, 'glow-border-card', 'GlowBorderCard.tsx', NULL),

  -- ── LOADERS ──────────────────────────────────────────────────────────────
  ('Gradient Spinner',
   'Spinner circular con gradiente cónico violet-cyan en tres tamaños',
   'Loaders',
   E'type SpinnerSize = ''sm'' | ''md'' | ''lg'' | ''xl'';\nconst SIZES: Record<SpinnerSize, string> = { sm: ''w-5 h-5'', md: ''w-8 h-8'', lg: ''w-12 h-12'', xl: ''w-16 h-16'' };\n\nexport function GradientSpinner({ size = ''md'', className = '''' }: { size?: SpinnerSize; className?: string }) {\n  return (\n    <div className={`relative animate-spin ${SIZES[size]} ${className}`}>\n      <div className="absolute inset-0 rounded-full" style={{ background: ''conic-gradient(from 0deg, transparent 0%, #7c3aed 40%, #06b6d4 70%, transparent 100%)'' }} />\n      <div className="absolute inset-[3px] bg-background rounded-full" />\n    </div>\n  );\n}',
   '[]', 'react', ARRAY['loader','spinner','cargando','animado','gradiente','circular'], true, true, 'gradient-spinner', 'GradientSpinner.tsx', NULL),

  ('Dots Loader',
   'Loader de puntos con variante bounce y wave en colores personalizables',
   'Loaders',
   E'type DotsVariant = ''bounce'' | ''wave'';\n\nexport function DotsLoader({ variant = ''bounce'', color = ''bg-violet-500'', count = 3 }: { variant?: DotsVariant; color?: string; count?: number }) {\n  return (\n    <div className="flex gap-2 items-center">{Array.from({ length: count }).map((_, i) => (<div key={i} className={`w-3 h-3 rounded-full ${color} ${variant === ''bounce'' ? ''animate-bounce'' : ''animate-pulse''}`} style={{ animationDelay: `${i * 0.15}s` }} />))}</div>\n  );\n}',
   '[]', 'react', ARRAY['loader','dots','puntos','bounce','wave','cargando'], true, true, 'dots-loader', 'DotsLoader.tsx', NULL),

  ('Bar Loader',
   'Barra de carga indeterminada con efecto sweep y versión determinada',
   'Loaders',
   E'export function BarLoader({ value, label, className = '''' }: { value?: number; label?: string; className?: string }) {\n  const indeterminate = value === undefined;\n  return (\n    <div className={`space-y-1.5 ${className}`}>\n      {label !== undefined && (<div className="flex justify-between items-center text-xs text-zinc-400"><span>{label}</span>{indeterminate ? <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-700 border-t-violet-500 animate-spin" /> : <span className="text-cyan-400 font-medium">{value}%</span>}</div>)}\n      <div className="relative h-1.5 bg-zinc-800 rounded-full overflow-hidden">\n        {indeterminate ? (<><style>{`@keyframes bar-sweep { 0% { transform: translateX(-100%); } 100% { transform: translateX(350%); } }`}</style><div className="absolute h-full w-1/2 bg-gradient-to-r from-violet-600 via-cyan-400 to-violet-600 rounded-full" style={{ animation: ''bar-sweep 1.4s ease-in-out infinite'' }} /></>) : (<div className="h-full bg-gradient-to-r from-cyan-600 to-blue-500 rounded-full transition-all duration-500" style={{ width: `${value}%` }} />)}\n      </div>\n    </div>\n  );\n}',
   '[]', 'react', ARRAY['loader','barra','progreso','sweep','indeterminado','cargando'], true, true, 'bar-loader', 'BarLoader.tsx', NULL),

  ('Pulse Ring Loader',
   'Loader de anillos concéntricos expandiéndose tipo radar o sonar',
   'Loaders',
   E'type RingColor = ''violet'' | ''cyan'' | ''emerald'' | ''rose'';\nconst COLORS: Record<RingColor, { border: string; center: string; shadow: string }> = { violet: { border: ''border-violet-500'', center: ''from-violet-500 to-violet-700'', shadow: ''shadow-violet-500/40'' }, cyan: { border: ''border-cyan-400'', center: ''from-cyan-400 to-blue-600'', shadow: ''shadow-cyan-500/30'' }, emerald: { border: ''border-emerald-400'', center: ''from-emerald-400 to-teal-600'', shadow: ''shadow-emerald-500/30'' }, rose: { border: ''border-rose-400'', center: ''from-rose-400 to-pink-600'', shadow: ''shadow-rose-500/30'' } };\n\nexport function PulseRingLoader({ color = ''violet'', size = 56, rings = 3 }: { color?: RingColor; size?: number; rings?: number }) {\n  const c = COLORS[color];\n  const dotSize = Math.round(size * 0.43);\n  return (\n    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>{Array.from({ length: rings }).map((_, i) => { const ringSize = dotSize + (size - dotSize) * ((i + 1) / rings); return (<div key={i} className={`absolute rounded-full border ${c.border} animate-ping`} style={{ width: ringSize, height: ringSize, animationDuration: ''1.5s'', animationDelay: `${i * 0.3}s`, opacity: 0.7 - i * 0.2 }} />); })}<div className={`rounded-full bg-gradient-to-br ${c.center} shadow-lg ${c.shadow} z-10`} style={{ width: dotSize, height: dotSize }} /></div>\n  );\n}',
   '[]', 'react', ARRAY['loader','pulse','ring','anillos','ondas','ping','radar'], true, true, 'pulse-ring-loader', 'PulseRingLoader.tsx', NULL),

  ('Orbit Loader',
   'Loader estilo sistema solar con puntos orbitando un núcleo central',
   'Loaders',
   E'export function OrbitLoader() {\n  return (\n    <>\n      <style>{`@keyframes orbit-a { from { transform: rotate(0deg) translateX(24px) rotate(0deg); } to { transform: rotate(360deg) translateX(24px) rotate(-360deg); } } @keyframes orbit-b { from { transform: rotate(90deg) translateX(16px) rotate(-90deg); } to { transform: rotate(450deg) translateX(16px) rotate(-450deg); } }`}</style>\n      <div className="relative w-16 h-16 flex items-center justify-center"><div className="absolute w-full h-full rounded-full border border-zinc-700/50" /><div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 shadow-lg shadow-violet-500/50 z-10" /><div className="absolute w-3.5 h-3.5 rounded-full bg-cyan-400 shadow shadow-cyan-400/60" style={{ animation: ''orbit-a 1.1s linear infinite'' }} /><div className="absolute w-2 h-2 rounded-full bg-pink-400 shadow shadow-pink-400/60" style={{ animation: ''orbit-b 0.75s linear infinite'' }} /></div>\n    </>\n  );\n}',
   '[]', 'react', ARRAY['loader','orbit','orbita','planeta','girar','solar','animacion'], true, true, 'orbit-loader', 'OrbitLoader.tsx', NULL),

  -- ── DATA DISPLAY ─────────────────────────────────────────────────────────
  ('Stat Counter',
   'Contador animado que incrementa hasta el valor objetivo',
   'Data Display',
   E'import { useState, useEffect } from ''react'';\n\nexport function StatCounter({ target, label, change, duration = 1000, prefix = '''', suffix = '''' }: { target: number; label: string; change?: string; duration?: number; prefix?: string; suffix?: string }) {\n  const [count, setCount] = useState(0);\n  useEffect(() => {\n    const steps = 60; const step = target / steps; const interval = duration / steps;\n    const timer = setInterval(() => { setCount(c => { const next = c + step; if (next >= target) { clearInterval(timer); return target; } return next; }); }, interval);\n    return () => clearInterval(timer);\n  }, [target, duration]);\n  return (<div className="text-center space-y-1"><div className="text-4xl font-black text-white tabular-nums">{prefix}{Math.floor(count).toLocaleString()}{suffix}</div><div className="text-sm text-zinc-500">{label}</div>{change && <div className="text-xs text-emerald-400 font-medium">{change}</div>}</div>);\n}',
   '[]', 'react', ARRAY['contador','numero','animado','estadistica','kpi','count'], true, true, 'stat-counter', 'StatCounter.tsx', NULL),

  ('Donut Chart',
   'Gráfica de dona SVG con leyenda y animación de entrada',
   'Data Display',
   E'interface DonutSegment { label: string; value: number; color: string; }\n\nexport function DonutChart({ segments, size = 120, strokeWidth = 18 }: { segments: DonutSegment[]; size?: number; strokeWidth?: number }) {\n  const r = (size - strokeWidth) / 2; const cx = size / 2; const cy = size / 2; const circumference = 2 * Math.PI * r; let cumulative = 0;\n  return (\n    <div className="flex items-center gap-5"><svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>{segments.map(s => { const dash = (s.value / 100) * circumference; const gap = circumference - dash; const offset = circumference - (cumulative / 100) * circumference; cumulative += s.value; return (<circle key={s.label} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={strokeWidth} strokeDasharray={`${dash} ${gap}`} strokeDashoffset={offset} strokeLinecap="round" />); })}<text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={12} fill="white" fontWeight="bold">100%</text></svg><div className="space-y-2">{segments.map(s => (<div key={s.label} className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} /><span className="text-sm text-zinc-400">{s.label}</span><span className="text-sm text-white font-semibold ml-auto pl-3">{s.value}%</span></div>))}</div></div>\n  );\n}',
   '[]', 'react', ARRAY['grafica','donut','pie','chart','porcentaje','svg'], true, true, 'donut-chart', 'DonutChart.tsx', NULL),

  ('Timeline',
   'Línea de tiempo vertical con eventos y colores personalizables',
   'Data Display',
   E'interface TimelineEvent { label: string; time: string; color?: string; description?: string; }\n\nexport function Timeline({ events }: { events: TimelineEvent[] }) {\n  return (\n    <div className="space-y-0">{events.map((event, i) => (<div key={event.label} className="flex gap-3"><div className="flex flex-col items-center"><div className="w-3 h-3 rounded-full flex-shrink-0 mt-1 ring-2 ring-zinc-900" style={{ background: event.color ?? ''#7c3aed'' }} />{i < events.length - 1 && <div className="w-px flex-1 bg-zinc-700/60 mt-1" style={{ minHeight: 24 }} />}</div><div className="pb-5"><p className="text-sm font-semibold text-white leading-none">{event.label}</p>{event.description && <p className="text-xs text-zinc-400 mt-0.5">{event.description}</p>}<p className="text-xs text-zinc-600 mt-1">{event.time}</p></div></div>))}</div>\n  );\n}',
   '[]', 'react', ARRAY['timeline','linea','tiempo','historial','eventos','log'], true, true, 'timeline', 'Timeline.tsx', NULL),

  ('Bar Chart',
   'Gráfica de barras verticales animada con datos y etiquetas personalizables',
   'Data Display',
   E'interface BarChartDataPoint { label: string; value: number; highlight?: boolean; }\n\nexport function BarChart({ data, height = 120, primaryColor = ''from-violet-700 to-violet-500'', highlightColor = ''from-cyan-600 to-cyan-400'', showValues = false }: { data: BarChartDataPoint[]; height?: number; primaryColor?: string; highlightColor?: string; showValues?: boolean }) {\n  const max = Math.max(...data.map(d => d.value), 1);\n  return (\n    <div><div className="flex items-end gap-1.5 mb-2" style={{ height }}>{data.map(d => (<div key={d.label} className="flex-1 flex flex-col items-center justify-end gap-1">{showValues && <span className="text-[10px] text-zinc-500">{d.value}</span>}<div className={`w-full rounded-t-md bg-gradient-to-t transition-all duration-700 ${d.highlight ? highlightColor : primaryColor}`} style={{ height: `${(d.value / max) * 100}%`, minHeight: 4 }} /></div>))}</div><div className="flex gap-1.5">{data.map(d => (<div key={d.label} className="flex-1 text-center text-[10px] text-zinc-600 truncate">{d.label}</div>))}</div></div>\n  );\n}',
   '[]', 'react', ARRAY['grafica','barra','bar','chart','datos','estadistica','semana'], true, true, 'bar-chart', 'BarChart.tsx', NULL),

  ('Code Block',
   'Bloque de código estilizado con cabecera macOS, nombre de archivo y botón copiar',
   'Data Display',
   E'import { useState } from ''react'';\n\nexport function CodeBlock({ code, language = ''tsx'', fileName, showLineNumbers = false }: { code: string; language?: string; fileName?: string; showLineNumbers?: boolean }) {\n  const [copied, setCopied] = useState(false);\n  const handleCopy = async () => { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); };\n  const lines = code.split(''\\n'');\n  return (\n    <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-xl"><div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-zinc-800/50"><div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500/70" /><div className="w-3 h-3 rounded-full bg-amber-500/70" /><div className="w-3 h-3 rounded-full bg-emerald-500/70" /></div><span className="text-xs text-zinc-500 font-mono">{fileName ?? language}</span><button onClick={handleCopy} className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${copied ? ''text-emerald-400'' : ''text-zinc-500 hover:text-zinc-300''}`}>{copied ? ''✓ Copiado'' : ''Copiar''}</button></div><div className="p-4 overflow-x-auto"><pre className="text-sm font-mono leading-relaxed">{lines.map((line, i) => (<div key={i} className="flex gap-4">{showLineNumbers && <span className="select-none text-zinc-600 w-6 text-right flex-shrink-0">{i + 1}</span>}<span className="text-zinc-200">{line}</span></div>))}</pre></div></div>\n  );\n}',
   '[]', 'react', ARRAY['codigo','code','snippet','syntax','copiar','monospace','bloque'], true, true, 'code-block', 'CodeBlock.tsx', NULL)

) AS v(name, description, category, code, props, framework, tags, is_public, is_system, slug, file_name, creator_id)
WHERE NOT EXISTS (
  SELECT 1 FROM components WHERE slug = v.slug
);
