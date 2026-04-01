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

export const PROJECT_TEMPLATES = {
  REACT: 'react',
  VUE: 'vue',
  ANGULAR: 'angular',
  VANILLA: 'vanilla',
  NEXT: 'nextjs',
  NUXT: 'nuxtjs',
} as const;