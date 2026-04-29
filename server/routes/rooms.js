const express = require('express');
const router = express.Router();
const { getRooms, addRoom, updateRoom, deleteRoom } = require('../controllers/roomController');

router.route('/').get(getRooms).post(addRoom);
router.route('/:id').put(updateRoom).delete(deleteRoom);

module.exports = router;
