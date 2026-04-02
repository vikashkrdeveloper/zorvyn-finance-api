import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middlewares/error.middleware';
import { AppError } from './utils/AppError';

import authRoutes from './routes/auth.route';
import userRoutes from './routes/user.route';
import recordRoutes from './routes/record.route';
import dashboardRoutes from './routes/dashboard.route';
import { setupSwagger } from './utils/swagger';
import { sendResponse } from './utils/responseWrapper';

export const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Built-in body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Health check
app.get('/health', (req: Request, res: Response) => {
    sendResponse(res, 200, 'Server is healthy!');
});

// Primary Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Swagger Documentation
setupSwagger(app);

// Catch undefined routes
app.all(/(.*)/, (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(errorHandler);
