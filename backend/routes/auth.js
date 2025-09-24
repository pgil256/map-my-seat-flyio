"use strict";

//Routes to for auth
const jsonschema = require("jsonschema");

const User = require("../models/user");
const express = require("express");
const router = new express.Router();

const { createToken } = require("../helpers/tokens");
const userAuthSchema = require("../schemas/auth/userAuth.json");
const userRegisterSchema = require("../schemas/auth/userRegister.json");
const { BadRequestError } = require("../expressError");

//Create token upon login
router.post("/token", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userAuthSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const { username, password } = req.body;
    const user = await User.authenticate(username, password);
    console.log(user);
    const token = createToken(user);
    console.log(token)
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});

//Create token for new user
router.post("/register", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userRegisterSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const newUser = await User.register({ ...req.body, isAdmin: false });
    const token = createToken(newUser);
    return res.status(201).json({ token });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
