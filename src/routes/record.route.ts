import express from 'express';
import * as recordController from '../controllers/record.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';
import { validate } from '../middlewares/validate.middleware';
import {
    createRecordSchema,
    updateRecordSchema,
    deleteRecordSchema,
    getRecordSchema,
    listRecordsSchema
} from '../validation/record.validation';

const router = express.Router();

// Require login for all methods
router.use(protect);

/**
 * @swagger
 * /api/records:
 *   get:
 *     summary: List all financial records (Admin/Analyst)
 *     tags: [Records]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of records
 */
router
    .route('/')
    .get(
        restrictTo(UserRole.ADMIN, UserRole.ANALYST),
        validate(listRecordsSchema),
        recordController.getRecords
    );

/**
 * @swagger
 * /api/records:
 *   post:
 *     summary: Create a financial record (Admin)
 *     tags: [Records]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type, category]
 *             properties:
 *               amount: { type: number }
 *               type: { type: string, enum: [INCOME, EXPENSE] }
 *               category: { type: string }
 *     responses:
 *       201:
 *         description: Record created
 */
router
    .route('/')
    .post(
        restrictTo(UserRole.ADMIN),
        validate(createRecordSchema),
        recordController.createRecord
    );

/**
 * @swagger
 * /api/records/{id}:
 *   get:
 *     summary: Get a standard record by ID
 *     tags: [Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Record data
 *   put:
 *     summary: Update a record (Admin)
 *     tags: [Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Record updated
 *   delete:
 *     summary: Soft delete a record (Admin)
 *     tags: [Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Record deleted
 */
router
    .route('/:id')
    .get(
        restrictTo(UserRole.ADMIN, UserRole.ANALYST),
        validate(getRecordSchema),
        recordController.getRecord
    )
    .put(
        restrictTo(UserRole.ADMIN),
        validate(updateRecordSchema),
        recordController.updateRecord
    )
    .delete(
        restrictTo(UserRole.ADMIN),
        validate(deleteRecordSchema),
        recordController.deleteRecord
    );

export default router;
