require('dotenv').config()

const mockData = require('./mock-data.json')

const Board = require('./models/Board')
const connectDB = require('./db/connect')

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        await Board.create(mockData)
        console.log('Success!!')
        process.exit(0)
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

start()