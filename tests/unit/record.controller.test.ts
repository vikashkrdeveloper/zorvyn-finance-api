import { FinancialRecord } from '../../src/models/record.model';
import { sendResponse } from '../../src/utils/responseWrapper';
import { Request, Response, NextFunction } from 'express';

// Mock everything before importing controllers
jest.mock('../../src/models/record.model');
jest.mock('../../src/utils/responseWrapper');
jest.mock('../../src/utils/catchAsync', () => ({
    catchAsync: (fn: any) => fn
}));

// Now import the controllers
import { getRecords, createRecord } from '../../src/controllers/record.controller';

describe('Record Controller Unit Tests', () => {
    let mockRequest: any;
    let mockResponse: any;
    let nextFunction: NextFunction = jest.fn();

    beforeEach(() => {
        mockRequest = {
            query: {},
            body: {},
            user: { id: 'user123' }
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('getRecords', () => {
        it('should return 200 and list of records with pagination', async () => {
            const mockRecords = [{ amount: 100, type: 'INCOME', category: 'Salary' }];
            (FinancialRecord.find as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(mockRecords)
            });
            (FinancialRecord.countDocuments as jest.Mock).mockResolvedValue(1);

            await getRecords(mockRequest as Request, mockResponse as Response, nextFunction);

            expect(sendResponse).toHaveBeenCalledWith(
                mockResponse,
                200,
                'Records retrieved successfully',
                mockRecords,
                expect.any(Object)
            );
        });
    });

    describe('createRecord', () => {
        it('should create a record and return 201', async () => {
            const recordData = { amount: 50, type: 'EXPENSE', category: 'Food' };
            mockRequest.body = recordData;
            (FinancialRecord.create as jest.Mock).mockResolvedValue(recordData);

            await createRecord(mockRequest as Request, mockResponse as Response, nextFunction);

            expect(FinancialRecord.create).toHaveBeenCalledWith(expect.objectContaining({
                amount: 50,
                type: 'EXPENSE'
            }));
            expect(sendResponse).toHaveBeenCalledWith(mockResponse, 201, expect.any(String), recordData);
        });
    });
});
