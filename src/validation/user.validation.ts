import { z } from 'zod';
import { UserRole, UserStatus } from '../models/user.model';

export const createUserSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        role: z.nativeEnum(UserRole).optional(),
        status: z.nativeEnum(UserStatus).optional()
    })
});

export const updateUserSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID')
    }),
    body: z.object({
        name: z.string().min(2).optional(),
        email: z.string().email().optional(),
        role: z.nativeEnum(UserRole).optional(),
        status: z.nativeEnum(UserStatus).optional()
    })
});

export const deleteUserSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID')
    })
});

export const getUserSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID')
    })
});

export const listUsersSchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        search: z.string().optional(),
        role: z.nativeEnum(UserRole).optional(),
        status: z.nativeEnum(UserStatus).optional()
    })
});
