"use strict";

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { adminOrCorrectUser } = require("../middleware/auth");

const Period = require("../models/period");
const Student = require("../models/student");

const periodNewSchema = require("../schemas/period/periodNew.json");
const periodUpdateSchema = require("../schemas/period/periodUpdate.json");
const studentNewSchema = require("../schemas/student/studentNew.json");
const studentUpdateSchema = require("../schemas/student/studentUpdate.json");

const router = new express.Router();

// const studentRouter = express.Router({ mergeParams: true });

// router.use(":periodId/students", studentRouter);

//Route for creating new period
router.post("/:username", adminOrCorrectUser, async function (req, res, next) {
  try {
    // Add username from URL params to request body for validation and model
    const periodData = { ...req.body, username: req.params.username };
    const validator = jsonschema.validate(periodData, periodNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const period = await Period.createPeriod(periodData);
    return res.status(201).json({ period });
  } catch (err) {
    return next(err);
  }
});

//Route for retrieving all periods via username
router.get("/:username", adminOrCorrectUser, async function (req, res, next) {
  try {
    const periods = await Period.getPeriods(req.params.username);
    return res.json({ periods });
  } catch (err) {
    return next(err);
  }
});

//Route for retrieving period via id
router.get("/:username/:periodId", adminOrCorrectUser, async function (req, res, next) {
  try {
    const period = await Period.getPeriod(req.params.periodId);
    return res.json({ period });
  } catch (err) {
    return next(err);
  }
});

//Route for changing data in period
router.patch("/:username/:periodId", adminOrCorrectUser, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, periodUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const period = await Period.updatePeriod(req.params.periodId, req.body);
    return res.json({ period });
  } catch (err) {
    return next(err);
  }
});

//Route for deleting period
router.delete(
  "/:username/:periodId",
  adminOrCorrectUser,
  async function (req, res, next) {
    try {
      await Period.deletePeriod(req.params.periodId);
      return res.json({ deleted: req.params.periodId });
    } catch (err) {
      return next(err);
    }
  }
);

//-----------------------Routes for all students------------------------------//

//Route for creating new student
router.post("/:username/:periodId/students", adminOrCorrectUser, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, studentNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const student = await Student.createStudent(req.body);
    return res.status(201).json({ student });
  } catch (err) {
    return next(err);
  }
});

//Route for changing data in student
router.patch(
  "/:username/:periodId/students/:studentId",
  adminOrCorrectUser,
  async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, studentUpdateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      const student = await Student.updateStudent(
        req.params.studentId,
        req.body
      );
      return res.json({ student });
    } catch (err) {
      return next(err);
    }
  }
);

//Route for deleting student
router.delete(
  "/:username/:periodId/students/:studentId",
  adminOrCorrectUser,
  async function (req, res, next) {
    try {
      await Student.deleteStudent(req.params.studentId);
      return res.json({ deleted: req.params.studentId });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
