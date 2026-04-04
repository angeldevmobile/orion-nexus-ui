import { Request, Response, NextFunction } from 'express';
import { consumeCredits } from '../services/creditService';
import { CreditOperation, HTTP_STATUS } from '../utils/constants';

/**
 * Middleware factory que verifica y consume créditos antes de ejecutar una operación de IA.
 * Uso: router.post('/endpoint', authenticateToken, checkCredits('generateCode'), handler)
 */
export const checkCredits = (operation: CreditOperation) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // En desarrollo sin usuario autenticado, pasar sin verificar
    if (!req.user?.id) {
      next();
      return;
    }

    try {
      const allowed = await consumeCredits(req.user.id, operation);

      if (!allowed) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'No tienes suficientes créditos para realizar esta operación.',
          code: 'INSUFFICIENT_CREDITS',
        });
        return;
      }

      next();
    } catch (error) {
      console.error('[checkCredits] Error:', error);
      // Si falla el sistema de créditos, no bloqueamos al usuario (fail-open)
      next();
    }
  };
};
