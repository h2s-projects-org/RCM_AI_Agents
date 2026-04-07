import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger/index.js';

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled request error', err, { 
    path: req.path, 
    method: req.method,
    body: req.body 
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    status: 'Error',
    message: process.env.NODE_ENV === 'production' && statusCode === 500 
      ? 'An unexpected error occurred' 
      : message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};