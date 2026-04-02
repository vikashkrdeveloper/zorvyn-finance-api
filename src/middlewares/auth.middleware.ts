import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { verifyAccessToken } from '../utils/jwt';
import { User } from '../models/user.model';
import { BlacklistedToken } from '../models/blacklist.model';

export interface AuthRequest extends Request {
    user?: any;
}

export const protect = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    // Verification token
    const decoded: any = verifyAccessToken(token);

    // Check if token is blacklisted
    const isBlacklisted = await BlacklistedToken.findOne({ token });
    if (isBlacklisted) {
        return next(new AppError('Token has been revoked. Please log in again.', 401));
    }

    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('The user belonging to this token does no longer exist.', 401));
    }

    // Check if user is active
    if (currentUser.status !== 'ACTIVE') {
        return next(new AppError('Your account has been deactivated.', 403));
    }

    // Grant Access to protected route
    req.user = currentUser;
    next();
});

// Role Based Access Control Guard
export const restrictTo = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};
