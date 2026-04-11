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
import { corsOrigin } from './utils/jwt';

export const app = express();

app.use(helmet());

app.use(cors({ 
    origin: corsOrigin(),
    credentials: true
}));

const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.get('/health', (req: Request, res: Response) => {
    sendResponse(res, 200, 'Server is healthy');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);

setupSwagger(app);

app.all(/(.*)/, (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(errorHandler);
