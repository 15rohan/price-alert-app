const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')
const Alert = require('../models/alert')
const redisClient = require('../config/redis')

const createAlert = async (req, res) => {
    const { bound, cryptocurrency, targetPrice } = req.body
    const { userId } = req.user

    if (!cryptocurrency || !targetPrice) {
        throw new BadRequestError('Please provide cryptocurrency and target price for your alert')
    }
    const alert = await Alert.create({ userId, bound, cryptocurrency, targetPrice })

    //Clear cache on create alert
    const cacheKeyPattern = `alerts:${req.user.id}:*`
    const keys = await redisClient.keys(cacheKeyPattern)
    if (keys.length > 0) {
        await redisClient.del(keys)
    }

    res.status(StatusCodes.CREATED).json({ msg: 'Alert created', alert })
}

const deleteAlert = async (req, res) => {
    const { user: { userId }, params: { id: alertId } } = req
    const alert = await Alert.findOne({ where: { id: alertId, userId } })

    if (!alert) {
        throw new NotFoundError(`No alert with id ${alertId}`)
    }
    await alert.destroy()

    //Clear cache on delete alert
    const cacheKeyPattern = `alerts:${req.user.id}:*`
    const keys = await redisClient.keys(cacheKeyPattern)
    if (keys.length > 0) {
        await redisClient.del(keys)
    }
    
    res.status(StatusCodes.OK).json({ msg: 'Alert deleted' })
}

const fetchAlerts = async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query

    const pageNumber = +page
    const pageSize = +limit

    if (isNaN(page) || page < 1) {
        throw new BadRequestError('Invalid page number')
    }
    if (isNaN(limit) || limit < 1) {
        throw new BadRequestError('Invalid limit')
    }

    const cacheKey = `alerts:${req.user.id}:${status || 'all'}:page=${pageNumber}:limit=${pageSize}`
    const cachedData = await redisClient.get(cacheKey)
    if (cachedData) {
        const parsedData = JSON.parse(cachedData)
        return res.status(200).json(parsedData)
    }

    const filter = {
        where: {
            userId: req.user.userId
        },
        offset: (pageNumber - 1) * pageSize,  //rows to skip or starting point
        limit: pageSize  //number of alerts on each page
    }

    if (status) {
        filter.where.status = status
    }

    const alerts = await Alert.findAndCountAll(filter)
    const responseAlerts = {
        alerts: alerts.rows,
        total: alerts.count,
        currentPage: pageNumber,
        totalPages: Math.ceil(alerts.count / pageSize)
    }
    await redisClient.set(cacheKey, JSON.stringify(responseAlerts), 'EX', 3600)
    res.status(StatusCodes.OK).json(responseAlerts)
}

module.exports = {
    createAlert,
    deleteAlert,
    fetchAlerts
}