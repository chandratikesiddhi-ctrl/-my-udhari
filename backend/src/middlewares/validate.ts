import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export type ValidatorFn = (req: Request) => Array<{ field?: string; message: string }> | null;

export function validate(validator: ValidatorFn) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const errors = validator(req);
    if (errors && errors.length > 0) {
      return next(AppError.validation('Validation failed', errors));
    }
    next();
  };
}
