import { ApplicationConfig } from ".";

export const API = {
    ROOT: `/api/v${ApplicationConfig.API_VERSION}`,
    LOGIN: "/login",
    USER: "/user",
    GENERATE_OTP: "/generate-otp"
}