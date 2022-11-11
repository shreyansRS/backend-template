import nodemailer from "nodemailer";
import { MailOptions } from "nodemailer/lib/json-transport";
import { ApplicationConfig } from "../configs";

export const sendMail = (config: MailOptions) => {
    const transporter = nodemailer.createTransport(ApplicationConfig.MAIL_TRANSPORT);
    return (
        transporter.sendMail({
            ...config,
            from: `"Admin - ${ApplicationConfig.APPLICATION_NAME}" <${ApplicationConfig.MAIL_TRANSPORT.auth.user}>`,
        }).finally(() => {
            transporter.close();
        })
    );
}