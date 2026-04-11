import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { sendResponse } from '../utils/responseWrapper';
import { FinancialRecord } from '../models/record.model';

// Helper interface for authenticated req
interface AuthRequest extends Request {
    user?: any;
}

// @route   GET /api/records
export const getRecords = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query: any = {};

    // For Analysts and Viewers, maybe they can see all records, but Admin sees everything? 
    // The requirement says:
    // "An analyst may be allowed to read records and access summaries"
    // "An admin may be allowed full management access"
    // So all these roles can read. We'll control access via routes.

    // Search by category or notes
    if (req.query.search) {
        query.$or = [
            { category: { $regex: req.query.search, $options: 'i' } },
            { notes: { $regex: req.query.search, $options: 'i' } }
        ];
    }

    // Filter by explicitly defined fields
    if (req.query.type) query.type = req.query.type;
    if (req.query.category) query.category = req.query.category;
    
    // Date Range
    if (req.query.startDate && req.query.endDate) {
        query.date = {
            $gte: new Date(req.query.startDate as string),
            $lte: new Date(req.query.endDate as string)
        };
    } else if (req.query.startDate) {
        query.date = { $gte: new Date(req.query.startDate as string) };
    } else if (req.query.endDate) {
        query.date = { $lte: new Date(req.query.endDate as string) };
    }

    const records = await FinancialRecord.find(query)
        .select('amount type category date notes createdBy')
        .skip(skip)
        .limit(limit)
        .sort('-date')
        .populate('createdBy', 'name email');

    const total = await FinancialRecord.countDocuments(query);

    sendResponse(res, 200, 'Records retrieved successfully', records, {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
    });
});

// @route   POST /api/records
export const createRecord = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { amount, type, category, date, notes } = req.body;

    const newRecord = await FinancialRecord.create({
        amount,
        type,
        category,
        date: date || new Date(),
        notes,
        createdBy: req.user.id
    });

    sendResponse(res, 201, 'Financial record created successfully', newRecord);
});

// @route   GET /api/records/:id
export const getRecord = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const record = await FinancialRecord.findById(req.params.id)
        .select('amount type category date notes createdBy')
        .populate('createdBy', 'name email');

    if (!record) {
        return next(new AppError('No record found with that ID', 404));
    }

    sendResponse(res, 200, 'Record retrieved successfully', record);
});

// @route   PUT /api/records/:id
export const updateRecord = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { amount, type, category, date, notes } = req.body;

    const record = await FinancialRecord.findByIdAndUpdate(
        req.params.id,
        { amount, type, category, date, notes },
        { new: true, runValidators: true }
    );

    if (!record) {
        return next(new AppError('No record found with that ID', 404));
    }

    sendResponse(res, 200, 'Record updated successfully', record);
});

// @route   DELETE /api/records/:id
// Soft delete implemented
export const deleteRecord = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const record = await FinancialRecord.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });

    if (!record) {
        return next(new AppError('No record found with that ID', 404));
    }

    sendResponse(res, 200, 'Record successfully deleted');
});
