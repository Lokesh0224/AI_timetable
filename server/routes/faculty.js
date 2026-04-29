const express = require('express');
const router = express.Router();
const { getFaculty, getFacultyById, addFaculty, updateFaculty, deleteFaculty, getFacultyTimetable } = require('../controllers/facultyController');

router.route('/').get(getFaculty).post(addFaculty);
router.route('/:id').get(getFacultyById).put(updateFaculty).delete(deleteFaculty);
router.route('/:id/timetable').get(getFacultyTimetable);

module.exports = router;
