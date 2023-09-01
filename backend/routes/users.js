"use strict";

//Routes for users/admin to maintain/alter profiles
const jsonschema = require("jsonschema");

const express = require("express");
const { adminOrCorrectUser, adminOnly } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");

const { createToken } = require("../helpers/tokens");
const userNewSchema = require("../schemas/user/userNew.json");
const userUpdateSchema = require("../schemas/user/userUpdate.json");

const router = express.Router();

//Create new user (for admin only)
router.post("/", adminOnly, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.register(req.body);
    const token = createToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
});

//Get all users (admin only)
router.get("/", adminOnly, async function (req, res, next) {
  try {
    const users = await User.findAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

//Get individual user (admin/correct user only)
router.get("/:username", adminOrCorrectUser, async function (req, res, next) {
  try {
    const user = await User.get(req.params.username);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

//Change individual user (admin/correct user only)
router.patch("/:username", adminOrCorrectUser, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const user = await User.update(req.params.username, req.body);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

//Delete a particular user (admin/correct user only)
router.delete(
  "/:username",
  adminOrCorrectUser,
  async function (req, res, next) {
    try {
      app.use("/settings", settingsRoutes);
      await User.remove(req.params.username);
      return res.json({ deleted: req.params.username });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
