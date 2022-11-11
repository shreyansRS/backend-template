import { UserModel } from "./src/interfaces/user";

declare global {
    namespace Express {
        interface Request {
            user?: UserModel
        }
    }
    namespace NodeJS {
        interface ProcessEnv {
            PASSPORT_SECRET_KEY: string,
            API_PORT: string,
            API_VERSION: string,
            API_HOST: string,
            UI_HOST: string,
            SUPER_ADMIN_NAME: string,
            SUPER_ADMIN_EMAIL_ADDRESS: string,
            SUPER_ADMIN_CONTACT_NUMBER: string,
            SUPER_ADMIN_PASSWORD: string,
            MONGODB_HOST_NAME: string,
            MONGODB_DB_NAME: string,
            MONGODB_USER_NAME: string,
            MONGODB_PASSWORD: string,
            EMAIL_USER_NAME: string,
            EMAIL_PASSWORD: string,
        }
    }
}

export { };
