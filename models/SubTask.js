const mongoose = require('mongoose');

const SubTaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide subtask title']
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide user'],
    },
    // task: {
    //     type: mongoose.Types.ObjectId,
    //     ref: 'Task',
    //     required: [true, 'Please provide parent task']
    // }
})

module.exports = mongoose.model('SubTask', SubTaskSchema)