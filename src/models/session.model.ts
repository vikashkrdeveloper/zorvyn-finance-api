import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
    userId: mongoose.Types.ObjectId;
    refreshToken: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
    isValid: boolean;
}

const sessionSchema = new Schema<ISession>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        refreshToken: {
            type: String,
            required: true,
            unique: true
        },
        userAgent: {
            type: String
        },
        ipAddress: {
            type: String
        },
        expiresAt: {
            type: Date,
            required: true
        },
        isValid: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

// TTL index to automatically remove expired sessions from DB after 7 days (or based on expiresAt)
// Note: expiresAt is the actual expiry date.
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = mongoose.model<ISession>('Session', sessionSchema);
