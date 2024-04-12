import { Schema, model } from 'mongoose';
import { IOTP } from '../types';

const otpSchema = new Schema<IOTP>({
    otp: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    createdAt: { 
        type: Date,
        default: Date.now,
        expires: 600
    }
});

otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 0 });

export default model('otp', otpSchema);