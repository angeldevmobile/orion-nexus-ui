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
  ENTERPRISE: 'enterprise',
} as const;

// Límites de créditos por plan (inspirado en modelo Lovable)
// Free:       5 créditos/día  (máx 30/mes),  sin pool mensual
// Pro:       10 créditos/día + 500 pool mensual
// Enterprise: 50 créditos/día + 2000 pool mensual
export const PLAN_LIMITS = {
  free:       { daily: 5,  monthly: 0    },
  pro:        { daily: 10, monthly: 500  },
  enterprise: { daily: 50, monthly: 2000 },
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

export const PROJECT_TEMPLATES = {
  REACT: 'react',
  VUE: 'vue',
  ANGULAR: 'angular',
  VANILLA: 'vanilla',
  NEXT: 'nextjs',
  NUXT: 'nuxtjs',
} as const;