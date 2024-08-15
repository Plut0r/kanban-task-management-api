const jwt = require('jsonwebtoken')
const { UnauthenticatedError } = require('../errors')

const auth = async (req, res, next) => {
    // check header 
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer')) {
        throw new UnauthenticatedError('Authentication invalid')
    }
    const token = authHeader.split(' ')[1]
    // console.log(token)
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        // attach the user to the tasks routes
        const testUser = payload.userId === "66bb6f2d0eaa81697c489bb1"
        req.user = { userId: payload.userId, name: payload.name, testUser }
        next()
    } catch (error) {
        throw new UnauthenticatedError('Authentication invalid..')
    }
}

module.exports = auth