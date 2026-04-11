import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, UserRole, UserStatus } from '../models/user.model';
import { FinancialRecord, RecordType } from '../models/record.model';

dotenv.config();

const users = [
    {
        name: 'Admin User',
        email: 'admin@zorvyn.com',
        password: 'password123',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE
    },
    {
        name: 'Analyst User',
        email: 'analyst@zorvyn.com',
        password: 'password123',
        role: UserRole.ANALYST,
        status: UserStatus.ACTIVE
    },
    {
        name: 'Viewer User',
        email: 'viewer@zorvyn.com',
        password: 'password123',
        role: UserRole.VIEWER,
        status: UserStatus.ACTIVE
    }
];

const categories = ['Salary', 'Food', 'Rent', 'Travel', 'Shopping', 'Investment', 'Entertainment'];

const generateRecords = (userId: mongoose.Types.ObjectId) => {
    const records = [];
    const now = new Date();
    
    // Generate records for the last 6 months
    for (let i = 0; i < 50; i++) {
        const type = Math.random() > 0.4 ? RecordType.EXPENSE : RecordType.INCOME;
        const amount = type === RecordType.INCOME ? Math.floor(Math.random() * 5000) + 2000 : Math.floor(Math.random() * 1000) + 50;
        const date = new Date(now.getTime() - Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000);
        
        records.push({
            amount,
            type,
            category: categories[Math.floor(Math.random() * categories.length)],
            date,
            notes: `Auto-generated ${type.toLowerCase()} record`,
            createdBy: userId,
            isDeleted: false
        });
    }
    return records;
};

const seedDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/zorvyn-finance';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB for seeding');

        await User.deleteMany({});
        await FinancialRecord.deleteMany({});
        console.log('Cleared existing data');

        const createdUsers = await User.create(users);
        console.log(`Created ${createdUsers.length} users`);

        const adminRecords = generateRecords(createdUsers[0]._id as mongoose.Types.ObjectId);
        await FinancialRecord.create(adminRecords);
        console.log(`Created ${adminRecords.length} records for Admin`);

        console.log('Seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();
