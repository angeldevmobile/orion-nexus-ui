import { Request, Response, NextFunction } from 'express';
import { PLAN_FEATURES, PlanFeature, HTTP_STATUS } from '../utils/constants';

/**
 * Middleware factory que verifica si el plan del usuario incluye una feature.
 * Uso: router.post('/endpoint', authenticateToken, checkPlan('teamManagement'), handler)
 */
export const checkPlan = (feature: PlanFeature) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const plan = req.user?.plan ?? 'free';
    const allowed = PLAN_FEATURES[plan][feature];

    if (!allowed) {
      const planRequired = Object.entries(PLAN_FEATURES).find(
        ([, features]) => features[feature] === true
      )?.[0] ?? 'pro';

      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: `Esta función requiere el plan ${planRequired} o superior.`,
        code: 'PLAN_UPGRADE_REQUIRED',
        requiredPlan: planRequired,
      });
      return;
    }

    next();
  };
};
