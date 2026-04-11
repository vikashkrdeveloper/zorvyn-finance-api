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

    const [totals, categoryTotals, recentActivity, monthlyTrends] = await Promise.all([
        FinancialRecord.aggregate([
            { $match: { isDeleted: false } },
            {
                $group: {
                    _id: '$type',
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]),

        FinancialRecord.aggregate([
            { $match: { isDeleted: false } },
            {
                $group: {
                    _id: { type: '$type', category: '$category' },
                    totalAmount: { $sum: '$amount' }
                }
            },
            { $sort: { totalAmount: -1 } }
        ]),

        FinancialRecord.find({ isDeleted: false })
            .select('amount type category date notes createdBy')
            .sort('-createdAt')
            .limit(5)
            .populate('createdBy', 'name email'),

        FinancialRecord.aggregate([
            {
                $match: {
                    isDeleted: false,
                    date: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$date' },
                        year: { $year: '$date' },
                        type: '$type'
                    },
                    total: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ])
    ]);

    let totalIncome = 0;
    let totalExpenses = 0;

    totals.forEach((t) => {
        if (t._id === RecordType.INCOME) totalIncome = t.totalAmount;
        if (t._id === RecordType.EXPENSE) totalExpenses = t.totalAmount;
    });

    const netBalance = totalIncome - totalExpenses;

    const formattedCategoryTotals = categoryTotals.map(c => ({
        type: c._id.type,
        category: c._id.category,
        amount: c.totalAmount
    }));

    const trends: any = {};
    monthlyTrends.forEach(item => {
        const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
        if (!trends[key]) trends[key] = { income: 0, expense: 0 };
        
        if (item._id.type === RecordType.INCOME) trends[key].income = item.total;
        if (item._id.type === RecordType.EXPENSE) trends[key].expense = item.total;
    });

    const formattedTrends = Object.keys(trends).map(key => ({
        month: key,
        income: trends[key].income,
        expense: trends[key].expense
    }));

    sendResponse(res, 200, 'Dashboard summary retrieved successfully', {
        overview: {
            totalIncome,
            totalExpenses,
            netBalance
        },
        categoryBreakdown: formattedCategoryTotals,
        recentActivity,
        trends: formattedTrends
    });
});
