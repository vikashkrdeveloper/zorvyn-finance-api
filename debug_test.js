const request = require('supertest');
const { app } = require('./src/app');
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
