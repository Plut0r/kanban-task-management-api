const { BadRequestError, NotFoundError } = require('../errors')
const { StatusCodes } = require('http-status-codes')
const Task = require('../models/Task');
const Column = require('../models/Column')
const SubTask = require('../models/SubTask');

const createTask = async (req, res) => {
    const { subtasks } = req.body;
    req.body.createdBy = req.user.userId

    if (!Array.isArray(subtasks) || subtasks.every(item => typeof item !== 'object')) {
        throw new BadRequestError('Please provide subtasks as an array of object')
    }

    if (subtasks) {
        const createdSubtasks = await Promise.all(subtasks.map(async subtask => {
            const newSubtask = new SubTask({ title: subtask.title, createdBy: req.user.userId });
            return await newSubtask.save(); // Save each column and return
        }));
        const task = await Task.create({
            ...req.body,
            subtasks: createdSubtasks.map(subtask => subtask._id)
        })
        await Column.findByIdAndUpdate(task.columnId, { $push: { tasks: task._id } });
        res.status(StatusCodes.CREATED).json({ task })
    } else {
        const task = await Task.create(req.body)
        await Column.findByIdAndUpdate(task.columnId, { $push: { tasks: task._id } });
        res.status(StatusCodes.CREATED).json({ task })
    }
}

const updateTask = async (req, res) => {
    const { user: { userId }, params: { id: taskId }, body: { title, description, subtasks, columnId } } = req;

    if (!columnId || !title) {
        throw new BadRequestError('Please provide column id and title');
    }

    if (!Array.isArray(subtasks)) {
        throw new BadRequestError('Please provide subtasks as an array');
    }

    if (subtasks.length !== 0 && subtasks.every(item => typeof item !== 'object')) {
        throw new BadRequestError('Please provide subtasks as an array of objects')
    }

    const task = await Task.findOne({ _id: taskId, createdBy: userId }).populate('subtasks');
    if (!task) {
        throw new NotFoundError(`No task with id ${taskId}`);
    }

    const oldColumnId = task.columnId;

    // Update task details
    task.title = title;
    task.columnId = columnId;
    if (description) {
        task.description = description;
    }

    // Update subtasks
    const subtaskIds = subtasks.map(subtask => subtask.id).filter(id => id);
    const subtasksToDelete = task.subtasks.filter(subtask => !subtaskIds.includes(subtask._id.toString()));

    // Delete subtasks that are not in the updated list
    await Promise.all(subtasksToDelete.map(subtask => SubTask.deleteOne({ _id: subtask._id })));

    // Update existing and add new subtasks
    const updatedSubtasks = await Promise.all(subtasks.map(async (subtaskData) => {
        if (subtaskData.id) {
            const subtask = task.subtasks.find(sub => sub._id.toString() === subtaskData.id);
            if (!subtask) {
                throw new NotFoundError(`Subtask with id ${subtaskData.id} not found on task`);
            }
            subtask.title = subtaskData.title;
            if (subtaskData.isCompleted !== undefined) {
                subtask.isCompleted = subtaskData.isCompleted;
            }
            await subtask.save();
            return subtask;
        } else {
            const newSubtask = new SubTask({
                title: subtaskData.title,
                ...(subtaskData.isCompleted && { isCompleted: subtaskData.isCompleted }),
                createdBy: userId,
            });
            await newSubtask.save();
            return newSubtask;
        }
    }));

    task.subtasks = updatedSubtasks;
    await task.save();

    // Update columns only if columnId has changed
    if (oldColumnId.toString() !== columnId) {
        await Column.updateOne({ _id: oldColumnId }, { $pull: { tasks: taskId } });
        await Column.updateOne({ _id: columnId }, { $push: { tasks: taskId } });
    }

    res.status(StatusCodes.OK).json({ task });
};


// const updateSubTasksStatus = async (req, res) => {
//     const { user: { userId }, body: { subtasks } } = req;
//     if (!Array.isArray(subtasks) || subtasks.every(item => typeof item !== 'object')) {
//         throw new BadRequestError('Please provide subtasks as an array of objects')
//     }

//     const updatedSubtasks = await Promise.all(subtasks.map(async sub => {
//         const subtask = await SubTask.findOne({ _id: sub.id, createdBy: userId })
//         if (!subtask) {
//             throw new NotFoundError(`No subtask with id ${sub.id}`)
//         }
//         subtask.isCompleted = sub.isCompleted
//         return subtask.save();
//     }));

//     res.status(StatusCodes.OK).json({ subtasks: updatedSubtasks })
// }

const updateTaskStatus = async (req, res) => {
    const { user: { userId }, params: { id: taskId }, body: { columnId } } = req;

    if (!columnId) {
        throw new BadRequestError('Please provide column id');
    }

    // Find the task to get the old columnId
    const task = await Task.findOne({ _id: taskId, createdBy: userId });
    if (!task) {
        throw new NotFoundError(`No task with id ${taskId}`);
    }

    const oldColumnId = task.columnId;

    // Update the task's columnId
    task.columnId = columnId;
    await task.save();

    // Update columns only if columnId has changed
    if (oldColumnId.toString() !== columnId) {
        await Column.updateOne({ _id: oldColumnId }, { $pull: { tasks: taskId } });
        await Column.updateOne({ _id: columnId }, { $push: { tasks: taskId } });
    }

    res.status(StatusCodes.OK).json({ task });
};

const deleteTask = async (req, res) => {
    const {
        user: { userId },
        params: { id: taskId },
    } = req

    const task = await Task.findByIdAndDelete({
        _id: taskId,
        createdBy: userId,
    })
    if (!task) {
        throw new NotFoundError(`No task with id ${taskId}`)
    }

    // Delete all subtasks associated with the task
    await SubTask.deleteMany({ _id: { $in: task.subtasks } });

    // Remove the task ID from the column's tasks array
    await Column.updateOne(
        { _id: task.columnId },
        { $pull: { tasks: taskId } }
    );

    res.status(StatusCodes.OK).json({ message: 'success', data: null })
}

// const deleteSubTask = async (req, res) => {
//     const {
//         user: { userId },
//         params: { id: subtaskId },
//     } = req

//     const subtask = await SubTask.findByIdAndDelete({
//         _id: subtaskId,
//         createdBy: userId,
//     })
//     if (!subtask) {
//         throw new NotFoundError(`No subtask with id ${subtaskId}`)
//     }

//      // Remove the subtask ID from the task's subtasks array
//      await Task.updateOne(
//         { subtasks: subtaskId },
//         { $pull: { subtasks: subtaskId } }
//     );

//     res.status(StatusCodes.OK).json({ message: 'success', data: null })
// }

module.exports = {
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask
}