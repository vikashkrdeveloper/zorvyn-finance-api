import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';

export const validate = (schema: any) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params
            });
            next();
        } catch (error: any) {
            if (error.name === 'ZodError' || error instanceof ZodError) {
                // Zod 3+ uses .issues, sometimes .errors is an alias
                const issues = error.issues || error.errors || [];
                const formattedErrors = issues.map((e: any) => ({
                    field: e.path?.join('.'),
                    message: e.message
                }));
                const message = formattedErrors?.map((e: any) => `${e.field}: ${e.message}`).join(', ') || 'Validation Error';
                return next(new AppError(message, 400, formattedErrors));
            }
            next(error);
        }
    };
};
