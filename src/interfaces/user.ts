import { Document, PassportLocalDocument } from "mongoose";
import { UserEnums } from "../enums";

interface User {
    name: string;
    role: UserEnums.ROLE,
    emailAddress: string;
    contactNumber: string;
}

export interface UserModel extends Document, PassportLocalDocument, User {
    dateTime: Date
}