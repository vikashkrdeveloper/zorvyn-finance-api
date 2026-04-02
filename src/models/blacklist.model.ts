import mongoose, { Document, Schema } from 'mongoose';

export interface IBlacklistedToken extends Document {
    token: string;
    expiresAt: Date;
}

const blacklistSchema = new Schema<IBlacklistedToken>({
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    }
}, {
    timestamps: true
});

// Automatically delete blacklisted tokens after they expire naturally
blacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const BlacklistedToken = mongoose.model<IBlacklistedToken>('BlacklistedToken', blacklistSchema);
