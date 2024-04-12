import { Schema, model } from 'mongoose';
import { ILogin } from '../types';

const loginSchema = new Schema<ILogin>({
    empId: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

export default model('login', loginSchema);