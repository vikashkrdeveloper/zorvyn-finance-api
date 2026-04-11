import mongoose, { Document, Schema } from 'mongoose';

export enum RecordType {
    INCOME = 'INCOME',
    EXPENSE = 'EXPENSE'
}

export interface IFinancialRecord extends Document {
    amount: number;
    type: RecordType;
    category: string;
    date: Date;
    notes?: string;
    createdBy: mongoose.Types.ObjectId;
    isDeleted: boolean;
}

const recordSchema = new Schema<IFinancialRecord>(
    {
        amount: {
            type: Number,
            required: [true, 'Please provide an amount']
        },
        type: {
            type: String,
            enum: Object.values(RecordType),
            required: [true, 'Please declare if INCOME or EXPENSE']
        },
        category: {
            type: String,
            required: [true, 'Please provide a category']
        },
        date: {
            type: Date,
            required: [true, 'Please provide a date'],
            default: Date.now
        },
        notes: {
            type: String
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Record must belong to a user']
        },
        isDeleted: {
            type: Boolean,
            default: false,
            select: false // hides it from client side
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Optional: Filter out deleted records universally
recordSchema.pre(/^find/, function (this: any) {
    this.find({ isDeleted: { $ne: true } });
});

export const FinancialRecord = mongoose.model<IFinancialRecord>('FinancialRecord', recordSchema);
