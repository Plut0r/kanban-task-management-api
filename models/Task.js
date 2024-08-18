const mongoose = require('mongoose');
const Board = require('./Board')

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide task title'],
        maxlength: 80,
        minlength: 3
    },
    description: {
        type: String,
        default: ""
    },
    columnId: {
        type: mongoose.Types.ObjectId,
        ref: 'Column',
        required: [true, 'Please provide column']
    },
    // status: {
    //     type: String,
    //     required: [true, 'Please provide task status'],
    //     validate: {
    //         validator: async (value, done) => {
    //             try {
    //                 const board = await Board.findById(this.createdBy)
    //                 const allowedStatuses = board.columns.map(col => col.name);
    //                 return allowedStatuses.includes(value);
    //             } catch (error) {
    //                 return done(error);
    //             }
    //         },
    //         message: props => `${props.value} is not a valid status for this task.`
    //     }
    // },
    // statusId: {
    //     type: String,
    //     required: [true, 'Please provide task status id'],
    //     validate: {
    //         validator: async (value, done) => {
    //             try {
    //                 const board = await Board.findById(this.createdBy);
    //                 const column = board.columns.find(col => col._id.toString() === value.toString());
    //                 return !!column;
    //             } catch (error) {
    //                 return done(error);
    //             }
    //         },
    //         message: props => `${props.value} is not a valid status id for this task.`
    //     }
    // },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide user'],
    },
    subtasks: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'SubTask'
        }
    ]
})

module.exports = mongoose.model('Task', TaskSchema)
