import { model, PassportLocalSchema, Schema } from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";
import { DbEnums, UserEnums } from "../enums";
import { UserModel } from "../interfaces/user";

const userSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    emailAddress: {
        type: String,
        trim: true,
        unique: true,
        required: true,
        match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
    },
    contactNumber: {
        type: String,
        trim: true,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: UserEnums.ROLE
    },
    dateTime: {
        type: Date,
        default: new Date(),
        required: true
    }
});

userSchema.plugin(passportLocalMongoose, {
    usernameField: "emailAddress"
});

export default model<UserModel>(DbEnums.MODEL.USER, userSchema as PassportLocalSchema);