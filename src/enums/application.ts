export enum LOG_FILE_PATH {
    INFO = "./logs/info.log",
    ERROR = "./logs/error.log",
    COMBINED = "./logs/combined.log"
}

export enum STATUS_CODE {
    UNPROCESSABLE_ENTITY = 422,
    BAD_REQUEST = 400,
    INTERNAL_SERVER_ERROR = 500,
    CREATED = 201,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    SUCCESS = 200
}