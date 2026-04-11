import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    // 1. Determine the status code and message
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let details = err.details || null;

    // Log the raw error for dev console
    if (process.env.NODE_ENV === 'development') {
        console.error('--- RAW ERROR ---');
        console.error(err);
    }

    // 2. Map specific storage/auth errors to AppError counterparts
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        message = `Resource not found / Invalid ID`;
        statusCode = 404;
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        message = 'Duplicate field value entered';
        statusCode = 400;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        message = Object.values(err.errors).map((val: any) => val.message).join(', ');
        statusCode = 400;
        details = err.errors;
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        message = 'Invalid token. Please log in again!';
        statusCode = 401;
    }
    if (err.name === 'TokenExpiredError') {
        message = 'Your token has expired! Please log in again.';
        statusCode = 401;
    }
    const env = process.env.NODE_ENV || 'development';

    // 1. Log errors based on environment
    if (env === 'development') {
        console.error('DEBUG [Error]:', {
            statusCode,
            message,
            stack: err.stack,
            details: details || err
        });
    } else if (env === 'production') {
        // In production, log minimal info to avoid bloating logs or leaking paths
        console.error(`[Error] ${statusCode} - ${message}`);
    }

    // 2. Prepare the Response Object
    // All environments get success and error message
    const response: any = {
        success: false,
        message: message, // Standard error message
        toast: {
            type: 'error',
            message: message // Separate attribute for easy frontend toast usage
        }
    };

    // 3. Add extra details based on environment
    if (env === 'development') {
        response.error = message; // Keeping 'error' for backward compatibility in dev tests
        response.stack = err.stack;
        response.details = details || err; // The "exact error" user requested
    } else if (env === 'test') {
        response.error = message;
        // No stack or details in test to keep CI output clean as requested
    }

    res.status(statusCode).json(response);
};
