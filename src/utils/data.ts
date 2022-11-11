import { LoggerUtils } from ".";
import { ApplicationConfig } from "../configs";
import { UserEnums } from "../enums";
import { UserModel } from "../models";

export const createSuperAdminUser = () => {
    UserModel.findOne({ emailAddress: ApplicationConfig.SUPER_ADMIN.emailAddress }).then(user => {
        if (!user) {
            UserModel.register(
                new UserModel({
                    name: ApplicationConfig.SUPER_ADMIN.name,
                    emailAddress: ApplicationConfig.SUPER_ADMIN.emailAddress,
                    contactNumber: ApplicationConfig.SUPER_ADMIN.contactNumber,
                    role: UserEnums.ROLE.SUPER_ADMIN
                }),
                ApplicationConfig.SUPER_ADMIN.password,
                (error, account) => {
                    if (error) {
                        LoggerUtils.error(`Unable to register super admin user!`, error);
                    } else {
                        LoggerUtils.info(`Registered super admin user!`, account);
                    }

                }
            );
        }
        else {
            LoggerUtils.warn(`Super admin user already exist!`, user.toJSON());
        }
    }).catch((error) => {
        LoggerUtils.error(`Unable to find user!`, error);
    });
}

