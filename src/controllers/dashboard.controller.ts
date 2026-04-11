import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/responseWrapper';
import { FinancialRecord, RecordType } from '../models/record.model';

export const getDashboardSummary = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // We want to calculate:
    // 1. Total Income
    // 2. Total Expenses
    // 3. Net Balance
    // 4. Category-wise totals
    // 5. Recent Activity (last 5 records)

    // Parallel execution for better performance
    const [totals, categoryTotals, recentActivity] = await Promise.all([
        // 1. Calculate general totals (Income vs Expenses)
        FinancialRecord.aggregate([
            { $match: { isDeleted: false } },
            {
                $group: {
                    _id: '$type',
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]),

        // 2. Calculate category-wise totals
        FinancialRecord.aggregate([
            { $match: { isDeleted: false } },
            {
                $group: {
                    _id: { type: '$type', category: '$category' },
                    totalAmount: { $sum: '$amount' }
                }
            },
            { $sort: { totalAmount: -1 } } // Highest spending/earning categories first
        ]),

        // 3. Get recent activity
        FinancialRecord.find({ isDeleted: false })
            .select('amount type category date notes createdBy')
            .sort('-createdAt')
            .limit(5)
            .populate('createdBy', 'name email')
    ]);

    // Format Totals and Net Balance
    let totalIncome = 0;
    let totalExpenses = 0;

    totals.forEach((t) => {
        if (t._id === RecordType.INCOME) totalIncome = t.totalAmount;
        if (t._id === RecordType.EXPENSE) totalExpenses = t.totalAmount;
    });

    const netBalance = totalIncome - totalExpenses;

    // Format Category Totals
    const formattedCategoryTotals = categoryTotals.map(c => ({
        type: c._id.type,
        category: c._id.category,
        amount: c.totalAmount
    }));

    sendResponse(res, 200, 'Dashboard summary retrieved successfully', {
        overview: {
            totalIncome,
            totalExpenses,
            netBalance
        },
        categoryBreakdown: formattedCategoryTotals,
        recentActivity
    });
});
