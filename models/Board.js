const mongoose = require('mongoose')
const Column = require('./Column')
const { BadRequestError } = require('../errors')

const BoardSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide board name'],
        maxlength: 50,
        minlength: 3
    },
    columns: {
        type: [mongoose.Types.ObjectId],
        ref: 'Column', // Reference Column model
        required: [true, 'Please provide column references']
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide user'],
    },
})

BoardSchema.pre('save', async function (next) {
    const uniqueNames = new Set(this.columns); // Check for duplicates using Set
    if (uniqueNames.size !== this.columns.length) {
        throw new BadRequestError('Duplicate column names found in board')
    }
})

module.exports = mongoose.model('Board', BoardSchema)