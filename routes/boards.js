const express = require('express')
const router = express.Router()

const testUser = require('../middleware/test-user');

const { getAllBoards, updateBoard, deleteBoard, createBoard } = require('../controllers/boards')

router.route('/').get(getAllBoards).post(testUser, createBoard)
router.route('/:id').patch(testUser, updateBoard).delete(testUser, deleteBoard)

module.exports = router