import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { sendResponse } from '../utils/responseWrapper';
import { User, UserRole } from '../models/user.model';
import { Session } from '../models/session.model';
import { BlacklistedToken } from '../models/blacklist.model';
import { generateTokens, verifyRefreshToken, verifyAccessToken } from '../utils/jwt';

export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new AppError('Email already in use', 400));
    }

    const isFirstUser = (await User.countDocuments()) === 0;
    const role = isFirstUser ? UserRole.ADMIN : UserRole.VIEWER;

    const user = await User.create({
        name,
        email,
        password,
        role
    });

    sendResponse(res, 201, 'User registered successfully. Please login.');
});

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    if (user.status !== 'ACTIVE') {
        return next(new AppError('Your account is deactivated. Please contact an Admin.', 403));
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    const decodedRefresh = verifyRefreshToken(refreshToken) as JwtPayload;
    const expiresAt = new Date(decodedRefresh.exp! * 1000);

    await Session.create({
        userId: user.id,
        refreshToken,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        expiresAt
    });

    user.password = undefined;

    sendResponse(res, 200, 'Login successful', {
        user,
        accessToken,
        refreshToken
    });
});

export const refresh = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return next(new AppError('Refresh token required', 400));
    }

    try {
        const decoded: any = verifyRefreshToken(refreshToken);
        
        const session = await Session.findOne({ userId: decoded.id, refreshToken, isValid: true });
        
        if (!session) {
            return next(new AppError('Invalid or expired refresh token / session', 401));
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            return next(new AppError('User not found', 401));
        }

        const tokens = generateTokens(user.id, user.role);
        
        session.refreshToken = tokens.refreshToken;
        await session.save();

        sendResponse(res, 200, 'Token refreshed successfully', tokens);
    } catch (error) {
        return next(new AppError('Invalid refresh token', 401));
    }
});

export const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;
    const authHeader = req.headers.authorization;
    
    if (refreshToken) {
        await Session.deleteOne({ refreshToken });
    }

    if (authHeader && authHeader.startsWith('Bearer')) {
        const accessToken = authHeader.split(' ')[1];
        try {
            const decoded: any = verifyAccessToken(accessToken);
            await BlacklistedToken.create({
                token: accessToken,
                expiresAt: new Date(decoded.exp * 1000)
            });
        } catch (err) {
            // Ignore malformed tokens
        }
    }
    
    sendResponse(res, 200, 'Logged out successfully from this device');
});

export const logoutAll = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    const authHeader = req.headers.authorization;

    await Session.deleteMany({ userId });

    if (authHeader && authHeader.startsWith('Bearer')) {
        const accessToken = authHeader.split(' ')[1];
        try {
            const decoded: any = verifyAccessToken(accessToken);
            await BlacklistedToken.create({
                token: accessToken,
                expiresAt: new Date(decoded.exp * 1000)
            });
        } catch (err) {
            // Ignore
        }
    }

    sendResponse(res, 200, 'Logged out successfully from all devices');
});
