/**
 * Debug script for verifying auth registration flow.
 *
 * Safety guards:
 *   - Must be run with NODE_ENV=test to prevent accidental use against production data.
 *   - Must pass --force flag to allow the database drop at the end.
 *
 * Usage:
 *   NODE_ENV=test node scripts/debug_auth.js --force
 */

if (process.env.NODE_ENV !== 'test') {
    console.error('ERROR: This script must be run with NODE_ENV=test');
    process.exit(1);
}

const hasForce = process.argv.includes('--force');
if (!hasForce) {
    console.error('ERROR: Pass --force to confirm you intend to drop the test database');
    process.exit(1);
}

const request = require('supertest');
const { app } = require('../src/app');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function runDebug() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/zorvyn-test');
        console.log('Connected to DB');

        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Debug User',
                email: 'debug@example.com',
                password: 'password123'
            });

        console.log('Status Code:', res.statusCode);
        console.log('Response Body:', JSON.stringify(res.body, null, 2));

        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    } catch (err) {
        console.error('Debug script error:', err);
    }
}

runDebug();
