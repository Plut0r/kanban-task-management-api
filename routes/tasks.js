const express = require('express')
const router = express.Router()

const testUser = require('../middleware/test-user');

const {
    updateTask,
    updateTaskStatus,
    createTask,
    deleteTask,
} = require('../controllers/tasks')

router.route('/:id').patch(testUser, updateTask).delete(testUser, deleteTask)
router.patch('/:id/status', testUser, updateTaskStatus);
// router.route('/subtasks').post(updateSubTasksStatus).delete(deleteSubTask)
router.route('/').post(testUser, createTask)

module.exports = router