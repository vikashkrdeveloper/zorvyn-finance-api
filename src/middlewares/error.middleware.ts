import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let details = err.details || null;

    if (err.name === 'CastError') {
        message = `Resource not found / Invalid ID`;
        statusCode = 404;
    }

    if (err.code === 11000) {
        message = 'Duplicate field value entered';
        statusCode = 400;
    }

    if (err.name === 'ValidationError') {
        message = Object.values(err.errors).map((val: any) => val.message).join(', ');
        statusCode = 400;
        details = err.errors;
    }

    if (err.name === 'JsonWebTokenError') {
        message = 'Invalid token. Please log in again';
        statusCode = 401;
    }

    if (err.name === 'TokenExpiredError') {
        message = 'Your token has expired! Please log in again';
        statusCode = 401;
    }

    const env = process.env.NODE_ENV || 'development';

    if (env === 'development') {
        console.error('Debug [Error]:', {
            statusCode,
            message,
            stack: err.stack,
            details: details || err
        });
    } else {
        console.error(`[Error] ${statusCode} - ${message}`);
    }

    const response: any = {
        success: false,
        message: message,
        toast: {
            type: 'error',
            message: message
        }
    };

    if (env === 'development') {
        response.error = message;
        response.stack = err.stack;
        response.details = details || err;
    } else if (env === 'test') {
        response.error = message;
    }

    res.status(statusCode).json(response);
};
