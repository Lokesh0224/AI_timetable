const express = require('express');
const router = express.Router();
const { 
  getTimetable, getTimetableByYear, getTimetableByFaculty, getTimetableByDay, 
  generate, clearTimetable, exportFullCSV, exportYearCSV, getStats 
} = require('../controllers/timetableController');

router.get('/', getTimetable);
router.post('/generate', generate);
router.delete('/clear', clearTimetable);
router.get('/stats', getStats);
router.get('/export/csv', exportFullCSV);
router.get('/export/year/:year', exportYearCSV);
router.get('/year/:year', getTimetableByYear);
router.get('/faculty/:id', getTimetableByFaculty);
router.get('/day/:day', getTimetableByDay);

module.exports = router;
