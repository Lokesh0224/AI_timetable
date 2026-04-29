const express = require('express');
const router = express.Router();
const { getSubjects, getSubjectsByYear, addSubject, addSubjectBulk, updateSubject, deleteSubject } = require('../controllers/subjectController');

router.route('/').get(getSubjects).post(addSubject);
router.route('/bulk').post(addSubjectBulk);
router.route('/:id').put(updateSubject).delete(deleteSubject);
router.route('/year/:year').get(getSubjectsByYear);

module.exports = router;
