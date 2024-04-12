import { Schema, model } from 'mongoose';
import { IGuest } from '../types';

const guestSchema = new Schema<IGuest>({
    guestName: {
        type: String
    },
    guestEmail: {
        type: String,
        required: true
    }
});

export default model('guest', guestSchema);