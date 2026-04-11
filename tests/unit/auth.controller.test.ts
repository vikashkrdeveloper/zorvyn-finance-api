import { User } from '../../src/models/user.model';
import { Session } from '../../src/models/session.model';
import { BlacklistedToken } from '../../src/models/blacklist.model';
import * as jwtUtils from '../../src/utils/jwt';
import { sendResponse } from '../../src/utils/responseWrapper';
import { Request, Response, NextFunction } from 'express';

// Mock everything before importing controllers
jest.mock('../../src/models/user.model', () => ({
    User: {
        findOne: jest.fn(),
        countDocuments: jest.fn(),
        create: jest.fn()
    }
}));
jest.mock('../../src/models/session.model', () => ({
    Session: {
        create: jest.fn(),
        deleteOne: jest.fn(),
        deleteMany: jest.fn(),
        findOne: jest.fn()
    }
}));
jest.mock('../../src/models/blacklist.model', () => ({
    BlacklistedToken: {
        create: jest.fn()
    }
}));
jest.mock('../../src/utils/jwt');
jest.mock('../../src/utils/responseWrapper');
jest.mock('../../src/utils/catchAsync', () => ({
    catchAsync: (fn: any) => fn
}));

// Now import the controllers
import { login, register, logout } from '../../src/controllers/auth.controller';

describe('Auth Controller Unit Tests', () => {
    let mockRequest: any;
    let mockResponse: any;
    let nextFunction: NextFunction = jest.fn();

    beforeEach(() => {
        mockRequest = {
            body: {},
            headers: {},
            ip: '127.0.0.1'
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('should return 401 if user not found', async () => {
            mockRequest.body = { email: 'test@test.com', password: 'password' };
            (User.findOne as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(null)
            });

            await login(mockRequest as Request, mockResponse as Response, nextFunction);

            expect(nextFunction).toHaveBeenCalledWith(expect.objectContaining({
                statusCode: 401,
                message: 'Incorrect email or password'
            }));
        });

        it('should return 200 and tokens on successful login', async () => {
            const mockUser = {
                id: 'user123',
                role: 'ADMIN',
                status: 'ACTIVE',
                comparePassword: jest.fn().mockResolvedValue(true),
                save: jest.fn().mockResolvedValue(true)
            };
            mockRequest.body = { email: 'test@test.com', password: 'password' };
            mockRequest.headers = { 'user-agent': 'test-agent' };
            
            (User.findOne as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser)
            });
            (jwtUtils.generateTokens as jest.Mock).mockReturnValue({
                accessToken: 'access-token',
                refreshToken: 'refresh-token'
            });
            (jwtUtils.verifyRefreshToken as jest.Mock).mockReturnValue({
                id: 'user123',
                exp: Math.floor(Date.now() / 1000) + 604800
            });
            (Session.create as jest.Mock).mockResolvedValue({});

            await login(mockRequest as Request, mockResponse as Response, nextFunction);

            expect(sendResponse).toHaveBeenCalledWith(
                mockResponse,
                200,
                'Login successful',
                expect.any(Object)
            );
        });
    });

    describe('logout', () => {
        it('should delete session and return 200', async () => {
            mockRequest.body = { refreshToken: 'some-token' };
            mockRequest.headers = { authorization: 'Bearer access-token' };
            
            (jwtUtils.verifyAccessToken as jest.Mock).mockReturnValue({ exp: 123456789 });
            (Session.deleteOne as jest.Mock).mockResolvedValue({});
            (BlacklistedToken.create as jest.Mock).mockResolvedValue({});

            await logout(mockRequest as Request, mockResponse as Response, nextFunction);

            expect(Session.deleteOne).toHaveBeenCalledWith({ refreshToken: 'some-token' });
            expect(sendResponse).toHaveBeenCalledWith(mockResponse, 200, expect.any(String));
        });
    });
});
