import { Request, Response, NextFunction } from 'express';

// Wraps async route handlers to automatically catch and forward errors to Express' error handling middleware
export const catchAsync = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
