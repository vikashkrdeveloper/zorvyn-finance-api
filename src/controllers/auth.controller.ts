import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { sendResponse } from '../utils/responseWrapper';
import { User, UserRole } from '../models/user.model';
import { Session } from '../models/session.model';
import { BlacklistedToken } from '../models/blacklist.model';
import { generateTokens, verifyRefreshToken, verifyAccessToken } from '../utils/jwt';

// @route   POST /api/auth/register
export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new AppError('Email already in use', 400));
    }

    // Is it the first user? Let's make them Admin. (Requested by prompt)
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

// @route   POST /api/auth/login
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

    // 1. Create a new Session for this device
    const expiresInDays = parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '7d') || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (typeof expiresInDays === 'number' ? expiresInDays : 7));

    await Session.create({
        userId: user.id,
        refreshToken,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        expiresAt
    });

    // Hide password before sending
    user.password = undefined;

    sendResponse(res, 200, 'Login successful', {
        user,
        accessToken,
        refreshToken
    });
});

// @route   POST /api/auth/refresh
export const refresh = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return next(new AppError('Refresh token required', 400));
    }

    try {
        const decoded: any = verifyRefreshToken(refreshToken);
        
        // 1. Find the active session for this specific refresh token
        const session = await Session.findOne({ userId: decoded.id, refreshToken, isValid: true });
        
        if (!session) {
            return next(new AppError('Invalid or expired refresh token / session', 401));
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            return next(new AppError('User not found', 401));
        }

        const tokens = generateTokens(user.id, user.role);
        
        // 2. Refresh Token Rotation: Update the session with new token
        session.refreshToken = tokens.refreshToken;
        await session.save();

        sendResponse(res, 200, 'Token refreshed successfully', tokens);
    } catch (error) {
        return next(new AppError('Invalid refresh token', 401));
    }
});

// @route   POST /api/auth/logout
// @desc    Logout from current device only
export const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;
    const authHeader = req.headers.authorization;
    
    // 1. Invalidate current session
    if (refreshToken) {
        await Session.deleteOne({ refreshToken });
    }

    // 2. Blacklist current access token if present
    if (authHeader && authHeader.startsWith('Bearer')) {
        const accessToken = authHeader.split(' ')[1];
        try {
            const decoded: any = verifyAccessToken(accessToken);
            await BlacklistedToken.create({
                token: accessToken,
                expiresAt: new Date(decoded.exp * 1000)
            });
        } catch (err) {
            // Token might be malformed or already expired, ignore
        }
    }
    
    sendResponse(res, 200, 'Logged out successfully from this device');
});

// @route   POST /api/auth/logout-all
// @desc    Logout from ALL devices
export const logoutAll = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    const authHeader = req.headers.authorization;

    // 1. Delete all user sessions
    await Session.deleteMany({ userId });

    // 2. Blacklist current access token
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
