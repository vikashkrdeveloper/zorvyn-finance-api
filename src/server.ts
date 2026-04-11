import dotenv from 'dotenv';
dotenv.config();

import { app } from './app';
import { connectDB } from './config/database';

process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

const startServer = async () => {
    await connectDB();

    const PORT = process.env.PORT || 8080;
    const server = app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });

    process.on('unhandledRejection', (err: Error) => {
        console.log('UNHANDLED REJECTION! Shutting down...');
        console.log(err.name, err.message);
        server.close(() => {
            process.exit(1);
        });
    });
};

startServer();
