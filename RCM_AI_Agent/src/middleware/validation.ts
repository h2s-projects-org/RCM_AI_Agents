import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';
import { logger } from '../logger/index.js';

export const validateRequest = (schema: ZodObject<any>) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        logger.warn('Validation error', { errors: formattedErrors, path: req.path });
        
        return res.status(400).json({
          status: 'Failed',
          error: 'Validation Error',
          details: formattedErrors
        });
      }
      return next(error);
    }
  };