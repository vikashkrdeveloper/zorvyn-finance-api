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
 *     summary: "List all financial records (Requires Role: Admin, Analyst)"
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in notes or category (Partial match)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *         description: Filter by record type
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by exact category name
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter records from this date (ISO string)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter records up to this date (ISO string)
 *     responses:
 *       200:
 *         description: Results retrieved successfully
 *   post:
 *     summary: "Create a financial record (Requires Role: Admin)"
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - type
 *               - category
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 2500.50
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               category:
 *                 type: string
 *                 example: Consulting
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Optional. Defaults to now.
 *               notes:
 *                 type: string
 *                 example: Monthly retainer fee
 *     responses:
 *       201:
 *         description: Record created successfully
 *       400:
 *         description: Invalid input data
 * 
 * /api/records/{id}:
 *   get:
 *     summary: "Get a standard record by ID (Requires Role: Admin, Analyst)"
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Record ID
 *     responses:
 *       200:
 *         description: Record details retrieved
 *       404:
 *         description: Record not found
 *   put:
 *     summary: "Update a record (Requires Role: Admin)"
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Record updated successfully
 *   delete:
 *     summary: "Soft delete a record (Requires Role: Admin)"
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Record soft-deleted successfully
 */
router
    .route('/')
    .get(
        restrictTo(UserRole.ADMIN, UserRole.ANALYST),
        validate(listRecordsSchema),
        recordController.getRecords
    )
    .post(
        restrictTo(UserRole.ADMIN),
        validate(createRecordSchema),
        recordController.createRecord
    );

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
