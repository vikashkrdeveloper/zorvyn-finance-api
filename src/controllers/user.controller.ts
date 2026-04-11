import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { sendResponse } from '../utils/responseWrapper';
import { User } from '../models/user.model';

// @route   GET /api/users
export const getUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (req.query.search) {
        query.$or = [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } }
        ];
    }

    if (req.query.role) query.role = req.query.role;
    if (req.query.status) query.status = req.query.status;

    const users = await User.find(query)
        .select('name email role status createdAt')
        .skip(skip)
        .limit(limit)
        .sort('-createdAt');

    const total = await User.countDocuments(query);

    sendResponse(res, 200, 'Users retrieved successfully', users, {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
    });
});

export const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, role, status } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new AppError('Email already in use', 400));
    }

    const user = await User.create({
        name,
        email,
        password,
        role,
        status
    });

    user.password = undefined;

    sendResponse(res, 201, 'User created successfully', user);
});

export const getUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.params.id)
        .select('name email role status createdAt');

    if (!user) {
        return next(new AppError('No user found with that ID', 404));
    }

    sendResponse(res, 200, 'User retrieved successfully', user);
});

export const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, role, status } = req.body;

    if (email) {
        const existingUser = await User.findOne({ email, _id: { $ne: req.params.id as any } });
        if (existingUser) {
            return next(new AppError('Email already in use by another user', 400));
        }
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { name, email, role, status },
        { new: true, runValidators: true }
    );

    if (!user) {
        return next(new AppError('No user found with that ID', 404));
    }

    sendResponse(res, 200, 'User updated successfully', user);
});

export const deleteUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });

    if (!user) {
        return next(new AppError('No user found with that ID', 404));
    }

    sendResponse(res, 200, 'User successfully deleted');
});
