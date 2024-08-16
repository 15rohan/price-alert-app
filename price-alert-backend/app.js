require('dotenv').config()
require('express-async-errors')

const express = require('express')
const app = express()

const helmet = require('helmet')
const cors = require('cors')
const rateLimiter = require('express-rate-limit')
const sequelize = require('./config/db')
const authMiddleware = require('./middleware/authentication')

const binanceService = require('./services/binance')
binanceService.initializeWebSocket(); // Initialize WebSocket connection to Binance

//routers
const authRouter = require('./routes/auth')
const alertsRouter = require('./routes/alert')

//error handlers
const notFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')

app.use(
    rateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
    })
)
app.use(express.json())
app.use(helmet())
app.use(cors())

//routes
app.use('/api/v1/auth',authRouter)
app.use('/api/v1/alerts',authMiddleware,alertsRouter)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 8080

const start = async () => {
    try {
        await sequelize.authenticate()
        console.log('Connection to database successful')

        await sequelize.sync()

        app.listen(port, () => {
            console.log(`Server is listening on port ${port}...`)
        })
    } catch (error) {
        console.log('Unable to connect to database',error)
    }
}

start()