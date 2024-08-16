const redisClient = require('../config/redis')

const tokenExpiryTime = 24 * 60 * 60

const isTokenBlacklisted = async (token) => {
    const blacklisted = await redisClient.get(`blacklist:${token}`)
    return !!blacklisted
}

const addToBlacklist = async (token) => {
    await redisClient.set(`blacklist:${token}`, true, 'EX', tokenExpiryTime)
}

module.exports = {
    isTokenBlacklisted,
    addToBlacklist
}