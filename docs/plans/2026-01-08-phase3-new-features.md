# Phase 3: New Features Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add teacher-requested features: multiple classrooms per user, student separation/pairing rules, seating chart history with labels, and bulk student management.

**Architecture:** Database-first approach - add migrations, then models, then routes, then frontend. Each feature is self-contained. Student constraints use a junction table with constraint types. Multiple classrooms removes the unique constraint and adds a name field. Seating chart history adds timestamps and labels.

**Tech Stack:** PostgreSQL, Knex.js migrations, Express routes, React components, Chakra UI

---

## Task 1: Database Migration - Multiple Classrooms

**Files:**
- Create: `backend/migrations/20260108120000_multiple_classrooms.js`

**Step 1: Create migration file**

```javascript
exports.up = function(knex) {
  return knex.schema.alterTable('classrooms', function(table) {
    table.string('name', 100).defaultTo('My Classroom');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('classrooms', function(table) {
    table.dropColumn('name');
  });
};
```

**Step 2: Verify migration file exists**

Run: `ls backend/migrations/20260108120000_multiple_classrooms.js`
Expected: File exists

**Step 3: Commit**

```bash
git add backend/migrations/20260108120000_multiple_classrooms.js
git commit -m "feat(db): add name column to classrooms for multiple classroom support

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Database Migration - Student Constraints

**Files:**
- Create: `backend/migrations/20260108120001_student_constraints.js`

**Step 1: Create migration file**

```javascript
exports.up = function(knex) {
  return knex.schema.createTable('student_constraints', function(table) {
    table.increments('constraint_id').primary();
    table.integer('student_id_1').notNullable()
      .references('student_id').inTable('students').onDelete('CASCADE');
    table.integer('student_id_2').notNullable()
      .references('student_id').inTable('students').onDelete('CASCADE');
    table.enu('constraint_type', ['separate', 'pair']).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Ensure no duplicate constraints (either direction)
    table.unique(['student_id_1', 'student_id_2']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('student_constraints');
};
```

**Step 2: Verify migration file exists**

Run: `ls backend/migrations/20260108120001_student_constraints.js`
Expected: File exists

**Step 3: Commit**

```bash
git add backend/migrations/20260108120001_student_constraints.js
git commit -m "feat(db): add student_constraints table for separation/pairing rules

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Database Migration - Seating Chart History

**Files:**
- Create: `backend/migrations/20260108120002_seating_chart_history.js`

**Step 1: Create migration file**

```javascript
exports.up = function(knex) {
  return knex.schema.alterTable('seating_charts', function(table) {
    table.string('label', 100);
    table.integer('period_id').references('period_id').inTable('periods').onDelete('CASCADE');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('seating_charts', function(table) {
    table.dropColumn('label');
    table.dropColumn('period_id');
    table.dropColumn('created_at');
  });
};
```

**Step 2: Verify migration file exists**

Run: `ls backend/migrations/20260108120002_seating_chart_history.js`
Expected: File exists

**Step 3: Commit**

```bash
git add backend/migrations/20260108120002_seating_chart_history.js
git commit -m "feat(db): add label, period_id, created_at to seating_charts

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Update Classroom Model for Multiple Classrooms

**Files:**
- Modify: `backend/models/classroom.js`

**Step 1: Update getClassroom to getClassrooms (return all)**

Add new method after existing `getClassroom`:

```javascript
static async getClassrooms(username) {
  const classrooms = await db
    .select([
      db.raw('classroom_id AS "classroomId"'),
      db.raw('user_username AS "username"'),
      'name',
      db.raw('seat_alphabetical AS "seatAlphabetical"'),
      db.raw('seat_randomize AS "seatRandomize"'),
      db.raw('seat_male_female AS "seatMaleFemale"'),
      db.raw('seat_high_low AS "seatHighLow"'),
      db.raw('ese_is_priority AS "eseIsPriority"'),
      db.raw('ell_is_priority AS "ellIsPriority"'),
      db.raw('fivezerofour_is_priority AS "fiveZeroFourIsPriority"'),
      db.raw('ebd_is_priority AS "ebdIsPriority"'),
      db.raw('seating_config AS "seatingConfig"')
    ])
    .from('classrooms')
    .where('user_username', username);

  return classrooms;
}

static async getClassroomById(classroomId) {
  const classroom = await db
    .select([
      db.raw('classroom_id AS "classroomId"'),
      db.raw('user_username AS "username"'),
      'name',
      db.raw('seat_alphabetical AS "seatAlphabetical"'),
      db.raw('seat_randomize AS "seatRandomize"'),
      db.raw('seat_male_female AS "seatMaleFemale"'),
      db.raw('seat_high_low AS "seatHighLow"'),
      db.raw('ese_is_priority AS "eseIsPriority"'),
      db.raw('ell_is_priority AS "ellIsPriority"'),
      db.raw('fivezerofour_is_priority AS "fiveZeroFourIsPriority"'),
      db.raw('ebd_is_priority AS "ebdIsPriority"'),
      db.raw('seating_config AS "seatingConfig"')
    ])
    .from('classrooms')
    .where('classroom_id', classroomId)
    .first();

  if (!classroom) {
    throw new NotFoundError(`Classroom with id ${classroomId} does not exist`);
  }

  return classroom;
}
```

**Step 2: Update createClassroom to accept name**

Modify `createClassroom` to accept `name` parameter:

```javascript
static async createClassroom(username, name = 'My Classroom') {
  const [classroom] = await db('classrooms')
    .insert({
      user_username: username,
      name: name,
      seat_alphabetical: false,
      seat_randomize: false,
      seat_male_female: false,
      seat_high_low: false,
      ese_is_priority: false,
      ell_is_priority: false,
      fivezerofour_is_priority: false,
      ebd_is_priority: false,
      seating_config: JSON.stringify(
        Array.from({ length: 12 }, () => Array(12).fill(null))
      )
    })
    .returning([
      db.raw('classroom_id AS "classroomId"'),
      db.raw('user_username AS "username"'),
      'name',
      db.raw('seat_alphabetical AS "seatAlphabetical"'),
      db.raw('seat_randomize AS "seatRandomize"'),
      db.raw('seat_male_female AS "seatMaleFemale"'),
      db.raw('ese_is_priority AS "eseIsPriority"'),
      db.raw('ell_is_priority AS "ellIsPriority"'),
      db.raw('fivezerofour_is_priority AS "fiveZeroFourIsPriority"'),
      db.raw('ebd_is_priority AS "ebdIsPriority"'),
      db.raw('seating_config AS "seatingConfig"')
    ]);

  return classroom;
}
```

**Step 3: Update updateClassroom to include name**

Add `name` to the mapping in `updateClassroom`:

```javascript
const dataToUpdate = sqlForPartialUpdate(
  data,
  {
    name: "name",
    seatAlphabetical: "seat_alphabetical",
    // ... rest of existing mappings
  }
);
```

**Step 4: Commit**

```bash
git add backend/models/classroom.js
git commit -m "feat(api): update Classroom model for multiple classrooms

- Add getClassrooms() to return all user classrooms
- Add getClassroomById() for single classroom lookup
- Update createClassroom() to accept name parameter
- Add name to updateClassroom() mappings

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Create StudentConstraint Model

**Files:**
- Create: `backend/models/studentConstraint.js`

**Step 1: Create the model file**

```javascript
const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");

class StudentConstraint {
  /**
   * Create a constraint between two students.
   * @param {number} studentId1 - First student ID
   * @param {number} studentId2 - Second student ID
   * @param {string} constraintType - 'separate' or 'pair'
   */
  static async createConstraint(studentId1, studentId2, constraintType) {
    // Ensure consistent ordering to prevent duplicates
    const [id1, id2] = studentId1 < studentId2
      ? [studentId1, studentId2]
      : [studentId2, studentId1];

    // Check for existing constraint
    const existing = await db('student_constraints')
      .where({ student_id_1: id1, student_id_2: id2 })
      .first();

    if (existing) {
      throw new BadRequestError('Constraint already exists between these students');
    }

    const [constraint] = await db('student_constraints')
      .insert({
        student_id_1: id1,
        student_id_2: id2,
        constraint_type: constraintType
      })
      .returning([
        db.raw('constraint_id AS "constraintId"'),
        db.raw('student_id_1 AS "studentId1"'),
        db.raw('student_id_2 AS "studentId2"'),
        db.raw('constraint_type AS "constraintType"'),
        db.raw('created_at AS "createdAt"')
      ]);

    return constraint;
  }

  /**
   * Get all constraints for students in a period.
   * @param {number} periodId - Period ID
   */
  static async getConstraintsByPeriod(periodId) {
    const constraints = await db('student_constraints as sc')
      .join('students as s1', 'sc.student_id_1', 's1.student_id')
      .join('students as s2', 'sc.student_id_2', 's2.student_id')
      .where('s1.period_id', periodId)
      .select([
        db.raw('sc.constraint_id AS "constraintId"'),
        db.raw('sc.student_id_1 AS "studentId1"'),
        db.raw('s1.name AS "studentName1"'),
        db.raw('sc.student_id_2 AS "studentId2"'),
        db.raw('s2.name AS "studentName2"'),
        db.raw('sc.constraint_type AS "constraintType"'),
        db.raw('sc.created_at AS "createdAt"')
      ]);

    return constraints;
  }

  /**
   * Get constraints for a specific student.
   * @param {number} studentId - Student ID
   */
  static async getConstraintsForStudent(studentId) {
    const constraints = await db('student_constraints')
      .where('student_id_1', studentId)
      .orWhere('student_id_2', studentId)
      .select([
        db.raw('constraint_id AS "constraintId"'),
        db.raw('student_id_1 AS "studentId1"'),
        db.raw('student_id_2 AS "studentId2"'),
        db.raw('constraint_type AS "constraintType"')
      ]);

    return constraints;
  }

  /**
   * Update constraint type.
   * @param {number} constraintId - Constraint ID
   * @param {string} constraintType - New type ('separate' or 'pair')
   */
  static async updateConstraint(constraintId, constraintType) {
    const [constraint] = await db('student_constraints')
      .where('constraint_id', constraintId)
      .update({ constraint_type: constraintType })
      .returning([
        db.raw('constraint_id AS "constraintId"'),
        db.raw('constraint_type AS "constraintType"')
      ]);

    if (!constraint) {
      throw new NotFoundError(`Constraint ${constraintId} not found`);
    }

    return constraint;
  }

  /**
   * Delete a constraint.
   * @param {number} constraintId - Constraint ID
   */
  static async deleteConstraint(constraintId) {
    const result = await db('student_constraints')
      .where('constraint_id', constraintId)
      .del();

    if (result === 0) {
      throw new NotFoundError(`Constraint ${constraintId} not found`);
    }
  }
}

module.exports = StudentConstraint;
```

**Step 2: Verify file exists**

Run: `ls backend/models/studentConstraint.js`
Expected: File exists

**Step 3: Commit**

```bash
git add backend/models/studentConstraint.js
git commit -m "feat(api): add StudentConstraint model for separation/pairing rules

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Create Student Constraints Routes

**Files:**
- Create: `backend/routes/constraints.js`
- Create: `backend/schemas/constraint/constraintNew.json`
- Modify: `backend/app.js`

**Step 1: Create JSON schema for validation**

Create `backend/schemas/constraint/constraintNew.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["studentId1", "studentId2", "constraintType"],
  "properties": {
    "studentId1": {
      "type": "integer",
      "minimum": 1
    },
    "studentId2": {
      "type": "integer",
      "minimum": 1
    },
    "constraintType": {
      "type": "string",
      "enum": ["separate", "pair"]
    }
  },
  "additionalProperties": false
}
```

**Step 2: Create routes file**

Create `backend/routes/constraints.js`:

```javascript
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
```

**Step 3: Register routes in app.js**

Add to `backend/app.js` with other route imports:

```javascript
const constraintsRoutes = require("./routes/constraints");
```

And add with other route registrations:

```javascript
app.use("/constraints", constraintsRoutes);
```

**Step 4: Commit**

```bash
mkdir -p backend/schemas/constraint
git add backend/schemas/constraint/constraintNew.json backend/routes/constraints.js backend/app.js
git commit -m "feat(api): add student constraints API routes

- POST /constraints/:username/:periodId - create constraint
- GET /constraints/:username/:periodId - get period constraints
- PATCH /constraints/:username/:periodId/:constraintId - update
- DELETE /constraints/:username/:periodId/:constraintId - delete

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Update Seating Chart Model for History

**Files:**
- Modify: `backend/models/seating_chart.js`

**Step 1: Update createSeatingChart to accept label and periodId**

```javascript
static async createSeatingChart({ classroomId, periodId, number, label, seatingChart }) {
  const [result] = await db('seating_charts')
    .insert({
      classroom_id: classroomId,
      period_id: periodId,
      number: number,
      label: label || null,
      seating_chart: seatingChart
    })
    .returning([
      db.raw('seating_chart_id AS "seatingChartId"'),
      db.raw('classroom_id AS "classroomId"'),
      db.raw('period_id AS "periodId"'),
      'number',
      'label',
      db.raw('seating_chart AS "seatingChart"'),
      db.raw('created_at AS "createdAt"')
    ]);

  return result;
}
```

**Step 2: Update getSeatingCharts to include new fields and order by date**

```javascript
static async getSeatingCharts(classroomId) {
  const seatingCharts = await db('seating_charts')
    .select([
      db.raw('seating_chart_id AS "seatingChartId"'),
      db.raw('classroom_id AS "classroomId"'),
      db.raw('period_id AS "periodId"'),
      'number',
      'label',
      db.raw('seating_chart AS "seatingChart"'),
      db.raw('created_at AS "createdAt"')
    ])
    .where('classroom_id', classroomId)
    .orderBy('created_at', 'desc');

  return seatingCharts;
}
```

**Step 3: Add getSeatingChartsByPeriod method**

```javascript
static async getSeatingChartsByPeriod(periodId) {
  const seatingCharts = await db('seating_charts')
    .select([
      db.raw('seating_chart_id AS "seatingChartId"'),
      db.raw('classroom_id AS "classroomId"'),
      db.raw('period_id AS "periodId"'),
      'number',
      'label',
      db.raw('seating_chart AS "seatingChart"'),
      db.raw('created_at AS "createdAt"')
    ])
    .where('period_id', periodId)
    .orderBy('created_at', 'desc');

  return seatingCharts;
}
```

**Step 4: Add duplicateSeatingChart method**

```javascript
static async duplicateSeatingChart(seatingChartId, newLabel) {
  const original = await this.getSeatingChart(seatingChartId);

  const [duplicate] = await db('seating_charts')
    .insert({
      classroom_id: original.classroomId,
      period_id: original.periodId,
      number: original.number,
      label: newLabel || `Copy of ${original.label || 'Chart'}`,
      seating_chart: original.seatingChart
    })
    .returning([
      db.raw('seating_chart_id AS "seatingChartId"'),
      db.raw('classroom_id AS "classroomId"'),
      db.raw('period_id AS "periodId"'),
      'number',
      'label',
      db.raw('seating_chart AS "seatingChart"'),
      db.raw('created_at AS "createdAt"')
    ]);

  return duplicate;
}
```

**Step 5: Update updateSeatingChart mappings**

```javascript
const dataToUpdate = sqlForPartialUpdate(data, {
  number: "number",
  label: "label",
  seatingChart: "seating_chart"
});
```

**Step 6: Commit**

```bash
git add backend/models/seating_chart.js
git commit -m "feat(api): update SeatingChart model for history support

- Add label, periodId, createdAt to create/get methods
- Add getSeatingChartsByPeriod() for period-specific charts
- Add duplicateSeatingChart() for copying charts
- Order charts by created_at desc

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Update Classrooms Routes for Multiple Classrooms

**Files:**
- Modify: `backend/routes/classrooms.js`

**Step 1: Add route to get all classrooms**

Add after existing GET route:

```javascript
// Route for retrieving all classrooms for a user
router.get("/:username/all", adminOrCorrectUser, async function(req, res, next) {
  try {
    const classrooms = await Classroom.getClassrooms(req.params.username);
    return res.json({ classrooms });
  } catch (err) {
    return next(err);
  }
});
```

**Step 2: Update POST route to accept name**

```javascript
router.post("/:username", adminOrCorrectUser, async function(req, res, next) {
  try {
    const { name } = req.body;
    const classroom = await Classroom.createClassroom(req.params.username, name);
    return res.status(201).json({ classroom });
  } catch (err) {
    return next(err);
  }
});
```

**Step 3: Add route for seating chart duplication**

Add in the seating charts section:

```javascript
// Route for duplicating a seating chart
router.post(
  "/:username/:classroomId/seating-charts/:seatingChartId/duplicate",
  adminOrCorrectUser,
  async function(req, res, next) {
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
```

**Step 4: Commit**

```bash
git add backend/routes/classrooms.js
git commit -m "feat(api): update classroom routes for multiple classrooms

- Add GET /:username/all to list all classrooms
- Update POST to accept name in body
- Add POST .../duplicate for seating chart duplication

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Add API Methods to Frontend

**Files:**
- Modify: `frontend/src/api.js`

**Step 1: Read current api.js structure**

First, read the file to understand the pattern.

**Step 2: Add classroom methods**

Add to the SeatingApi class:

```javascript
/** Get all classrooms for a user */
static async getClassrooms(username) {
  let res = await this.request(`classrooms/${username}/all`);
  return res.classrooms;
}

/** Create a new classroom */
static async createClassroomWithName(username, name) {
  let res = await this.request(`classrooms/${username}`, { name }, "post");
  return res.classroom;
}
```

**Step 3: Add constraint methods**

```javascript
/** Get all constraints for a period */
static async getConstraints(username, periodId) {
  let res = await this.request(`constraints/${username}/${periodId}`);
  return res.constraints;
}

/** Create a student constraint */
static async createConstraint(username, periodId, data) {
  let res = await this.request(`constraints/${username}/${periodId}`, data, "post");
  return res.constraint;
}

/** Delete a constraint */
static async deleteConstraint(username, periodId, constraintId) {
  await this.request(`constraints/${username}/${periodId}/${constraintId}`, {}, "delete");
}
```

**Step 4: Add seating chart history methods**

```javascript
/** Get seating charts by period */
static async getSeatingChartsByPeriod(username, classroomId, periodId) {
  let res = await this.request(`classrooms/${username}/${classroomId}/seating-charts?periodId=${periodId}`);
  return res.seatingCharts;
}

/** Duplicate a seating chart */
static async duplicateSeatingChart(username, classroomId, seatingChartId, label) {
  let res = await this.request(
    `classrooms/${username}/${classroomId}/seating-charts/${seatingChartId}/duplicate`,
    { label },
    "post"
  );
  return res.seatingChart;
}
```

**Step 5: Commit**

```bash
git add frontend/src/api.js
git commit -m "feat(ui): add API methods for Phase 3 features

- getClassrooms, createClassroomWithName
- getConstraints, createConstraint, deleteConstraint
- getSeatingChartsByPeriod, duplicateSeatingChart

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 10: Create Classroom List Component

**Files:**
- Create: `frontend/src/classroom/ClassroomList.jsx`

**Step 1: Create the component**

```jsx
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import SeatingApi from "../api";
import UserContext from "../auth/UserContext";
import EmptyState from "../common/EmptyState";
import LoadingSpinner from "../common/LoadingSpinner";
import {
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Heading,
  SimpleGrid,
  Text,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  VStack,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";

function ClassroomList() {
  const { currentUser } = useContext(UserContext);
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newClassroomName, setNewClassroomName] = useState("");

  useEffect(() => {
    async function fetchClassrooms() {
      try {
        const data = await SeatingApi.getClassrooms(currentUser.username);
        setClassrooms(data);
      } catch (err) {
        console.error("Failed to fetch classrooms:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchClassrooms();
  }, [currentUser.username]);

  const handleCreateClassroom = async () => {
    try {
      const classroom = await SeatingApi.createClassroomWithName(
        currentUser.username,
        newClassroomName || "My Classroom"
      );
      setClassrooms([...classrooms, classroom]);
      setNewClassroomName("");
      onClose();
    } catch (err) {
      console.error("Failed to create classroom:", err);
    }
  };

  const handleDeleteClassroom = async (classroomId) => {
    if (!window.confirm("Delete this classroom and all its seating charts?")) {
      return;
    }
    try {
      await SeatingApi.deleteClassroom(currentUser.username, classroomId);
      setClassrooms(classrooms.filter(c => c.classroomId !== classroomId));
    } catch (err) {
      console.error("Failed to delete classroom:", err);
    }
  };

  if (loading) return <LoadingSpinner message="Loading classrooms..." />;

  return (
    <Container maxW="6xl" py={8}>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">My Classrooms</Heading>
        <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onOpen}>
          New Classroom
        </Button>
      </HStack>

      {classrooms.length === 0 ? (
        <EmptyState
          title="No classrooms yet"
          description="Create your first classroom to start designing seating layouts."
          actionLabel="Create Classroom"
          onAction={onOpen}
        />
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {classrooms.map((classroom) => (
            <Card key={classroom.classroomId} variant="outline">
              <CardBody>
                <VStack align="start" spacing={3}>
                  <Heading size="md">{classroom.name}</Heading>
                  <Text color="gray.500" fontSize="sm">
                    {classroom.seatingConfig
                      ? `${JSON.parse(classroom.seatingConfig).flat().filter(c => c === "desk").length} desks`
                      : "No layout configured"}
                  </Text>
                  <HStack spacing={2} w="full">
                    <Button
                      flex={1}
                      colorScheme="blue"
                      onClick={() => navigate(`/classrooms/${currentUser.username}/${classroom.classroomId}`)}
                    >
                      Edit Layout
                    </Button>
                    <IconButton
                      icon={<DeleteIcon />}
                      colorScheme="red"
                      variant="outline"
                      onClick={() => handleDeleteClassroom(classroom.classroomId)}
                      aria-label="Delete classroom"
                    />
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Classroom</ModalHeader>
          <ModalBody>
            <Input
              placeholder="Classroom name (e.g., Room 101)"
              value={newClassroomName}
              onChange={(e) => setNewClassroomName(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleCreateClassroom}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}

export default ClassroomList;
```

**Step 2: Commit**

```bash
git add frontend/src/classroom/ClassroomList.jsx
git commit -m "feat(ui): add ClassroomList component for multiple classrooms

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 11: Create Student Constraints Component

**Files:**
- Create: `frontend/src/students/StudentConstraints.jsx`

**Step 1: Create the component**

```jsx
import { useState, useEffect, useContext } from "react";
import SeatingApi from "../api";
import UserContext from "../auth/UserContext";
import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  Select,
  HStack,
  VStack,
  Text,
  Badge,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";

function StudentConstraints({ periodId, students }) {
  const { currentUser } = useContext(UserContext);
  const toast = useToast();

  const [constraints, setConstraints] = useState([]);
  const [studentId1, setStudentId1] = useState("");
  const [studentId2, setStudentId2] = useState("");
  const [constraintType, setConstraintType] = useState("separate");

  useEffect(() => {
    async function fetchConstraints() {
      try {
        const data = await SeatingApi.getConstraints(currentUser.username, periodId);
        setConstraints(data);
      } catch (err) {
        console.error("Failed to fetch constraints:", err);
      }
    }
    if (periodId) fetchConstraints();
  }, [currentUser.username, periodId]);

  const handleAddConstraint = async () => {
    if (!studentId1 || !studentId2) {
      toast({ title: "Select two students", status: "warning" });
      return;
    }
    if (studentId1 === studentId2) {
      toast({ title: "Select different students", status: "warning" });
      return;
    }

    try {
      const constraint = await SeatingApi.createConstraint(
        currentUser.username,
        periodId,
        {
          studentId1: parseInt(studentId1),
          studentId2: parseInt(studentId2),
          constraintType
        }
      );

      // Enrich with student names for display
      const s1 = students.find(s => s.studentId === parseInt(studentId1));
      const s2 = students.find(s => s.studentId === parseInt(studentId2));
      constraint.studentName1 = s1?.name;
      constraint.studentName2 = s2?.name;

      setConstraints([...constraints, constraint]);
      setStudentId1("");
      setStudentId2("");
      toast({ title: "Constraint added", status: "success" });
    } catch (err) {
      toast({ title: "Failed to add constraint", status: "error" });
    }
  };

  const handleDeleteConstraint = async (constraintId) => {
    try {
      await SeatingApi.deleteConstraint(currentUser.username, periodId, constraintId);
      setConstraints(constraints.filter(c => c.constraintId !== constraintId));
      toast({ title: "Constraint removed", status: "success" });
    } catch (err) {
      toast({ title: "Failed to remove constraint", status: "error" });
    }
  };

  return (
    <Card>
      <CardBody>
        <Heading size="md" mb={4}>Student Seating Rules</Heading>

        <VStack spacing={4} align="stretch">
          <HStack spacing={2}>
            <Select
              placeholder="Student 1"
              value={studentId1}
              onChange={(e) => setStudentId1(e.target.value)}
            >
              {students.map(s => (
                <option key={s.studentId} value={s.studentId}>{s.name}</option>
              ))}
            </Select>

            <Select
              value={constraintType}
              onChange={(e) => setConstraintType(e.target.value)}
              w="150px"
            >
              <option value="separate">Keep Apart</option>
              <option value="pair">Seat Together</option>
            </Select>

            <Select
              placeholder="Student 2"
              value={studentId2}
              onChange={(e) => setStudentId2(e.target.value)}
            >
              {students.map(s => (
                <option key={s.studentId} value={s.studentId}>{s.name}</option>
              ))}
            </Select>

            <Button colorScheme="blue" onClick={handleAddConstraint}>
              Add
            </Button>
          </HStack>

          {constraints.length > 0 && (
            <Box>
              <Text fontWeight="semibold" mb={2}>Active Rules:</Text>
              <VStack spacing={2} align="stretch">
                {constraints.map(c => (
                  <HStack
                    key={c.constraintId}
                    p={2}
                    bg="gray.50"
                    borderRadius="md"
                    justify="space-between"
                  >
                    <HStack>
                      <Text>{c.studentName1}</Text>
                      <Badge colorScheme={c.constraintType === 'separate' ? 'red' : 'green'}>
                        {c.constraintType === 'separate' ? 'apart from' : 'with'}
                      </Badge>
                      <Text>{c.studentName2}</Text>
                    </HStack>
                    <IconButton
                      icon={<DeleteIcon />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleDeleteConstraint(c.constraintId)}
                      aria-label="Remove constraint"
                    />
                  </HStack>
                ))}
              </VStack>
            </Box>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
}

export default StudentConstraints;
```

**Step 2: Commit**

```bash
git add frontend/src/students/StudentConstraints.jsx
git commit -m "feat(ui): add StudentConstraints component for separation/pairing rules

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 12: Create Seating Chart History Component

**Files:**
- Create: `frontend/src/seating/SeatingChartHistory.jsx`

**Step 1: Create the component**

```jsx
import { useState, useEffect, useContext } from "react";
import SeatingApi from "../api";
import UserContext from "../auth/UserContext";
import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  SimpleGrid,
  Text,
  Badge,
  HStack,
  VStack,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { CopyIcon, DeleteIcon, ViewIcon } from "@chakra-ui/icons";

function SeatingChartHistory({ classroomId, periodId, onSelectChart }) {
  const { currentUser } = useContext(UserContext);
  const toast = useToast();

  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCharts() {
      try {
        const data = await SeatingApi.getSeatingCharts(
          currentUser.username,
          classroomId
        );
        // Filter by periodId if provided
        const filtered = periodId
          ? data.filter(c => c.periodId === parseInt(periodId))
          : data;
        setCharts(filtered);
      } catch (err) {
        console.error("Failed to fetch charts:", err);
      } finally {
        setLoading(false);
      }
    }
    if (classroomId) fetchCharts();
  }, [currentUser.username, classroomId, periodId]);

  const handleDuplicate = async (chart) => {
    try {
      const newChart = await SeatingApi.duplicateSeatingChart(
        currentUser.username,
        classroomId,
        chart.seatingChartId,
        `Copy of ${chart.label || 'Chart'}`
      );
      setCharts([newChart, ...charts]);
      toast({ title: "Chart duplicated", status: "success" });
    } catch (err) {
      toast({ title: "Failed to duplicate", status: "error" });
    }
  };

  const handleDelete = async (seatingChartId) => {
    if (!window.confirm("Delete this seating chart?")) return;

    try {
      await SeatingApi.deleteSeatingChart(
        currentUser.username,
        classroomId,
        seatingChartId
      );
      setCharts(charts.filter(c => c.seatingChartId !== seatingChartId));
      toast({ title: "Chart deleted", status: "success" });
    } catch (err) {
      toast({ title: "Failed to delete", status: "error" });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  };

  if (loading) return <Text>Loading charts...</Text>;

  return (
    <Box>
      <Heading size="md" mb={4}>Seating Chart History</Heading>

      {charts.length === 0 ? (
        <Text color="gray.500">No saved charts yet. Generate a chart to get started.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {charts.map(chart => (
            <Card key={chart.seatingChartId} variant="outline">
              <CardBody>
                <VStack align="start" spacing={2}>
                  <HStack justify="space-between" w="full">
                    <Heading size="sm">
                      {chart.label || `Chart ${chart.number}`}
                    </Heading>
                    <Badge colorScheme="gray">
                      Period {chart.number}
                    </Badge>
                  </HStack>

                  <Text fontSize="sm" color="gray.500">
                    {formatDate(chart.createdAt)}
                  </Text>

                  <HStack spacing={2} pt={2}>
                    <Button
                      size="sm"
                      leftIcon={<ViewIcon />}
                      onClick={() => onSelectChart?.(chart)}
                    >
                      View
                    </Button>
                    <IconButton
                      size="sm"
                      icon={<CopyIcon />}
                      onClick={() => handleDuplicate(chart)}
                      aria-label="Duplicate"
                    />
                    <IconButton
                      size="sm"
                      icon={<DeleteIcon />}
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => handleDelete(chart.seatingChartId)}
                      aria-label="Delete"
                    />
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}

export default SeatingChartHistory;
```

**Step 2: Commit**

```bash
git add frontend/src/seating/SeatingChartHistory.jsx
git commit -m "feat(ui): add SeatingChartHistory component

- Display saved charts with timestamps
- Duplicate and delete actions
- Filter by period

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 13: Update Routes for New Components

**Files:**
- Modify: `frontend/src/routes/RouteList.jsx`

**Step 1: Import new components and add routes**

Add imports:

```javascript
import ClassroomList from "../classroom/ClassroomList";
```

Add route for classroom list:

```javascript
<Route path="/classrooms/:username" element={<ClassroomList />} />
<Route path="/classrooms/:username/:classroomId" element={<ClassroomForm />} />
```

**Step 2: Commit**

```bash
git add frontend/src/routes/RouteList.jsx
git commit -m "feat(ui): add routes for ClassroomList and update classroom routing

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 14: Run Migrations and Test

**Step 1: Run migrations**

Run: `cd backend && npx knex migrate:latest`
Expected: Migrations complete successfully

**Step 2: Start the application**

Run: `npm run dev`
Expected: Both frontend and backend start without errors

**Step 3: Manual testing checklist**

- [ ] Can create multiple classrooms with different names
- [ ] Can view list of all classrooms
- [ ] Can add separation/pairing constraints between students
- [ ] Seating charts save with timestamps
- [ ] Can duplicate and delete seating charts
- [ ] Can view chart history

**Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: address issues from Phase 3 testing

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Summary

Phase 3 adds the following features:

1. **Multiple Classrooms**
   - New `name` column on classrooms table
   - ClassroomList component for managing multiple classrooms
   - Updated API and routes

2. **Student Constraints**
   - New `student_constraints` table
   - StudentConstraint model with CRUD operations
   - StudentConstraints component for UI
   - Constraints API routes

3. **Seating Chart History**
   - Added `label`, `period_id`, `created_at` to seating_charts
   - SeatingChartHistory component
   - Duplicate chart functionality

**Note:** Phase 3 does not include bulk student management or advanced seating algorithms. These can be added in a future phase if needed.
