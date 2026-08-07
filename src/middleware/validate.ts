import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import logger from '../utils/logger';

export const configUpdateSchema = z.object({
  amount: z.number().positive().optional(),
  tokenOut: z.string().min(1).optional(),
  frequency: z.enum(['hourly', 'daily', 'weekly']).optional(),
  slippageBps: z.number().min(1).max(1000).optional(),
  maxGasGwei: z.number().positive().optional(),
  paused: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const validateConfigUpdate = (req: Request, res: Response, next: NextFunction) => {
  try {
    req.body = configUpdateSchema.parse(req.body);
    next();
  } catch (error: any) {
    logger.warn('Validation error', { error: error.errors });
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.errors,
    });
  }
};
