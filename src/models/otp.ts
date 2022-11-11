import { model, Schema } from "mongoose";
import { DbEnums } from "../enums";
import { OtpModel } from "../interfaces/otp";

const otpSchema = new Schema({
    userId: {
        type: String,
        trim: true,
        unique: true,
        required: true
    },
    otp: {
        type: Number,
        trim: true,
        required: true
    }
});


export default model<OtpModel>(DbEnums.MODEL.OTP, otpSchema);