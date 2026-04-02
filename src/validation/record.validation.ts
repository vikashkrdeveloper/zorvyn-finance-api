import { z } from 'zod';
import { RecordType } from '../models/record.model';

export const createRecordSchema = z.object({
    body: z.object({
        amount: z.number().positive('Amount must be positive'),
        type: z.nativeEnum(RecordType),
        category: z.string().min(1, 'Category is required'),
        date: z.string().datetime().optional(), // ISODate string
        notes: z.string().optional()
    })
});

export const updateRecordSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID')
    }),
    body: z.object({
        amount: z.number().positive().optional(),
        type: z.nativeEnum(RecordType).optional(),
        category: z.string().min(1).optional(),
        date: z.string().datetime().optional(),
        notes: z.string().optional()
    })
});

export const deleteRecordSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID')
    })
});

export const getRecordSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID')
    })
});

export const listRecordsSchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        search: z.string().optional(),
        type: z.nativeEnum(RecordType).optional(),
        category: z.string().optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional()
    })
});
