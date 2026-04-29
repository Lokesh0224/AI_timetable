const express = require('express');
const router = express.Router();
const controller = require('../controllers/programController');

router.get('/', controller.getAll);
router.get('/department/:deptId', controller.getByDepartment);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
