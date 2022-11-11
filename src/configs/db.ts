
const MONGODB_HOST_NAME = process.env.MONGODB_HOST_NAME;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;
const MONGODB_USER_NAME = process.env.MONGODB_USER_NAME;
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD;

export const MONGO_DB_URL = `mongodb${MONGODB_USER_NAME.includes("localhost") ? `+srv` : ``}://${MONGODB_USER_NAME ? `${MONGODB_USER_NAME}:${MONGODB_PASSWORD}@` : ``}${MONGODB_HOST_NAME}/${MONGODB_DB_NAME}?retryWrites=true&w=majority`;