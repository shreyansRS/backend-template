
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import { AddressInfo } from "net";
import passport from "passport";
import { ExtractJwt, Strategy as JWTStrategy } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";
import { ApplicationConfig, DBConfig, KeyConfigs } from "./configs";
import { UserModel } from "./models";
import { DataUtils, LoggerUtils } from "./utils";
const app = express();

mongoose.connect(DBConfig.MONGO_DB_URL, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true
}).then(() => {
    DataUtils.createSuperAdminUser();
}).catch(error => {
    LoggerUtils.error(`Unable to connect with database!`, error);
});

passport.use(
    new JWTStrategy({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: KeyConfigs.PASSPORT_SECRET
    }, (jwtPayload, callback) => {
        UserModel.findOne({ emailAddress: jwtPayload.emailAddress }).then(user => {
            callback(null, user);
        }).catch(error => {
            LoggerUtils.error(`Unable to find user!`, error);
            callback(error);
        });
    })
);

passport.use(new LocalStrategy({
    usernameField: `emailAddress`,
    passwordField: `password`
}, UserModel.authenticate()));

passport.serializeUser(UserModel.serializeUser);
passport.deserializeUser(UserModel.deserializeUser);

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.get("/", (req, res) => {
    res.set('Content-Type', 'text/html');
    res.send(Buffer.from(`
    <form method="POST" action="/redirect">
        <input type="text" id="fname" name="fname"><br>
        <input type="submit" value="Submit">
    </form>
    `

    ));

})

app.post("/redirect", (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0'); // one year
    res.redirect("https://localhost:3000")
})
// app.use(UrlConfigs.API.ROOT, AuthenticationController);
// app.use(UrlConfigs.API.ROOT, UserController);

try {
    const server = app.listen(ApplicationConfig.PORT_NUMBER, () => {
        const { port, address } = server.address() as AddressInfo;
        LoggerUtils.info(`Applications started. Running at http://${address}:${port}.`);
    });
} catch (error) {
    LoggerUtils.error(`Unable to start application!`, error);
}

process.on("uncaughtException", (error) => {
    LoggerUtils.error(`Uncaught exception!`, error);
});

process.on("unhandledRejection", (reason) => {
    LoggerUtils.error(`Unhandled rejection!`, reason);
});