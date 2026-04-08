export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

export const SUBSCRIPTION_TYPES = {
  FREE: 'free',
  PRO: 'pro',
  BUSINESS: 'business',
  ENTERPRISE: 'enterprise',
} as const;

// Límites de créditos por plan
// Free:       5 créditos/día,  sin pool mensual          ($0)
// Pro:       20 créditos/día + 600 pool mensual           ($20/mes)
// Business:  60 créditos/día + 1800 pool mensual         ($45/mes)
// Enterprise: 200 créditos/día + 5000 pool (≈ ilimitado) (Platform fee)
export const PLAN_LIMITS = {
  free:       { daily: 5,   monthly: 0    },
  pro:        { daily: 20,  monthly: 600  },
  business:   { daily: 60,  monthly: 1800 },
  enterprise: { daily: 200, monthly: 5000 },
} as const;

// Costo en créditos por operación de IA
// Basado en costo real de los modelos con margen de ganancia
export const CREDIT_COSTS = {
  chat:             1,   // claude-haiku  ~$0.002  → 1 crédito
  generateCode:     2,   // gpt-4o-mini   ~$0.005  → 2 créditos
  generateComponent:5,   // claude-sonnet ~$0.051  → 5 créditos
  generateProject:  15,  // claude-sonnet ~$0.15   → 15 créditos
  analyzeCode:      1,   // gpt-4o-mini   ~$0.003  → 1 crédito
} as const;

export type CreditOperation = keyof typeof CREDIT_COSTS;
export type PlanName = keyof typeof PLAN_LIMITS;

// Capacidades por plan (fuente de verdad única)
// maxProjects: 0 = ilimitado
export const PLAN_FEATURES = {
  free:       { maxProjects: 3,   publishCommunity: false, privateProjects: false, teamManagement: false },
  pro:        { maxProjects: 0,   publishCommunity: true,  privateProjects: false, teamManagement: false },
  business:   { maxProjects: 0,   publishCommunity: true,  privateProjects: true,  teamManagement: true  },
  enterprise: { maxProjects: 0,   publishCommunity: true,  privateProjects: true,  teamManagement: true  },
} as const;

export type PlanFeature = keyof Omit<typeof PLAN_FEATURES['free'], 'maxProjects'>;

export const PROJECT_TEMPLATES = {
  REACT: 'react',
  VUE: 'vue',
  ANGULAR: 'angular',
  VANILLA: 'vanilla',
  NEXT: 'nextjs',
  NUXT: 'nuxtjs',
} as const;