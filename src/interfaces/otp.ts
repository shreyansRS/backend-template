import { Document } from "mongoose";

export interface Otp {
    userId: string;
    otp: number;
}

export interface OtpModel extends Document, Otp {
    dateTime: Date
}