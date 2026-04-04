import React, { useState, useEffect } from 'react';

export interface ComponentEntry {
  id: string;
  name: string;
  category: string;
  tags: string[];
  description: string;
  preview?: React.FC;
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
  'Loaders',
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

// ── Animations & Data Display Previews ───────────────────────────────────────

const TypewriterPreview = () => {
  const words = ['interfaces', 'dashboards', 'apps', 'landing pages'];
  const [idx, setIdx] = React.useState(0);
  const [displayed, setDisplayed] = React.useState('');
  const [deleting, setDeleting] = React.useState(false);
  useEffect(() => {
    const word = words[idx];
    if (!deleting && displayed === word) {
      const t = setTimeout(() => setDeleting(true), 1200);
      return () => clearTimeout(t);
    }
    if (deleting && displayed === '') {
      setDeleting(false);
      setIdx((i) => (i + 1) % words.length);
      return;
    }
    const t = setTimeout(() => {
      setDisplayed(deleting ? displayed.slice(0, -1) : word.slice(0, displayed.length + 1));
    }, deleting ? 50 : 90);
    return () => clearTimeout(t);
  }, [displayed, deleting, idx]);
  return (
    <div className="text-center space-y-1">
      <p className="text-xs text-zinc-500 uppercase tracking-widest">Build better</p>
      <p className="text-base font-bold text-white">
        {displayed}<span className="animate-pulse text-violet-400">|</span>
      </p>
    </div>
  );
};

const RippleButtonPreview = () => {
  const [ripples, setRipples] = React.useState<{id:number;x:number;y:number}[]>([]);
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples(r => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples(r => r.filter(rr => rr.id !== id)), 600);
  };
  return (
    <button
      onClick={handleClick}
      className="relative overflow-hidden px-7 py-3 rounded-xl bg-violet-600 text-white font-semibold text-sm"
    >
      {ripples.map(r => (
        <span
          key={r.id}
          className="absolute rounded-full bg-white/30 animate-ping"
          style={{ left: r.x - 20, top: r.y - 20, width: 40, height: 40, animationDuration: '0.6s' }}
        />
      ))}
      Click me
    </button>
  );
};

const FloatingCardPreview = () => (
  <div className="animate-[float_3s_ease-in-out_infinite]"
    style={{ animation: 'float 3s ease-in-out infinite' }}>
    <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>
    <div className="bg-gradient-to-br from-violet-900/80 to-cyan-900/40 border border-violet-500/30 rounded-2xl p-5 w-44 text-center shadow-xl shadow-violet-500/20">
      <div className="text-3xl mb-2">🚀</div>
      <div className="text-sm font-bold text-white">Launch</div>
      <div className="text-xs text-zinc-400">Hover to pause</div>
    </div>
  </div>
);

const SkeletonPreview = () => (
  <div className="w-56 space-y-3">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-zinc-700 animate-pulse" />
      <div className="flex-1 space-y-1.5">
        <div className="h-2.5 bg-zinc-700 rounded-full animate-pulse w-3/4" />
        <div className="h-2 bg-zinc-700/60 rounded-full animate-pulse w-1/2" />
      </div>
    </div>
    <div className="h-2 bg-zinc-700 rounded-full animate-pulse" />
    <div className="h-2 bg-zinc-700 rounded-full animate-pulse w-5/6" />
    <div className="h-2 bg-zinc-700/60 rounded-full animate-pulse w-4/6" />
    <div className="h-16 bg-zinc-700/40 rounded-xl animate-pulse" />
  </div>
);

const GlowBorderPreview = () => (
  <div className="relative p-[1px] rounded-2xl"
    style={{ background: 'linear-gradient(90deg,#7c3aed,#06b6d4,#7c3aed)', backgroundSize: '200% 100%', animation: 'border-flow 3s linear infinite' }}>
    <style>{`@keyframes border-flow{0%{background-position:0% 50%}100%{background-position:200% 50%}}`}</style>
    <div className="bg-zinc-900 rounded-2xl px-6 py-4 text-center">
      <div className="text-sm font-bold text-white">Animated Border</div>
      <div className="text-xs text-zinc-400 mt-0.5">Gradient loop</div>
    </div>
  </div>
);

const CounterPreview = () => {
  const [count, setCount] = React.useState(0);
  useEffect(() => {
    const target = 2847;
    const step = Math.ceil(target / 60);
    if (count < target) {
      const t = setTimeout(() => setCount(c => Math.min(c + step, target)), 16);
      return () => clearTimeout(t);
    }
  }, [count]);
  return (
    <div className="text-center space-y-1">
      <div className="text-3xl font-black text-white tabular-nums">
        {count.toLocaleString()}
      </div>
      <div className="text-xs text-zinc-500">usuarios activos</div>
      <div className="text-xs text-emerald-400 font-medium">↑ 14.2% este mes</div>
    </div>
  );
};

const DonutChartPreview = () => {
  const segments = [
    { label: 'React', value: 45, color: '#7c3aed' },
    { label: 'Vue', value: 30, color: '#06b6d4' },
    { label: 'Angular', value: 15, color: '#db2777' },
    { label: 'Other', value: 10, color: '#52525b' },
  ];
  let cumulative = 0;
  const r = 36, cx = 48, cy = 48, stroke = 14;
  const circumference = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-4">
      <svg width={96} height={96} viewBox="0 0 96 96">
        {segments.map((s) => {
          const dash = (s.value / 100) * circumference;
          const gap = circumference - dash;
          const offset = circumference - (cumulative / 100) * circumference;
          cumulative += s.value;
          return (
            <circle key={s.label} cx={cx} cy={cy} r={r} fill="none"
              stroke={s.color} strokeWidth={stroke}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dasharray 0.8s ease' }}
            />
          );
        })}
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" className="fill-white font-bold text-xs" fontSize={11} fill="white" fontWeight="bold">100%</text>
      </svg>
      <div className="space-y-1.5">
        {segments.map(s => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <span className="text-xs text-zinc-400">{s.label}</span>
            <span className="text-xs text-white font-medium ml-auto pl-2">{s.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const TimelinePreview = () => {
  const events = [
    { label: 'Proyecto creado', time: 'Hace 3d', color: 'bg-violet-500' },
    { label: 'Primer deploy', time: 'Hace 2d', color: 'bg-cyan-500' },
    { label: 'Beta lanzada', time: 'Ayer', color: 'bg-emerald-500' },
    { label: 'v1.0 publicado', time: 'Hoy', color: 'bg-amber-400' },
  ];
  return (
    <div className="space-y-0 w-52">
      {events.map((e, i) => (
        <div key={e.label} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${e.color}`} />
            {i < events.length - 1 && <div className="w-px flex-1 bg-zinc-700 mt-1" style={{ minHeight: 20 }} />}
          </div>
          <div className="pb-4">
            <p className="text-xs font-semibold text-white leading-none">{e.label}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">{e.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Loaders Previews ─────────────────────────────────────────────────────────

const GradientSpinnerPreview = () => (
  <div className="flex items-end gap-5">
    {[{sz:'w-7 h-7',d:'0.7s'},{sz:'w-11 h-11',d:'0.9s'},{sz:'w-14 h-14',d:'1.1s'}].map(({sz,d},i) => (
      <div key={i} className={`relative ${sz} animate-spin`} style={{animationDuration:d}}>
        <div className="absolute inset-0 rounded-full" style={{background:'conic-gradient(from 0deg,transparent 0%,#7c3aed 40%,#06b6d4 70%,transparent 100%)'}} />
        <div className="absolute inset-[3px] bg-zinc-950 rounded-full" />
      </div>
    ))}
  </div>
);

const DotsLoaderPreview = () => (
  <div className="flex flex-col items-center gap-5">
    <div className="flex gap-2 items-center">
      {[0,1,2].map(i => (
        <div key={i} className="w-3 h-3 rounded-full bg-violet-500 animate-bounce" style={{animationDelay:`${i*0.15}s`}} />
      ))}
    </div>
    <div className="flex gap-1.5 items-end">
      {[12,20,28,20,12].map((h,i) => (
        <div key={i} className="w-1.5 rounded-full bg-cyan-400 animate-pulse" style={{height:h,animationDelay:`${i*0.1}s`}} />
      ))}
    </div>
  </div>
);

const BarLoaderPreview = () => (
  <div className="w-56 space-y-4">
    <style>{`@keyframes bar-sweep{0%{transform:translateX(-100%)}100%{transform:translateX(350%)}}`}</style>
    <div>
      <div className="flex justify-between items-center text-xs text-zinc-400 mb-1.5">
        <span>Cargando recursos...</span>
        <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-700 border-t-violet-500 animate-spin" />
      </div>
      <div className="relative h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className="absolute h-full w-1/2 bg-gradient-to-r from-violet-600 via-cyan-400 to-violet-600 rounded-full" style={{animation:'bar-sweep 1.4s ease-in-out infinite'}} />
      </div>
    </div>
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-zinc-400">Compilando</span>
        <span className="text-cyan-400 font-medium">67%</span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full w-[67%] bg-gradient-to-r from-cyan-600 to-blue-500 rounded-full" />
      </div>
    </div>
  </div>
);

const PulseRingLoaderPreview = () => (
  <div className="flex items-center gap-8">
    <div className="relative w-14 h-14 flex items-center justify-center">
      {[0,1,2].map(i => (
        <div key={i} className="absolute rounded-full border border-violet-500 animate-ping"
          style={{width:22+i*14,height:22+i*14,animationDuration:'1.5s',animationDelay:`${i*0.3}s`,opacity:0.7-i*0.2}} />
      ))}
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 shadow-lg shadow-violet-500/40 z-10" />
    </div>
    <div className="relative w-14 h-14 flex items-center justify-center">
      {[0,1].map(i => (
        <div key={i} className="absolute rounded-full border-2 border-cyan-400 animate-ping"
          style={{width:26+i*16,height:26+i*16,animationDuration:'1.2s',animationDelay:`${i*0.4}s`,opacity:0.6-i*0.2}} />
      ))}
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 z-10 shadow-lg shadow-cyan-500/30" />
    </div>
  </div>
);

const OrbitLoaderPreview = () => (
  <div className="relative w-16 h-16 flex items-center justify-center">
    <style>{`@keyframes orbit-a{from{transform:rotate(0deg) translateX(24px) rotate(0deg)}to{transform:rotate(360deg) translateX(24px) rotate(-360deg)}}@keyframes orbit-b{from{transform:rotate(90deg) translateX(16px) rotate(-90deg)}to{transform:rotate(450deg) translateX(16px) rotate(-450deg)}}`}</style>
    <div className="absolute w-full h-full rounded-full border border-zinc-700/50" />
    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 shadow-lg shadow-violet-500/50 z-10" />
    <div className="absolute w-3.5 h-3.5 rounded-full bg-cyan-400 shadow shadow-cyan-400/60" style={{animation:'orbit-a 1.1s linear infinite'}} />
    <div className="absolute w-2 h-2 rounded-full bg-pink-400 shadow shadow-pink-400/60" style={{animation:'orbit-b 0.75s linear infinite'}} />
  </div>
);

// ── New UI Elements Previews ──────────────────────────────────────────────────

const ToggleSwitchPreview = () => {
  const [states, setStates] = React.useState([true, false, true]);
  const labels = ['Notificaciones', 'Modo seguro', 'Auto-sync'];
  return (
    <div className="space-y-3 w-52">
      {states.map((on, i) => (
        <div key={i} className="flex items-center justify-between">
          <span className="text-xs text-zinc-300">{labels[i]}</span>
          <button
            onClick={() => setStates(s => s.map((v, j) => j === i ? !v : v))}
            className={`relative w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ${on ? 'bg-violet-600' : 'bg-zinc-700'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${on ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      ))}
    </div>
  );
};

const RatingStarsPreview = () => {
  const [rating, setRating] = React.useState(4);
  const [hover, setHover] = React.useState(0);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1">
        {[1,2,3,4,5].map(star => (
          <button key={star} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)} onClick={() => setRating(star)} className="transition-transform hover:scale-125 active:scale-110">
            <svg className={`w-7 h-7 transition-colors ${star <= (hover||rating) ? 'text-amber-400' : 'text-zinc-700'}`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
      </div>
      <span className="text-xs text-zinc-400">{rating}.0 / 5.0 · Excelente</span>
    </div>
  );
};

const AccordionPreview = () => {
  const [open, setOpen] = React.useState<number|null>(0);
  const items = [
    {q:'¿Cómo empezar?',a:'Crea tu cuenta e importa un template en segundos.'},
    {q:'¿Hay versión gratuita?',a:'Sí, plan Free con funciones básicas incluidas.'},
    {q:'¿Soporta TypeScript?',a:'Nativamente, con tipado automático completo.'},
  ];
  return (
    <div className="w-60 space-y-1.5">
      {items.map((item,i) => (
        <div key={i} className="bg-zinc-800/80 border border-white/10 rounded-xl overflow-hidden">
          <button onClick={() => setOpen(open===i?null:i)} className="w-full flex items-center justify-between px-4 py-3 text-left">
            <span className="text-xs font-semibold text-white">{item.q}</span>
            <svg className={`w-4 h-4 text-zinc-500 transition-transform flex-shrink-0 ${open===i?'rotate-180 text-violet-400':''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {open===i && (
            <div className="px-4 pb-3 border-t border-white/5">
              <p className="text-xs text-zinc-400 pt-2">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const StepperPreview = () => {
  const [step, setStep] = React.useState(2);
  const steps = ['Cuenta','Plan','Config','Listo'];
  return (
    <div className="w-60">
      <div className="flex items-center mb-3">
        {steps.map((s,i) => (
          <React.Fragment key={s}>
            <button onClick={() => setStep(i)} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 z-10 transition-all ${i<step?'bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-500/30':i===step?'border-violet-500 text-violet-400 bg-violet-500/10':'border-zinc-700 text-zinc-600'}`}>
              {i<step?'✓':i+1}
            </button>
            {i<steps.length-1 && <div className={`flex-1 h-0.5 transition-colors ${i<step?'bg-violet-600':'bg-zinc-700'}`} />}
          </React.Fragment>
        ))}
      </div>
      <div className="flex justify-between">
        {steps.map((s,i) => (
          <span key={s} className={`text-[10px] transition-colors ${i===step?'text-white font-semibold':i<step?'text-violet-400':'text-zinc-600'}`}>{s}</span>
        ))}
      </div>
    </div>
  );
};

const TagsInputPreview = () => {
  const [tags, setTags] = React.useState(['React','TypeScript','Tailwind']);
  return (
    <div className="w-60">
      <div className="flex flex-wrap gap-2 p-3 bg-zinc-800/80 border border-white/10 rounded-xl min-h-[50px]">
        {tags.map(tag => (
          <span key={tag} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/15 border border-violet-500/25 text-xs text-violet-300 font-medium">
            {tag}
            <button onClick={() => setTags(t => t.filter(x => x!==tag))} className="text-violet-400/50 hover:text-violet-200 leading-none">×</button>
          </span>
        ))}
        <span className="text-xs text-zinc-600 self-center">añadir...</span>
      </div>
    </div>
  );
};

// ── New Cards Previews ────────────────────────────────────────────────────────

const KanbanCardPreview = () => (
  <div className="w-56 bg-zinc-800/90 border border-white/10 rounded-xl p-4 shadow-xl hover:border-violet-500/30 transition-all cursor-grab">
    <div className="flex items-start justify-between mb-3">
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-2 py-0.5">
        <span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" />
        En progreso
      </span>
      <span className="text-base">🔥</span>
    </div>
    <p className="text-sm font-semibold text-white mb-1.5">Rediseñar landing page</p>
    <p className="text-xs text-zinc-400 mb-3 leading-relaxed">Hero section con animaciones y CTA mejorado.</p>
    <div className="h-1 bg-zinc-700 rounded-full mb-3">
      <div className="h-full w-3/5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
    </div>
    <div className="flex items-center justify-between">
      <div className="flex -space-x-2">
        {['#7c3aed','#06b6d4','#db2777'].map((c,i) => (
          <div key={i} className="w-6 h-6 rounded-full border-2 border-zinc-800 flex items-center justify-center text-[8px] font-bold text-white" style={{background:c}}>
            {String.fromCharCode(65+i)}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 text-[10px] text-zinc-500">
        <span>📎 3</span><span>💬 7</span>
      </div>
    </div>
  </div>
);

const TestimonialCardPreview = () => (
  <div className="bg-zinc-800/80 border border-white/10 rounded-2xl p-5 w-60">
    <div className="text-2xl text-violet-400/40 mb-1 font-serif leading-none">"</div>
    <p className="text-xs text-zinc-300 leading-relaxed mb-3">Orion Studio transformó mi flujo de trabajo. Genero interfaces en minutos que antes me tomaban días.</p>
    <div className="flex gap-0.5 mb-3">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
    <div className="flex items-center gap-3 border-t border-white/5 pt-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">MR</div>
      <div>
        <p className="text-xs font-semibold text-white">María Rodríguez</p>
        <p className="text-[10px] text-zinc-500">Senior Designer @ Vercel</p>
      </div>
    </div>
  </div>
);

// ── New Data Display Previews ─────────────────────────────────────────────────

const BarChartPreview = () => {
  const data = [
    {label:'Lun',value:65},{label:'Mar',value:88},{label:'Mié',value:52},
    {label:'Jue',value:95},{label:'Vie',value:78},{label:'Sáb',value:42},{label:'Dom',value:33},
  ];
  return (
    <div className="w-56">
      <div className="flex items-end gap-1.5 h-24 mb-2">
        {data.map((d,i) => (
          <div key={d.label} className="flex-1 flex flex-col items-center">
            <div className={`w-full rounded-t-md ${i===3?'bg-gradient-to-t from-cyan-600 to-cyan-400':'bg-gradient-to-t from-violet-700 to-violet-500'}`}
              style={{height:`${d.value}%`,minHeight:4}} />
          </div>
        ))}
      </div>
      <div className="flex gap-1.5">
        {data.map(d => <div key={d.label} className="flex-1 text-center text-[9px] text-zinc-600">{d.label}</div>)}
      </div>
    </div>
  );
};

const CodeBlockPreview = () => {
  const [copied, setCopied] = React.useState(false);
  return (
    <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden w-60 shadow-xl">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-zinc-800/50">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
        </div>
        <span className="text-[10px] text-zinc-500 font-mono">App.tsx</span>
        <button onClick={() => {setCopied(true); setTimeout(()=>setCopied(false),1500);}}
          className={`text-[10px] font-medium transition-colors ${copied?'text-emerald-400':'text-zinc-500 hover:text-zinc-300'}`}>
          {copied?'✓ Copiado':'Copiar'}
        </button>
      </div>
      <div className="p-3 text-[11px] font-mono leading-loose">
        <div><span className="text-violet-400">import</span> <span className="text-cyan-300">React</span> <span className="text-violet-400">from</span> <span className="text-amber-300">'react'</span></div>
        <div className="mt-1"><span className="text-violet-400">export const</span> <span className="text-cyan-300">App</span> <span className="text-zinc-400">= () =&gt; (</span></div>
        <div className="pl-4"><span className="text-amber-300">&lt;h1&gt;</span><span className="text-zinc-300">Hola Mundo</span><span className="text-amber-300">&lt;/h1&gt;</span></div>
        <div><span className="text-zinc-400">)</span></div>
      </div>
    </div>
  );
};

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
    id: 'breadcrumb',
    name: 'Breadcrumb',
    category: 'Navigation',
    tags: ['breadcrumb', 'navegacion', 'ruta', 'path', 'migas'],
    description: 'Indicador de ruta jerárquica con separadores',
    preview: BreadcrumbPreview,
    fileName: 'Breadcrumb.tsx',
    code: `interface BreadcrumbProps {
  items: { label: string; href?: string }[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1.5 text-sm">
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-zinc-600">/</span>}
          {item.href && i < items.length - 1 ? (
            <a href={item.href} className="text-zinc-400 hover:text-white transition-colors">
              {item.label}
            </a>
          ) : (
            <span className="text-white font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
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
  // ── Animations ─────────────────────────────────────────────────────────────
  {
    id: 'typewriter',
    name: 'Typewriter Text',
    category: 'Animations',
    tags: ['typewriter', 'texto', 'animacion', 'escritura', 'loop'],
    description: 'Efecto máquina de escribir con borrado y loop infinito',
    preview: TypewriterPreview,
    fileName: 'TypewriterText.tsx',
    code: `import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  words: string[];
  prefix?: string;
  speed?: number;
  deleteSpeed?: number;
  pauseMs?: number;
}

export function TypewriterText({ words, prefix = 'Build better', speed = 90, deleteSpeed = 50, pauseMs = 1200 }: TypewriterTextProps) {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[idx];
    if (!deleting && displayed === word) {
      const t = setTimeout(() => setDeleting(true), pauseMs);
      return () => clearTimeout(t);
    }
    if (deleting && displayed === '') {
      setDeleting(false);
      setIdx(i => (i + 1) % words.length);
      return;
    }
    const t = setTimeout(() => {
      setDisplayed(deleting
        ? displayed.slice(0, -1)
        : word.slice(0, displayed.length + 1)
      );
    }, deleting ? deleteSpeed : speed);
    return () => clearTimeout(t);
  }, [displayed, deleting, idx, words, speed, deleteSpeed, pauseMs]);

  return (
    <p className="text-2xl font-bold text-white">
      {prefix}{' '}
      <span className="text-violet-400">{displayed}</span>
      <span className="animate-pulse text-violet-400">|</span>
    </p>
  );
}`,
  },
  {
    id: 'ripple-button',
    name: 'Ripple Button',
    category: 'Animations',
    tags: ['button', 'ripple', 'animacion', 'click', 'onda', 'material'],
    description: 'Botón con efecto onda al hacer click estilo Material',
    preview: RippleButtonPreview,
    fileName: 'RippleButton.tsx',
    code: `import { useState, MouseEvent } from 'react';

interface Ripple { id: number; x: number; y: number; }

interface RippleButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function RippleButton({ children, onClick, className = '' }: RippleButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples(r => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples(r => r.filter(rr => rr.id !== id)), 600);
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      className={\`relative overflow-hidden px-6 py-2.5 rounded-xl bg-violet-600
        text-white font-semibold text-sm transition-colors hover:bg-violet-500 \${className}\`}
    >
      {ripples.map(r => (
        <span
          key={r.id}
          className="absolute rounded-full bg-white/30 animate-ping pointer-events-none"
          style={{ left: r.x - 20, top: r.y - 20, width: 40, height: 40, animationDuration: '0.6s' }}
        />
      ))}
      {children}
    </button>
  );
}`,
  },
  {
    id: 'floating-card',
    name: 'Floating Card',
    category: 'Animations',
    tags: ['card', 'flotante', 'animacion', 'levitacion', 'hover'],
    description: 'Tarjeta con animación de levitación continua',
    preview: FloatingCardPreview,
    fileName: 'FloatingCard.tsx',
    code: `interface FloatingCardProps {
  emoji?: string;
  title: string;
  subtitle?: string;
}

export function FloatingCard({ emoji = '🚀', title, subtitle }: FloatingCardProps) {
  return (
    <>
      <style>{\`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
      \`}</style>
      <div style={{ animation: 'float 3s ease-in-out infinite' }}>
        <div className="bg-gradient-to-br from-violet-900/80 to-cyan-900/40
          border border-violet-500/30 rounded-2xl p-6 text-center
          shadow-xl shadow-violet-500/20 hover:[animation-play-state:paused]">
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
    id: 'skeleton-loader',
    name: 'Skeleton Loader',
    category: 'Animations',
    tags: ['skeleton', 'loader', 'carga', 'placeholder', 'shimmer'],
    description: 'Placeholder animado tipo skeleton para estados de carga',
    preview: SkeletonPreview,
    fileName: 'SkeletonLoader.tsx',
    code: `export function SkeletonLoader() {
  return (
    <div className="space-y-3 w-full max-w-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-zinc-700 animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-2.5 bg-zinc-700 rounded-full animate-pulse w-3/4" />
          <div className="h-2 bg-zinc-700/60 rounded-full animate-pulse w-1/2" />
        </div>
      </div>
      <div className="h-2 bg-zinc-700 rounded-full animate-pulse" />
      <div className="h-2 bg-zinc-700 rounded-full animate-pulse w-5/6" />
      <div className="h-2 bg-zinc-700/60 rounded-full animate-pulse w-4/6" />
      <div className="h-20 bg-zinc-700/40 rounded-xl animate-pulse" />
    </div>
  );
}`,
  },
  {
    id: 'glow-border-card',
    name: 'Glow Border Card',
    category: 'Animations',
    tags: ['card', 'borde', 'glow', 'gradiente', 'animado', 'aurora'],
    description: 'Tarjeta con borde de gradiente animado en loop',
    preview: GlowBorderPreview,
    fileName: 'GlowBorderCard.tsx',
    code: `interface GlowBorderCardProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function GlowBorderCard({ title, subtitle, children }: GlowBorderCardProps) {
  return (
    <>
      <style>{\`
        @keyframes border-flow {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      \`}</style>
      <div
        className="relative p-[1.5px] rounded-2xl"
        style={{
          background: 'linear-gradient(90deg, #7c3aed, #06b6d4, #db2777, #7c3aed)',
          backgroundSize: '300% 100%',
          animation: 'border-flow 4s linear infinite',
        }}
      >
        <div className="bg-zinc-900 rounded-2xl p-6">
          <div className="text-base font-bold text-white">{title}</div>
          {subtitle && <div className="text-xs text-zinc-400 mt-1">{subtitle}</div>}
          {children}
        </div>
      </div>
    </>
  );
}`,
  },
  // ── Data Display ───────────────────────────────────────────────────────────
  {
    id: 'stat-counter',
    name: 'Stat Counter',
    category: 'Data Display',
    tags: ['contador', 'numero', 'animado', 'estadistica', 'kpi', 'count'],
    description: 'Contador animado que incrementa hasta el valor objetivo',
    preview: CounterPreview,
    fileName: 'StatCounter.tsx',
    code: `import { useState, useEffect } from 'react';

interface StatCounterProps {
  target: number;
  label: string;
  change?: string;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

export function StatCounter({ target, label, change, duration = 1000, prefix = '', suffix = '' }: StatCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const steps = 60;
    const step = target / steps;
    const interval = duration / steps;
    const timer = setInterval(() => {
      setCount(c => {
        const next = c + step;
        if (next >= target) { clearInterval(timer); return target; }
        return next;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [target, duration]);

  return (
    <div className="text-center space-y-1">
      <div className="text-4xl font-black text-white tabular-nums">
        {prefix}{Math.floor(count).toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-zinc-500">{label}</div>
      {change && <div className="text-xs text-emerald-400 font-medium">{change}</div>}
    </div>
  );
}`,
  },
  {
    id: 'donut-chart',
    name: 'Donut Chart',
    category: 'Data Display',
    tags: ['grafica', 'donut', 'pie', 'chart', 'porcentaje', 'svg'],
    description: 'Gráfica de dona SVG con leyenda y animación de entrada',
    preview: DonutChartPreview,
    fileName: 'DonutChart.tsx',
    code: `interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
}

export function DonutChart({ segments, size = 120, strokeWidth = 18 }: DonutChartProps) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  let cumulative = 0;

  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox={\`0 0 \${size} \${size}\`}>
        {segments.map(s => {
          const dash = (s.value / 100) * circumference;
          const gap = circumference - dash;
          const offset = circumference - (cumulative / 100) * circumference;
          cumulative += s.value;
          return (
            <circle key={s.label} cx={cx} cy={cy} r={r} fill="none"
              stroke={s.color} strokeWidth={strokeWidth}
              strokeDasharray={\`\${dash} \${gap}\`}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          );
        })}
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
          fontSize={12} fill="white" fontWeight="bold">
          100%
        </text>
      </svg>
      <div className="space-y-2">
        {segments.map(s => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <span className="text-sm text-zinc-400">{s.label}</span>
            <span className="text-sm text-white font-semibold ml-auto pl-3">{s.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}`,
  },
  {
    id: 'timeline',
    name: 'Timeline',
    category: 'Data Display',
    tags: ['timeline', 'linea', 'tiempo', 'historial', 'eventos', 'log'],
    description: 'Línea de tiempo vertical con eventos y colores personalizables',
    preview: TimelinePreview,
    fileName: 'Timeline.tsx',
    code: `interface TimelineEvent {
  label: string;
  time: string;
  color?: string;
  description?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  return (
    <div className="space-y-0">
      {events.map((event, i) => (
        <div key={event.label} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0 mt-1 ring-2 ring-zinc-900"
              style={{ background: event.color ?? '#7c3aed' }}
            />
            {i < events.length - 1 && (
              <div className="w-px flex-1 bg-zinc-700/60 mt-1" style={{ minHeight: 24 }} />
            )}
          </div>
          <div className="pb-5">
            <p className="text-sm font-semibold text-white leading-none">{event.label}</p>
            {event.description && (
              <p className="text-xs text-zinc-400 mt-0.5">{event.description}</p>
            )}
            <p className="text-xs text-zinc-600 mt-1">{event.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}`,
  },
  // ── Loaders ────────────────────────────────────────────────────────────────
  {
    id: 'gradient-spinner',
    name: 'Gradient Spinner',
    category: 'Loaders',
    tags: ['loader', 'spinner', 'cargando', 'animado', 'gradiente', 'circular'],
    description: 'Spinner circular con gradiente cónico violet-cyan en tres tamaños',
    preview: GradientSpinnerPreview,
    fileName: 'GradientSpinner.tsx',
    code: `type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZES: Record<SpinnerSize, string> = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

interface GradientSpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

export function GradientSpinner({ size = 'md', className = '' }: GradientSpinnerProps) {
  return (
    <div className={\`relative animate-spin \${SIZES[size]} \${className}\`}>
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'conic-gradient(from 0deg, transparent 0%, #7c3aed 40%, #06b6d4 70%, transparent 100%)',
        }}
      />
      <div className="absolute inset-[3px] bg-background rounded-full" />
    </div>
  );
}`,
  },
  {
    id: 'dots-loader',
    name: 'Dots Loader',
    category: 'Loaders',
    tags: ['loader', 'dots', 'puntos', 'bounce', 'wave', 'animacion', 'cargando'],
    description: 'Loader de puntos con variante bounce y wave en colores personalizables',
    preview: DotsLoaderPreview,
    fileName: 'DotsLoader.tsx',
    code: `type DotsVariant = 'bounce' | 'wave';

interface DotsLoaderProps {
  variant?: DotsVariant;
  color?: string;
  count?: number;
}

export function DotsLoader({ variant = 'bounce', color = 'bg-violet-500', count = 3 }: DotsLoaderProps) {
  return (
    <div className="flex gap-2 items-center">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={\`w-3 h-3 rounded-full \${color} \${
            variant === 'bounce' ? 'animate-bounce' : 'animate-pulse'
          }\`}
          style={{ animationDelay: \`\${i * 0.15}s\` }}
        />
      ))}
    </div>
  );
}`,
  },
  {
    id: 'bar-loader',
    name: 'Bar Loader',
    category: 'Loaders',
    tags: ['loader', 'barra', 'progreso', 'sweep', 'indeterminado', 'cargando', 'top'],
    description: 'Barra de carga indeterminada con efecto sweep y versión determinada con porcentaje',
    preview: BarLoaderPreview,
    fileName: 'BarLoader.tsx',
    code: `interface BarLoaderProps {
  /** Valor 0-100 para modo determinado. undefined = indeterminado */
  value?: number;
  label?: string;
  className?: string;
}

export function BarLoader({ value, label, className = '' }: BarLoaderProps) {
  const indeterminate = value === undefined;
  return (
    <div className={\`space-y-1.5 \${className}\`}>
      {label !== undefined && (
        <div className="flex justify-between items-center text-xs text-zinc-400">
          <span>{label}</span>
          {indeterminate
            ? <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-700 border-t-violet-500 animate-spin" />
            : <span className="text-cyan-400 font-medium">{value}%</span>
          }
        </div>
      )}
      <div className="relative h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        {indeterminate ? (
          <>
            <style>{\`
              @keyframes bar-sweep {
                0%   { transform: translateX(-100%); }
                100% { transform: translateX(350%); }
              }
            \`}</style>
            <div
              className="absolute h-full w-1/2 bg-gradient-to-r from-violet-600 via-cyan-400 to-violet-600 rounded-full"
              style={{ animation: 'bar-sweep 1.4s ease-in-out infinite' }}
            />
          </>
        ) : (
          <div
            className="h-full bg-gradient-to-r from-cyan-600 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: \`\${value}%\` }}
          />
        )}
      </div>
    </div>
  );
}`,
  },
  {
    id: 'pulse-ring-loader',
    name: 'Pulse Ring Loader',
    category: 'Loaders',
    tags: ['loader', 'pulse', 'ring', 'anillos', 'ondas', 'ping', 'radar'],
    description: 'Loader de anillos concéntricos expandiéndose tipo radar o sonar',
    preview: PulseRingLoaderPreview,
    fileName: 'PulseRingLoader.tsx',
    code: `type RingColor = 'violet' | 'cyan' | 'emerald' | 'rose';

interface PulseRingLoaderProps {
  color?: RingColor;
  size?: number;
  rings?: number;
}

const COLORS: Record<RingColor, { border: string; center: string; shadow: string }> = {
  violet:  { border: 'border-violet-500',  center: 'from-violet-500 to-violet-700', shadow: 'shadow-violet-500/40' },
  cyan:    { border: 'border-cyan-400',    center: 'from-cyan-400 to-blue-600',     shadow: 'shadow-cyan-500/30' },
  emerald: { border: 'border-emerald-400', center: 'from-emerald-400 to-teal-600',  shadow: 'shadow-emerald-500/30' },
  rose:    { border: 'border-rose-400',    center: 'from-rose-400 to-pink-600',     shadow: 'shadow-rose-500/30' },
};

export function PulseRingLoader({ color = 'violet', size = 56, rings = 3 }: PulseRingLoaderProps) {
  const c = COLORS[color];
  const dotSize = Math.round(size * 0.43);
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {Array.from({ length: rings }).map((_, i) => {
        const ringSize = dotSize + (size - dotSize) * ((i + 1) / rings);
        return (
          <div
            key={i}
            className={\`absolute rounded-full border \${c.border} animate-ping\`}
            style={{ width: ringSize, height: ringSize, animationDuration: '1.5s', animationDelay: \`\${i * 0.3}s\`, opacity: 0.7 - i * 0.2 }}
          />
        );
      })}
      <div className={\`rounded-full bg-gradient-to-br \${c.center} shadow-lg \${c.shadow} z-10\`} style={{ width: dotSize, height: dotSize }} />
    </div>
  );
}`,
  },
  {
    id: 'orbit-loader',
    name: 'Orbit Loader',
    category: 'Loaders',
    tags: ['loader', 'orbit', 'orbita', 'planeta', 'girar', 'solar', 'animacion'],
    description: 'Loader estilo sistema solar con puntos orbitando un núcleo central',
    preview: OrbitLoaderPreview,
    fileName: 'OrbitLoader.tsx',
    code: `export function OrbitLoader() {
  return (
    <>
      <style>{\`
        @keyframes orbit-a {
          from { transform: rotate(0deg) translateX(24px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(24px) rotate(-360deg); }
        }
        @keyframes orbit-b {
          from { transform: rotate(90deg) translateX(16px) rotate(-90deg); }
          to   { transform: rotate(450deg) translateX(16px) rotate(-450deg); }
        }
      \`}</style>
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute w-full h-full rounded-full border border-zinc-700/50" />
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 shadow-lg shadow-violet-500/50 z-10" />
        <div
          className="absolute w-3.5 h-3.5 rounded-full bg-cyan-400 shadow shadow-cyan-400/60"
          style={{ animation: 'orbit-a 1.1s linear infinite' }}
        />
        <div
          className="absolute w-2 h-2 rounded-full bg-pink-400 shadow shadow-pink-400/60"
          style={{ animation: 'orbit-b 0.75s linear infinite' }}
        />
      </div>
    </>
  );
}`,
  },
  // ── More UI Elements ───────────────────────────────────────────────────────
  {
    id: 'toggle-switch',
    name: 'Toggle Switch',
    category: 'UI Elements',
    tags: ['toggle', 'switch', 'interruptor', 'on', 'off', 'settings', 'boolean'],
    description: 'Toggle animado con transición suave para configuraciones on/off',
    preview: ToggleSwitchPreview,
    fileName: 'ToggleSwitch.tsx',
    code: `import { useState } from 'react';

interface ToggleSwitchProps {
  label?: string;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export function ToggleSwitch({ label, defaultChecked = false, onChange, disabled = false }: ToggleSwitchProps) {
  const [on, setOn] = useState(defaultChecked);

  const handleToggle = () => {
    if (disabled) return;
    const next = !on;
    setOn(next);
    onChange?.(next);
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleToggle}
        disabled={disabled}
        className={\`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 \${
          on ? 'bg-violet-600' : 'bg-zinc-700'
        } \${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}\`}
        role="switch"
        aria-checked={on}
      >
        <div
          className={\`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 \${
            on ? 'translate-x-6' : 'translate-x-1'
          }\`}
        />
      </button>
      {label && (
        <span className={\`text-sm \${on ? 'text-white' : 'text-zinc-400'} transition-colors\`}>
          {label}
        </span>
      )}
    </div>
  );
}`,
  },
  {
    id: 'rating-stars',
    name: 'Rating Stars',
    category: 'UI Elements',
    tags: ['rating', 'stars', 'estrellas', 'calificacion', 'review', 'score', 'favorito'],
    description: 'Componente de calificación interactivo con hover animado y escala de 1-5',
    preview: RatingStarsPreview,
    fileName: 'RatingStars.tsx',
    code: `import { useState } from 'react';

interface RatingStarsProps {
  defaultRating?: number;
  max?: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = { sm: 'w-5 h-5', md: 'w-7 h-7', lg: 'w-9 h-9' };

export function RatingStars({ defaultRating = 0, max = 5, onChange, readOnly = false, size = 'md' }: RatingStarsProps) {
  const [rating, setRating] = useState(defaultRating);
  const [hover, setHover] = useState(0);
  const sz = SIZES[size];

  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => {
        const star = i + 1;
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onMouseEnter={() => !readOnly && setHover(star)}
            onMouseLeave={() => !readOnly && setHover(0)}
            onClick={() => { if (!readOnly) { setRating(star); onChange?.(star); } }}
            className={\`transition-transform \${readOnly ? 'cursor-default' : 'hover:scale-125 active:scale-110'}\`}
          >
            <svg
              className={\`\${sz} transition-colors \${
                star <= (hover || rating) ? 'text-amber-400' : 'text-zinc-700'
              }\`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}`,
  },
  {
    id: 'accordion',
    name: 'Accordion',
    category: 'UI Elements',
    tags: ['accordion', 'collapse', 'faq', 'expandir', 'plegar', 'pregunta', 'respuesta'],
    description: 'Acordeón colapsable con animación suave tipo FAQ o settings',
    preview: AccordionPreview,
    fileName: 'Accordion.tsx',
    code: `import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItem {
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
}

export function Accordion({ items, allowMultiple = false }: AccordionProps) {
  const [open, setOpen] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setOpen(prev => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="bg-zinc-800/80 border border-white/10 rounded-xl overflow-hidden">
          <button
            onClick={() => toggle(i)}
            className="w-full flex items-center justify-between px-4 py-3.5 text-left gap-3"
          >
            <span className="text-sm font-semibold text-white">{item.question}</span>
            <ChevronDown
              className={\`w-4 h-4 flex-shrink-0 transition-transform duration-300 \${
                open.has(i) ? 'rotate-180 text-violet-400' : 'text-zinc-500'
              }\`}
            />
          </button>
          {open.has(i) && (
            <div className="px-4 pb-4 border-t border-white/5">
              <p className="text-sm text-zinc-400 pt-3 leading-relaxed">{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}`,
  },
  {
    id: 'stepper',
    name: 'Stepper',
    category: 'UI Elements',
    tags: ['stepper', 'pasos', 'wizard', 'onboarding', 'progreso', 'steps', 'formulario'],
    description: 'Indicador de pasos multi-etapa para wizards y onboarding flows',
    preview: StepperPreview,
    fileName: 'Stepper.tsx',
    code: `import { useState } from 'react';
import { Check } from 'lucide-react';

interface StepperProps {
  steps: string[];
  initialStep?: number;
  onStepChange?: (step: number) => void;
}

export function Stepper({ steps, initialStep = 0, onStepChange }: StepperProps) {
  const [current, setCurrent] = useState(initialStep);

  const goTo = (i: number) => {
    setCurrent(i);
    onStepChange?.(i);
  };

  return (
    <div>
      <div className="flex items-center">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => goTo(i)}
              className={\`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 z-10 transition-all \${
                i < current
                  ? 'bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-500/30'
                  : i === current
                  ? 'border-violet-500 text-violet-400 bg-violet-500/10'
                  : 'border-zinc-700 text-zinc-600'
              }\`}
            >
              {i < current ? <Check className="w-4 h-4" /> : i + 1}
            </button>
            {i < steps.length - 1 && (
              <div className={\`flex-1 h-0.5 transition-colors mx-1 \${i < current ? 'bg-violet-600' : 'bg-zinc-700'}\`} />
            )}
          </div>
        ))}
      </div>
      <div className="flex mt-2">
        {steps.map((step, i) => (
          <div key={step} className="flex-1 last:flex-none">
            <span className={\`text-xs block text-center transition-colors \${
              i === current ? 'text-white font-semibold' : i < current ? 'text-violet-400' : 'text-zinc-600'
            }\`}>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}`,
  },
  {
    id: 'tags-input',
    name: 'Tags Input',
    category: 'UI Elements',
    tags: ['tags', 'chips', 'etiquetas', 'input', 'multiselect', 'removable'],
    description: 'Input de etiquetas removibles estilo chip con teclado (Enter para añadir)',
    preview: TagsInputPreview,
    fileName: 'TagsInput.tsx',
    code: `import { useState, KeyboardEvent } from 'react';

interface TagsInputProps {
  initialTags?: string[];
  placeholder?: string;
  onChange?: (tags: string[]) => void;
  maxTags?: number;
}

export function TagsInput({ initialTags = [], placeholder = 'Añadir...', onChange, maxTags }: TagsInputProps) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [input, setInput] = useState('');

  const addTag = (value: string) => {
    const tag = value.trim();
    if (!tag || tags.includes(tag) || (maxTags && tags.length >= maxTags)) return;
    const next = [...tags, tag];
    setTags(next);
    onChange?.(next);
    setInput('');
  };

  const removeTag = (tag: string) => {
    const next = tags.filter(t => t !== tag);
    setTags(next);
    onChange?.(next);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(input); }
    if (e.key === 'Backspace' && !input && tags.length) removeTag(tags[tags.length - 1]);
  };

  return (
    <div className="flex flex-wrap gap-2 p-2.5 bg-zinc-800/80 border border-white/10 rounded-xl
      focus-within:border-violet-500/40 transition-colors min-h-[44px]">
      {tags.map(tag => (
        <span key={tag} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg
          bg-violet-500/15 border border-violet-500/25 text-xs text-violet-300 font-medium">
          {tag}
          <button onClick={() => removeTag(tag)} className="text-violet-400/50 hover:text-violet-200 leading-none text-sm">×</button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[80px] bg-transparent text-sm text-white placeholder:text-zinc-600 outline-none"
      />
    </div>
  );
}`,
  },
  // ── More Cards ─────────────────────────────────────────────────────────────
  {
    id: 'kanban-card',
    name: 'Kanban Card',
    category: 'Cards',
    tags: ['kanban', 'task', 'tarea', 'board', 'ticket', 'proyecto', 'trello'],
    description: 'Tarjeta de tarea estilo Kanban con estado, progreso y avatares de equipo',
    preview: KanbanCardPreview,
    fileName: 'KanbanCard.tsx',
    code: `interface KanbanCardProps {
  title: string;
  description?: string;
  status?: 'todo' | 'in-progress' | 'review' | 'done';
  progress?: number;
  assignees?: { name: string; color?: string }[];
  attachments?: number;
  comments?: number;
  priority?: 'low' | 'medium' | 'high';
}

const STATUS_CONFIG = {
  'todo':        { label: 'Por hacer',   color: 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20' },
  'in-progress': { label: 'En progreso', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  'review':      { label: 'En revisión', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  'done':        { label: 'Completado',  color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
};

export function KanbanCard({ title, description, status = 'todo', progress, assignees = [], attachments, comments, priority }: KanbanCardProps) {
  const s = STATUS_CONFIG[status];
  return (
    <div className="bg-zinc-800/90 border border-white/10 rounded-xl p-4 shadow-lg
      hover:border-violet-500/30 transition-all cursor-grab active:cursor-grabbing group">
      <div className="flex items-start justify-between mb-3">
        <span className={\`inline-flex items-center gap-1 text-[10px] font-semibold border rounded-full px-2 py-0.5 \${s.color}\`}>
          <span className="w-1 h-1 rounded-full bg-current animate-pulse" />
          {s.label}
        </span>
        {priority === 'high' && <span className="text-base">🔥</span>}
      </div>
      <p className="text-sm font-semibold text-white mb-1.5">{title}</p>
      {description && <p className="text-xs text-zinc-400 mb-3 leading-relaxed">{description}</p>}
      {progress !== undefined && (
        <div className="h-1 bg-zinc-700 rounded-full mb-3">
          <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all" style={{ width: \`\${progress}%\` }} />
        </div>
      )}
      {(assignees.length > 0 || attachments || comments) && (
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {assignees.slice(0, 4).map((u, i) => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-zinc-800 flex items-center justify-center text-[8px] font-bold text-white"
                style={{ background: u.color ?? '#7c3aed' }}>
                {u.name.slice(0, 2).toUpperCase()}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-zinc-500">
            {attachments && <span>📎 {attachments}</span>}
            {comments && <span>💬 {comments}</span>}
          </div>
        </div>
      )}
    </div>
  );
}`,
  },
  {
    id: 'testimonial-card',
    name: 'Testimonial Card',
    category: 'Cards',
    tags: ['testimonial', 'review', 'opinion', 'cliente', 'cita', 'quote', 'social proof'],
    description: 'Tarjeta de testimonio con cita, estrellas y perfil del autor',
    preview: TestimonialCardPreview,
    fileName: 'TestimonialCard.tsx',
    code: `interface TestimonialCardProps {
  quote: string;
  author: string;
  role?: string;
  avatar?: string;
  rating?: number;
  company?: string;
}

export function TestimonialCard({ quote, author, role, avatar, rating = 5, company }: TestimonialCardProps) {
  const initials = author.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="bg-zinc-800/80 border border-white/10 rounded-2xl p-6 hover:border-zinc-700 transition-all">
      <div className="text-3xl text-violet-400/40 mb-2 font-serif leading-none">"</div>
      <p className="text-sm text-zinc-300 leading-relaxed mb-4">{quote}</p>
      {rating > 0 && (
        <div className="flex gap-0.5 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} className={\`w-4 h-4 \${i < rating ? 'text-amber-400' : 'text-zinc-700'}\`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>
      )}
      <div className="flex items-center gap-3 border-t border-white/5 pt-4">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 overflow-hidden">
          {avatar ? <img src={avatar} alt={author} className="w-full h-full object-cover" /> : initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{author}</p>
          {(role || company) && <p className="text-xs text-zinc-500">{[role, company].filter(Boolean).join(' @ ')}</p>}
        </div>
      </div>
    </div>
  );
}`,
  },
  // ── More Data Display ──────────────────────────────────────────────────────
  {
    id: 'bar-chart',
    name: 'Bar Chart',
    category: 'Data Display',
    tags: ['grafica', 'barra', 'bar', 'chart', 'datos', 'estadistica', 'semana'],
    description: 'Gráfica de barras verticales animada con datos y etiquetas personalizables',
    preview: BarChartPreview,
    fileName: 'BarChart.tsx',
    code: `interface BarChartDataPoint {
  label: string;
  value: number;
  highlight?: boolean;
}

interface BarChartProps {
  data: BarChartDataPoint[];
  height?: number;
  primaryColor?: string;
  highlightColor?: string;
  showValues?: boolean;
}

export function BarChart({
  data,
  height = 120,
  primaryColor = 'from-violet-700 to-violet-500',
  highlightColor = 'from-cyan-600 to-cyan-400',
  showValues = false,
}: BarChartProps) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div>
      <div className="flex items-end gap-1.5 mb-2" style={{ height }}>
        {data.map(d => (
          <div key={d.label} className="flex-1 flex flex-col items-center justify-end gap-1">
            {showValues && (
              <span className="text-[10px] text-zinc-500">{d.value}</span>
            )}
            <div
              className={\`w-full rounded-t-md bg-gradient-to-t transition-all duration-700 \${
                d.highlight ? highlightColor : primaryColor
              }\`}
              style={{ height: \`\${(d.value / max) * 100}%\`, minHeight: 4 }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-1.5">
        {data.map(d => (
          <div key={d.label} className="flex-1 text-center text-[10px] text-zinc-600 truncate">{d.label}</div>
        ))}
      </div>
    </div>
  );
}`,
  },
  {
    id: 'code-block',
    name: 'Code Block',
    category: 'Data Display',
    tags: ['codigo', 'code', 'snippet', 'syntax', 'copiar', 'monospace', 'bloque'],
    description: 'Bloque de código estilizado con cabecera macOS, nombre de archivo y botón copiar',
    preview: CodeBlockPreview,
    fileName: 'CodeBlock.tsx',
    code: `import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  fileName?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({ code, language = 'tsx', fileName, showLineNumbers = false }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const lines = code.split('\\n');

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-xl">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-zinc-800/50">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-amber-500/70" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
        </div>
        <span className="text-xs text-zinc-500 font-mono">{fileName ?? language}</span>
        <button
          onClick={handleCopy}
          className={\`flex items-center gap-1.5 text-xs font-medium transition-colors \${
            copied ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
          }\`}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono leading-relaxed">
          {lines.map((line, i) => (
            <div key={i} className="flex gap-4">
              {showLineNumbers && (
                <span className="select-none text-zinc-600 w-6 text-right flex-shrink-0">{i + 1}</span>
              )}
              <span className="text-zinc-200">{line}</span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}`,
  },
];

// ── PREVIEW_MAP: keyed by component id/slug, used to hydrate API responses ──
export const PREVIEW_MAP: Record<string, React.FC> = {
  'gradient-button': GradientButtonPreview,
  'glow-button': GlowButtonPreview,
  'shimmer-button': ShimmerButtonPreview,
  'outline-button': OutlineButtonPreview,
  'icon-button': IconButtonPreview,
  'stats-card': StatsCardPreview,
  'pricing-card': PricingCardPreview,
  'profile-card': ProfileCardPreview,
  'feature-card': FeatureCardPreview,
  'glass-card': GlassCardPreview,
  'login-form': LoginFormPreview,
  'search-bar': SearchBarPreview,
  'newsletter-form': NewsletterPreview,
  'otp-input': OTPPreview,
  'modern-navbar': NavbarPreview,
  'tab-nav': TabNavPreview,
  'breadcrumb': BreadcrumbPreview,
  'hero-section': HeroPreview,
  'feature-grid': FeatureGridPreview,
  'cta-section': CTASectionPreview,
  'animated-badge': AnimatedBadgePreview,
  'progress-bar': ProgressBarPreview,
  'avatar-group': AvatarGroupPreview,
  'notification-toast': NotificationPreview,
  'typewriter': TypewriterPreview,
  'ripple-button': RippleButtonPreview,
  'floating-card': FloatingCardPreview,
  'skeleton-loader': SkeletonPreview,
  'glow-border-card': GlowBorderPreview,
  'stat-counter': CounterPreview,
  'donut-chart': DonutChartPreview,
  'timeline': TimelinePreview,
  'gradient-spinner': GradientSpinnerPreview,
  'dots-loader': DotsLoaderPreview,
  'bar-loader': BarLoaderPreview,
  'pulse-ring-loader': PulseRingLoaderPreview,
  'orbit-loader': OrbitLoaderPreview,
  'toggle-switch': ToggleSwitchPreview,
  'rating-stars': RatingStarsPreview,
  'accordion': AccordionPreview,
  'stepper': StepperPreview,
  'tags-input': TagsInputPreview,
  'kanban-card': KanbanCardPreview,
  'testimonial-card': TestimonialCardPreview,
  'bar-chart': BarChartPreview,
  'code-block': CodeBlockPreview,
};

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
