import winstonOriginal from "winston";
import { ApplicationEnums } from "../enums";
const winston: typeof winstonOriginal = require("winston-callback");

export default winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ level: "info", filename: ApplicationEnums.LOG_FILE_PATH.INFO }),
        new winston.transports.File({ level: "error", filename: ApplicationEnums.LOG_FILE_PATH.ERROR }),
        new winston.transports.File({ filename: ApplicationEnums.LOG_FILE_PATH.COMBINED })
    ]
});