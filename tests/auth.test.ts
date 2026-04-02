import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/app';
import { User } from '../src/models/user.model';
import dotenv from 'dotenv';
dotenv.config();

const dbURI = process.env.MONGO_URI || 'mongodb://localhost:27017/zorvyn-test';

describe('Auth API', () => {
    beforeAll(async () => {
        await mongoose.connect(dbURI);
    });

    afterAll(async () => {
        await User.deleteMany({});
        await mongoose.connection.close();
    });

    it('should register a new user successfully', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
    });

    it('should not register user with existing email', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User 2',
                email: 'test@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.success).toBe(false);
    });

    it('should login user and return tokens', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.accessToken).toBeDefined();
        expect(res.body.data.refreshToken).toBeDefined();
    });
});
