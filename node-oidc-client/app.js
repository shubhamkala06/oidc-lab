require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("path");

const authRoutes = require(path.join(__dirname,"./routes/auth.route.js"));
const oidcService = require("./services/oidc.service");

const app = express();

app.use(express.json());

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);

app.use("/auth", authRoutes);

(async () => {

    await oidcService.initialize();

    app.listen(process.env.PORT, () => {

        console.log(
            `Server started on ${process.env.PORT}`
        );

    });

})();