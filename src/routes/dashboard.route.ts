import express from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';

const router = express.Router();

// All roles (Viewer, Analyst, Admin) can view the dashboard
router.use(protect);

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: "Get financial performance summary (Requires Role: Admin, Analyst, Viewer)"
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Financial summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalIncome:
 *                       type: number
 *                     totalExpenses:
 *                       type: number
 *                     netBalance:
 *                       type: number
 *                     transactionCount:
 *                       type: number
 *                     recentTransactions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Record'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get('/summary', 
restrictTo(UserRole.ADMIN, UserRole.ANALYST, UserRole.VIEWER), dashboardController.getDashboardSummary);

export default router;
