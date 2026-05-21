/**
 * Tutor Routes
 * Maps paths to the tutorController actions.
 */

const express = require('express');
const router = express.Router();
const tutorController = require('../controllers/tutorController');

// Route for fetching searched & filtered tutors list
router.get('/tutors', tutorController.getTutors);

module.exports = router;
