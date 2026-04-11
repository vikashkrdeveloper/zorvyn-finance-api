import { FinancialRecord } from '../../src/models/record.model';
import { sendResponse } from '../../src/utils/responseWrapper';
import { Request, Response, NextFunction } from 'express';

// Mock everything before importing controllers
jest.mock('../../src/models/record.model', () => ({
    RecordType: { INCOME: 'INCOME', EXPENSE: 'EXPENSE' },
    FinancialRecord: {
        aggregate: jest.fn(),
        find: jest.fn()
    }
}));
jest.mock('../../src/utils/responseWrapper');
jest.mock('../../src/utils/catchAsync', () => ({
    catchAsync: (fn: any) => fn
}));

// Now import the controllers
import { getDashboardSummary } from '../../src/controllers/dashboard.controller';

describe('Dashboard Controller Unit Tests', () => {
    let mockRequest: any;
    let mockResponse: any;
    let nextFunction: NextFunction = jest.fn();

    beforeEach(() => {
        mockRequest = {
            query: {},
            user: { id: 'user123' }
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('getDashboardSummary', () => {
        it('should return 200 and formatted aggregation results', async () => {
            const mockTotals = [
                { _id: 'INCOME', totalAmount: 500 },
                { _id: 'EXPENSE', totalAmount: 200 }
            ];
            const mockCategoryTotals = [
                { _id: { type: 'INCOME', category: 'Salary' }, totalAmount: 500 }
            ];
            const mockRecentActivity = [{ amount: 100, category: 'Salary' }];

            (FinancialRecord.aggregate as jest.Mock)
                .mockResolvedValueOnce(mockTotals)
                .mockResolvedValueOnce(mockCategoryTotals);
            
            (FinancialRecord.find as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(mockRecentActivity)
            });

            await getDashboardSummary(mockRequest as Request, mockResponse as Response, nextFunction);

            expect(sendResponse).toHaveBeenCalledWith(
                mockResponse,
                200,
                expect.any(String),
                expect.objectContaining({
                    overview: expect.objectContaining({
                        totalIncome: 500,
                        totalExpenses: 200,
                        netBalance: 300
                    })
                })
            );
        });
    });
});
