
export const APPLICATION_NAME = "TEST";

export const API_VERSION = process.env.API_VERSION;
export const PORT_NUMBER = process.env.API_PORT;

export const MAIL_TRANSPORT = {
    service: "gmail",
    pool: true,
    auth: {
        user: process.env.EMAIL_USER_NAME,
        pass: process.env.EMAIL_PASSWORD
    }
}

export const SUPER_ADMIN = {
    name: process.env.SUPER_ADMIN_NAME,
    emailAddress: process.env.SUPER_ADMIN_EMAIL_ADDRESS,
    contactNumber: process.env.SUPER_ADMIN_CONTACT_NUMBER,
    password: process.env.SUPER_ADMIN_PASSWORD
}
