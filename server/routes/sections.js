const express = require('express');
const router = express.Router();
const controller = require('../controllers/sectionController');

router.get('/', controller.getAll);
router.get('/program/:programId', controller.getByProgram);
router.get('/program/:programId/year/:year', controller.getByProgramAndYear);
router.post('/', controller.create);
router.post('/bulk', controller.createBulk);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
