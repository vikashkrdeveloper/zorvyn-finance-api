import { User } from '../../src/models/user.model';
import { sendResponse } from '../../src/utils/responseWrapper';
import { Request, Response, NextFunction } from 'express';

// Mock everything before importing controllers
jest.mock('../../src/models/user.model', () => ({
    User: {
        find: jest.fn(),
        countDocuments: jest.fn(),
        findByIdAndUpdate: jest.fn()
    }
}));
jest.mock('../../src/utils/responseWrapper');
jest.mock('../../src/utils/catchAsync', () => ({
    catchAsync: (fn: any) => fn
}));

// Now import the controllers
import { getUsers, getUser, deleteUser } from '../../src/controllers/user.controller';

describe('User Controller Unit Tests', () => {
    let mockRequest: any;
    let mockResponse: any;
    let nextFunction: NextFunction = jest.fn();

    beforeEach(() => {
        mockRequest = {
            query: {},
            params: {},
            user: { id: 'admin123' }
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('getUsers', () => {
        it('should return 200 and list of users', async () => {
            const mockUsers = [{ name: 'Test User', email: 'test@test.com' }];
            (User.find as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue(mockUsers)
            });
            (User.countDocuments as jest.Mock).mockResolvedValue(1);

            await getUsers(mockRequest as Request, mockResponse as Response, nextFunction);

            expect(sendResponse).toHaveBeenCalledWith(
                mockResponse,
                200,
                expect.any(String),
                mockUsers,
                expect.any(Object)
            );
        });
    });

    describe('deleteUser', () => {
        it('should soft delete user and return 200', async () => {
            mockRequest.params.id = 'user123';
            (User.findByIdAndUpdate as jest.Mock).mockResolvedValue({ id: 'user123', isDeleted: true });

            await deleteUser(mockRequest as Request, mockResponse as Response, nextFunction);

            expect(User.findByIdAndUpdate).toHaveBeenCalledWith('user123', { isDeleted: true }, { new: true });
            expect(sendResponse).toHaveBeenCalledWith(mockResponse, 200, 'User successfully deleted (soft delete)');
        });
    });
});
