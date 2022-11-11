import { Request, Response, Router } from "express";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import passport from "passport";
import { KeyConfigs, UrlConfigs } from "../configs";
import { ApplicationEnums } from "../enums";
import { OtpModel, UserModel } from "../models";
import { LoggerUtils, MailUtils } from "../utils";

const authenticationController = Router();

authenticationController.post(
    UrlConfigs.API.LOGIN,
    (request, response) => {
        passport.authenticate(`local`, { session: false }, (error, user) => {
            if (error) {
                LoggerUtils.error(`Unable to authenticate!`, error);
                return response.status(ApplicationEnums.STATUS_CODE.INTERNAL_SERVER_ERROR).end(error.message);
            }
            if (!user) {
                LoggerUtils.info(`Unable to find user!`);
                return response.status(ApplicationEnums.STATUS_CODE.BAD_REQUEST).end();
            }
            request.login(user, { session: false }, (error) => {
                if (error) {
                    LoggerUtils.error(`Unable to sign in!`, error);
                    return response.status(ApplicationEnums.STATUS_CODE.INTERNAL_SERVER_ERROR).end(error.message);
                }

                const tokenPayload: any = {
                    _id: user.id,
                    name: `${user.firstName} ${user.lastName} `,
                    emailAddress: user.emailAddress,
                    contactNumber: user.contactNumber
                };

                const token = jwt.sign(tokenPayload, KeyConfigs.PASSPORT_SECRET);

                return response.json({ ...tokenPayload, token: token });
            })
        })(request, response);
    }
);

authenticationController.post(
    UrlConfigs.API.GENERATE_OTP,
    [body("emailAddress").exists().trim()],
    (request: Request, response: Response) => {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(ApplicationEnums.STATUS_CODE.BAD_REQUEST).end();
        }

        UserModel.findOne({ emailAddress: request.body.emailAddress }).then((user) => {
            if (user) {
                const otp = Math.floor(Math.random() * 90000) + 10000;
                const emailAddress = user.emailAddress;
                const name = user.name;

                OtpModel.findOneAndUpdate({ userId: user._id }, { userId: user._id, otp: otp }, { new: true, useFindAndModify: false, upsert: true }).then(() => {
                    MailUtils.sendMail({
                        to: emailAddress,
                        subject: `Password reset`,
                        text: `Hi ${name}, use ${otp} as one time password for resetting your password.`,
                    }).then(() => {
                        return response.end();
                    }).catch((error) => {
                        LoggerUtils.error(`Unable to send otp!`, error);
                        return response.status(ApplicationEnums.STATUS_CODE.INTERNAL_SERVER_ERROR).end(error.message);
                    });
                }).catch((error) => {
                    LoggerUtils.error(`Unable to create or update otp!`, error);
                    return response.status(ApplicationEnums.STATUS_CODE.INTERNAL_SERVER_ERROR).end(error.message);
                });
            }
            else {
                return response.status(ApplicationEnums.STATUS_CODE.BAD_REQUEST).end();
            }
        }).catch((error) => {
            LoggerUtils.error(`Unable to find user!`, error);
            return response.status(ApplicationEnums.STATUS_CODE.INTERNAL_SERVER_ERROR).end(error.message);
        });
    }
);

export default authenticationController;