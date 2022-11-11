import { Request, Response, Router } from "express";
import { cloneDeep } from "lodash";
import { UrlConfigs } from "../configs";
import { ApplicationEnums, UserEnums } from "../enums";
import { AuthenticationMiddleware } from "../middleware";
import { OtpModel, UserModel } from "../models";
import { LoggerUtils } from "../utils";

const userController = Router();

userController.get(
    `${UrlConfigs.API.USER}/:userId`,
    AuthenticationMiddleware.authenticate([UserEnums.ROLE.SUPER_ADMIN, UserEnums.ROLE.ADMIN], true),
    (request: Request, response: Response) => {
        const userId = request.params.userId;

        UserModel.findOne({ _id: userId }).then((users) => {
            return response.json(users);
        }).catch((error) => {
            LoggerUtils.error(`Unable to find user!`, error);
            return response.status(ApplicationEnums.STATUS_CODE.INTERNAL_SERVER_ERROR).end(error.message);
        });
    }
);

userController.get(
    `${UrlConfigs.API.USER}`,
    AuthenticationMiddleware.authenticate([UserEnums.ROLE.SUPER_ADMIN, UserEnums.ROLE.ADMIN]),
    (request: Request, response: Response) => {

        const loggedInUser = request.user;

        const filters = {
            ...request.query
        }

        if (loggedInUser?.role === UserEnums.ROLE.ADMIN) {
            filters.role = {
                $nin: [UserEnums.ROLE.SUPER_ADMIN]
            }
        }

        UserModel.find(filters).then((users) => {
            return response.json(users);
        }).catch((error) => {
            LoggerUtils.error(`Unable to find user!`, error);
            return response.status(ApplicationEnums.STATUS_CODE.INTERNAL_SERVER_ERROR).end(error.message);
        });
    }
);


userController.post(
    UrlConfigs.API.USER,
    AuthenticationMiddleware.authenticate([]),
    (request: Request, response: Response) => {
        const loggedInUser = request.user;
        const user = new UserModel(request.body);
        if (loggedInUser) {
            switch (loggedInUser.role) {
                case UserEnums.ROLE.SUPER_ADMIN:
                case UserEnums.ROLE.ADMIN:
                    if (user.role === UserEnums.ROLE.SUPER_ADMIN) {
                        return response.status(ApplicationEnums.STATUS_CODE.FORBIDDEN).end();
                    }
                    break;
                default:
                    return response.status(ApplicationEnums.STATUS_CODE.FORBIDDEN).end();
            }
        } else {
            user.role = UserEnums.ROLE.CUSTOMER;
        }

        user.validate(error => {
            if (error) {
                LoggerUtils.error(`Invalid body for user`, error);
                return response.status(ApplicationEnums.STATUS_CODE.BAD_REQUEST).end(error.message);
            }

            UserModel.register(user, request.body.password).then((user) => {
                return response.status(ApplicationEnums.STATUS_CODE.CREATED).json(user);
            }).catch((error) => {
                LoggerUtils.error("Unable to register user", error);
                return response.status(ApplicationEnums.STATUS_CODE.INTERNAL_SERVER_ERROR).end(error.message);
            });
        });
    }
);

userController.patch(
    `${UrlConfigs.API.USER}/:userId`,
    AuthenticationMiddleware.authenticate([UserEnums.ROLE.SUPER_ADMIN, UserEnums.ROLE.ADMIN], true),
    (request: Request, response: Response) => {
        const { emailAddress, otp, password } = request.body;
        const loggedInUser = request.user;
        const userId = request.params.userId;

        if (otp && emailAddress && password) {
            UserModel.findOne({ emailAddress: emailAddress }).then((user) => {
                if (user) {
                    OtpModel.findOne({ userId: user._id }).then((otpDocument) => {
                        if (otpDocument) {
                            if (otpDocument.otp === parseInt(otp)) {
                                const originalUser = cloneDeep(user);
                                user.setPassword(request.body.password).then(() => {
                                    user.save();
                                    return response.json(originalUser);
                                }).catch((error: any) => {
                                    LoggerUtils.error(`Unable to set password`, error);
                                    return response.status(ApplicationEnums.STATUS_CODE.INTERNAL_SERVER_ERROR).end(error.message);
                                });
                            } else {
                                return response.status(ApplicationEnums.STATUS_CODE.BAD_REQUEST).end();
                            }
                        } else {
                            return response.status(ApplicationEnums.STATUS_CODE.BAD_REQUEST).end();
                        }
                    }).catch(error => {
                        LoggerUtils.error(`Unable to find otp`, error);
                        return response.status(ApplicationEnums.STATUS_CODE.INTERNAL_SERVER_ERROR).end(error.message);
                    });
                }
                else {
                    return response.status(ApplicationEnums.STATUS_CODE.BAD_REQUEST).end();
                }
            }).catch(error => {
                LoggerUtils.error(`Unable to find user`, error);
                return response.status(ApplicationEnums.STATUS_CODE.INTERNAL_SERVER_ERROR).end(error.message);
            });
        } else {
            UserModel.findById({ _id: userId }).then((user) => {
                if (user) {
                    if (loggedInUser) {
                        switch (loggedInUser.role) {
                            case UserEnums.ROLE.SUPER_ADMIN:
                            case UserEnums.ROLE.ADMIN:
                                if (user.role === UserEnums.ROLE.SUPER_ADMIN) {
                                    return response.status(ApplicationEnums.STATUS_CODE.FORBIDDEN).end();
                                }
                                break;
                            default:
                                return response.status(ApplicationEnums.STATUS_CODE.FORBIDDEN).end();
                        }
                    }

                    const updateUser = () => {
                        delete request.body.password;
                        Object.assign(user, request.body);

                        user.validate((error) => {
                            if (error) {
                                LoggerUtils.error(`Invalid body for user`, error);
                                return response.status(ApplicationEnums.STATUS_CODE.BAD_REQUEST).end(error.message);
                            }

                            user.save().then(() => {
                                return response.json(user);
                            }).catch((error) => {
                                LoggerUtils.error(`Unable to save user`, error);
                                return response.status(ApplicationEnums.STATUS_CODE.INTERNAL_SERVER_ERROR).end(error.message);
                            });
                        });
                    }

                    if (password) {
                        user.setPassword(password).then(() => {
                            user.save().then(() => {
                                if (Object.keys(request.body).length === 1) {
                                    return response.json(user);
                                } else {
                                    updateUser();
                                }
                            }).catch((error) => {
                                LoggerUtils.error(`Unable to save user`, error);
                                if (Object.keys(request.body).length === 1) {
                                    return response.status(ApplicationEnums.STATUS_CODE.INTERNAL_SERVER_ERROR).end(error.message);
                                } else {
                                    updateUser();
                                }
                            });
                        }).catch((error) => {
                            LoggerUtils.error(`Unable to set password`, error);
                            if (Object.keys(request.body).length === 1) {
                                return response.status(ApplicationEnums.STATUS_CODE.INTERNAL_SERVER_ERROR).end(error.message);
                            } else {
                                updateUser();
                            }
                        });
                    } else {
                        updateUser();
                    }
                }
                else {
                    return response.status(ApplicationEnums.STATUS_CODE.BAD_REQUEST).end();
                }
            }).catch((error) => {
                LoggerUtils.error(`Unable to find user`, error);
                return response.status(ApplicationEnums.STATUS_CODE.INTERNAL_SERVER_ERROR).end(error.message);
            });
        }
    }
);

userController.delete(
    `${UrlConfigs.API.USER}/:userId`,
    AuthenticationMiddleware.authenticate([UserEnums.ROLE.SUPER_ADMIN, UserEnums.ROLE.ADMIN], true),
    (request: Request, response: Response) => {
        const loggedInUser = request.user;
        const userId = request.params.userId;

        UserModel.findById({ _id: userId }).then((user) => {
            if (user) {
                if (loggedInUser) {
                    switch (loggedInUser.role) {
                        case UserEnums.ROLE.SUPER_ADMIN:
                        case UserEnums.ROLE.ADMIN:
                            if (user.role === UserEnums.ROLE.SUPER_ADMIN) {
                                return response.status(ApplicationEnums.STATUS_CODE.FORBIDDEN).end();
                            }
                            break;
                        default:
                            return response.status(ApplicationEnums.STATUS_CODE.FORBIDDEN).end();
                    }
                }
                UserModel.findOneAndRemove({ _id: userId }).then((user) => {
                    if (user) {
                        response.json(user);
                    }
                    else {
                        return response.status(ApplicationEnums.STATUS_CODE.BAD_REQUEST).end();
                    }
                }).catch(error => {
                    LoggerUtils.error("Unable to delete user", error);
                    return response.status(ApplicationEnums.STATUS_CODE.INTERNAL_SERVER_ERROR).end(error.message);
                });
            }
            else {
                return response.status(ApplicationEnums.STATUS_CODE.BAD_REQUEST).end();
            }
        }).catch((error) => {
            LoggerUtils.error(`Unable to find user`, error);
            return response.status(ApplicationEnums.STATUS_CODE.INTERNAL_SERVER_ERROR).end(error.message);
        });
    }
);

export default userController;