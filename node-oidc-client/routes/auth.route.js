const path = require("path");
const express = require("express");
const {login,callback} = require(path.join(__dirname,"../controllers/auth.controller.js"));

router = express.Router();

router.get("/login",login);

router.get("/callback",callback);


module.exports = router;