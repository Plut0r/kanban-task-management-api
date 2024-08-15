const express = require('express')
const router = express.Router()

const { getAllBoards, updateBoard, deleteBoard, createBoard } = require('../controllers/boards')

router.route('/').get(getAllBoards).post(createBoard)
router.route('/:id').patch(updateBoard).delete(deleteBoard)

module.exports = router