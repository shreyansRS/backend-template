import { NextFunction, Request, Response } from "express";
import passport from "passport";
import { ApplicationEnums, UserEnums } from "../enums";

export const authenticate = (roles: Array<UserEnums.ROLE> = [], allowSameUser = false) => [
    ((request: Request, response: Response, next: NextFunction) => {
        passport.authenticate('jwt', { session: false }, (error, user) => {
            if (error) {
                return response.status(ApplicationEnums.STATUS_CODE.INTERNAL_SERVER_ERROR).end(error.message);
            }
            if (!user) {
                if (roles.length === 0) {
                    return next();
                }
                return response.status(ApplicationEnums.STATUS_CODE.UNAUTHORIZED).end();
            }
            request.login(user, { session: false }, (error) => {
                if (error) {
                    return response.status(ApplicationEnums.STATUS_CODE.INTERNAL_SERVER_ERROR).end(error.message);
                }

                request.user = user;
                return next();
            });
        })(request, response);
    }),
    ((request: Request, response: Response, next: NextFunction) => {
        if (roles.length > 0) {
            const loggedInUser = request.user;
            const { userId } = request.params;

            if (loggedInUser) {
                if ((userId === loggedInUser._id && allowSameUser) || roles.includes(loggedInUser.role)) {
                    return next();
                }
            }
            return response.status(ApplicationEnums.STATUS_CODE.FORBIDDEN).end();
        }
        return next();
    })
];