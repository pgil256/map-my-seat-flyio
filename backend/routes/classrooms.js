"use strict";

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { adminOrCorrectUser } = require("../middleware/auth");
const Classroom = require("../models/classroom");
const SeatingChart = require("../models/seating_chart");

const classroomUpdateSchema = require("../schemas/classroom/classroomUpdate.json");
const seatingChartNewSchema = require("../schemas/seatingChart/seatingChartNew.json");
const seatingChartUpdateSchema = require("../schemas/seatingChart/seatingChartUpdate.json");

const router = new express.Router();

// const seatingChartRouter = express.Router({ mergeParams: true });

// router.use("/:classroomId/seating-charts", seatingChartRouter);

//Route for retrieving all classrooms for a user
router.get("/:username/all", adminOrCorrectUser, async function (req, res, next) {
  try {
    const classrooms = await Classroom.getClassrooms(req.params.username);
    return res.json({ classrooms });
  } catch (err) {
    return next(err);
  }
});

//Route for retrieving classroom via username (legacy - returns first classroom)
router.get("/:username", adminOrCorrectUser, async function (req, res, next) {
  try {
    const classroom = await Classroom.getClassroom(req.params.username);
    return res.status(200).json({ classroom });
  } catch (err) {
    return next(err);
  }
});

//Route for creating new classroom
router.post("/:username", adminOrCorrectUser, async function (req, res, next) {
  try {
    const { name } = req.body;
    const classroom = await Classroom.createClassroom(req.params.username, name);
    return res.status(201).json({ classroom });
  } catch (err) {
    return next(err);
  }
});


//Route for changing data in classroom
router.patch(
  "/:username/:classroomId",
  adminOrCorrectUser,
  async function (req, res, next) {
    try {
      const validator = jsonschema.validate(
        req.body.classroomId,
        classroomUpdateSchema
      );
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      const classroom = await Classroom.updateClassroom(req.params.classroomId, req.body);
      return res.json({ classroom });
    } catch (err) {
      return next(err);
    }
  }
);

//Route for deleting classroom
router.delete(
  "/:username/:classroomId",
  adminOrCorrectUser,
  async function (req, res, next) {
    try {
      await Classroom.deleteClassroom(req.params.classroomId);
      return res.json({ deleted: req.params.classroomId });
    } catch (err) {
      return next(err);
    }
  }
);

//----------------------Routes for all seating charts-----------------------------//

//Route for creating new seating chart
router.post(
  "/:username/:classroomId/seating-charts",
  adminOrCorrectUser,
  async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, seatingChartNewSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      const seatingChart = await SeatingChart.createSeatingChart(req.body);
      return res.status(201).json({ seatingChart });
    } catch (err) {
      return next(err);
    }
  }
);

//Route for retrieving all seating charts
router.get(
  "/:username/:classroomId/seating-charts/",
  adminOrCorrectUser,
  async function (req, res, next) {
    try {
      const seatingCharts = await SeatingChart.getSeatingCharts(req.params.classroomId);
      return res.json({ seatingCharts });
    } catch (err) {
      return next(err);
    }
  }
);

//Route for retrieving seating chart via number
router.get(
  "/:username/:classroomId/seating-charts/:seatingChartId",
  adminOrCorrectUser,
  async function (req, res, next) {
    try {
      const seatingChart = await SeatingChart.getSeatingChart(req.params.seatingChartId);
      return res.json({ seatingChart });
    } catch (err) {
      return next(err);
    }
  }
);

//Route for changing data in seating chart
router.patch(
  "/:username/:classroomId/seating-charts/:seatingChartId",
  adminOrCorrectUser,
  async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, seatingChartUpdateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      const seatingChart = await SeatingChart.updateSeatingChart(
        req.params.seatingChartId,
        req.body
      );
      return res.json({ seatingChart });
    } catch (err) {
      return next(err);
    }
  }
);

//Route for duplicating a seating chart
router.post(
  "/:username/:classroomId/seating-charts/:seatingChartId/duplicate",
  adminOrCorrectUser,
  async function (req, res, next) {
    try {
      const { label } = req.body;
      const seatingChart = await SeatingChart.duplicateSeatingChart(
        req.params.seatingChartId,
        label
      );
      return res.status(201).json({ seatingChart });
    } catch (err) {
      return next(err);
    }
  }
);

//Route for deleting seating chart
router.delete(
  "/:username/:classroomId/seating-charts/:seatingChartId",
  adminOrCorrectUser,
  async function (req, res, next) {
    try {
      await SeatingChart.deleteSeatingChart(req.params.seatingChartId);
      return res.json({ deleted: req.params.seatingChartId });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
