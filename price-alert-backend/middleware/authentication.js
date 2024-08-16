const { UnauthenticatedError } = require('../errors')
const { isTokenBlacklisted } = require('../utils/blacklist')
const jwt = require('jsonwebtoken')

const auth = async (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthenticatedError('Authentication Invalid')
    }

    const token = authHeader.split(' ')[1]

    try {
        const blacklisted = await isTokenBlacklisted(token)
        if (blacklisted) {
            throw new UnauthenticatedError('Authentication Invalid')
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.user = { userId: payload.userId }
        next()
    } catch (error) {
        throw new UnauthenticatedError('Authentication Invalid')
    }
}

module.exports = auth