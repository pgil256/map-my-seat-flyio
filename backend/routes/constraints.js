"use strict";

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { adminOrCorrectUser } = require("../middleware/auth");
const StudentConstraint = require("../models/studentConstraint");

const constraintNewSchema = require("../schemas/constraint/constraintNew.json");

const router = new express.Router();

/** POST /constraints/:username/:periodId
 * Create a new student constraint.
 * Body: { studentId1, studentId2, constraintType }
 */
router.post("/:username/:periodId", adminOrCorrectUser, async function(req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, constraintNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const { studentId1, studentId2, constraintType } = req.body;
    const constraint = await StudentConstraint.createConstraint(
      studentId1,
      studentId2,
      constraintType
    );

    return res.status(201).json({ constraint });
  } catch (err) {
    return next(err);
  }
});

/** GET /constraints/:username/:periodId
 * Get all constraints for a period.
 */
router.get("/:username/:periodId", adminOrCorrectUser, async function(req, res, next) {
  try {
    const constraints = await StudentConstraint.getConstraintsByPeriod(
      req.params.periodId
    );
    return res.json({ constraints });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /constraints/:username/:periodId/:constraintId
 * Update a constraint type.
 * Body: { constraintType }
 */
router.patch(
  "/:username/:periodId/:constraintId",
  adminOrCorrectUser,
  async function(req, res, next) {
    try {
      const { constraintType } = req.body;
      if (!['separate', 'pair'].includes(constraintType)) {
        throw new BadRequestError('constraintType must be "separate" or "pair"');
      }

      const constraint = await StudentConstraint.updateConstraint(
        req.params.constraintId,
        constraintType
      );

      return res.json({ constraint });
    } catch (err) {
      return next(err);
    }
  }
);

/** DELETE /constraints/:username/:periodId/:constraintId
 * Delete a constraint.
 */
router.delete(
  "/:username/:periodId/:constraintId",
  adminOrCorrectUser,
  async function(req, res, next) {
    try {
      await StudentConstraint.deleteConstraint(req.params.constraintId);
      return res.json({ deleted: req.params.constraintId });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
