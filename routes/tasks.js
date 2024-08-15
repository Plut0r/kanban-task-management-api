const express = require('express')
const router = express.Router()

const {
    updateTask,
    updateTaskStatus,
    createTask,
    deleteTask,
} = require('../controllers/tasks')

router.route('/:id').patch(updateTask).delete(deleteTask)
router.patch('/:id/status', updateTaskStatus);
// router.route('/subtasks').post(updateSubTasksStatus).delete(deleteSubTask)
router.route('/').post(createTask)

module.exports = router