import { Document } from "mongoose";

export interface CustomSession extends Session {
    isLogin?: boolean;
    empId?: string;
    sessionAuth?: string;
};

export interface ILogin extends Document {
    empId: string;
    password: string;
};

export interface IGuest extends Document {
    guestName: string;
    guestEmail: string;
};

export interface IOTP extends Document {
    otp: string;
    email: string;
    createdAt: Date;
};