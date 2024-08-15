const mongoose = require('mongoose');

const ColumnSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide column name']
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide user'],
    },
    tasks: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'Task'
        }
    ]
})

module.exports = mongoose.model('Column', ColumnSchema)