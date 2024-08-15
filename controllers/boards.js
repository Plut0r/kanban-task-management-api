const { BadRequestError, NotFoundError } = require('../errors')
const { StatusCodes } = require('http-status-codes')
const Board = require('../models/Board')
const Column = require('../models/Column')
const Task = require("../models/Task")
const SubTask = require('../models/SubTask')

const createBoard = async (req, res) => {
    const { name, columns } = req.body;
    if (!name || !columns) {
        throw new BadRequestError('Please provide name and columns')
    }
    if (!Array.isArray(columns) || columns.every(item => typeof item !== 'string')) {
        throw new BadRequestError('Please provide columns as an array of strings')
    }

    const createdColumns = await Promise.all(columns.map(async colName => {
        const newColumn = new Column({ name: colName, createdBy: req.user.userId });
        return await newColumn.save(); // Save each column and return
    }));

    const board = await Board.create({
        name,
        createdBy: req.user.userId,
        columns: createdColumns.map(col => col._id)
    })

    res.status(StatusCodes.CREATED).json({
        boards: [
            board
        ]
    })
}

const getAllBoards = async (req, res) => {
    const boards = await Board.find({ createdBy: req.user.userId }).populate({
        path: 'columns',
        select: '-createdBy -__v',
        populate: {
            path: 'tasks',
            select: '-createdBy -__v',
            populate: {
                path: 'subtasks',
                select: '-createdBy -__v'
            }
        }
    }).select('-createdBy -__v');
    res.status(StatusCodes.OK).json({
        boards
    })
}

const updateBoard = async (req, res) => {
    const { user: { userId }, params: { id: boardId }, body: { name, columns } } = req;
    if (!name || !columns) {
        throw new BadRequestError('Please provide name and columns')
    }
    if (!Array.isArray(columns) || columns.every(item => typeof item !== 'object')) {
        throw new BadRequestError('Please provide columns as an array of objects')
    }

    const board = await Board.findOne({ _id: boardId, createdBy: userId }).populate('columns')
    if (!board) {
        throw new NotFoundError(`No board with id ${boardId}`)
    }

    board.name = name;
    await board.save()

    for (let i = 0; i < columns.length; i++) {
        if (columns[i].id) {
            const column = board.columns.find(col => col._id.toString() === columns[i].id)
            // console.log(column)
            if (!column) {
                throw new NotFoundError(`Column with id ${columns[i].id} not found on the board`)
            }
            column.name = columns[i].name;
            await column.save()
        } else {
            // console.log(true)
            const newColumn = new Column({
                name: columns[i].name,
                createdBy: req.user.userId,
            });
            await newColumn.save();
            board.columns.push(newColumn);
        }
    }

    await board.save()

    res.status(StatusCodes.OK).json({
        boards: [
            board
        ]
    })
}

const deleteBoard = async (req, res) => {
    const { user: { userId }, params: { id: boardId } } = req;
    const board = await Board.findOne({ _id: boardId, createdBy: userId });
    if (!board) {
        throw new NotFoundError(`No board with id ${boardId}`);
    }

    for (const _id of board.columns) {
        const column = await Column.findById(_id);
        if (column) {
            for (const _id of column.tasks) {
                await SubTask.deleteMany({ _id: { $in: (await Task.findById(_id)).subtasks } });
                await Task.findByIdAndDelete(_id);
            }
            await Column.findByIdAndDelete(_id);
        }
    }
    await Board.findByIdAndDelete(boardId);
    res.status(StatusCodes.OK).json({ board: null, status: 'success' });
};


// const deleteBoard = async (req, res) => {
//     const { user: { userId }, params: { id: boardId } } = req;
//     const board = await Board.findOne({ _id: boardId, createdBy: userId })
//     if (!board) {
//         throw new NotFoundError(`No board with id ${boardId}`)
//     }

//     for (const _id of board.columns) {
//         const column = await Column.findById(_id)
//         await SubTask.deleteMany({ _id: { $in: column.tasks.subTasks } })
//         await Task.deleteMany({ _id: { $in: column.tasks } })
//         await Column.findByIdAndDelete(_id)
//     }
//     await Board.findByIdAndDelete(boardId)
//     res.status(StatusCodes.OK).json({ board: null, status: 'success' })
// }

module.exports = {
    createBoard,
    getAllBoards,
    updateBoard,
    deleteBoard
}