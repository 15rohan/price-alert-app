const WebSocket = require('ws')

const symbols = require('../utils/symbols')
const processPriceUpdate = require('./priceAlerts')
const streamType = 'aggTrade'

const wsUrl = `wss://stream.binance.com:9443/stream?streams=${symbols.map(symbol => `${symbol}@${streamType}`).join('/')}`

let binanceWs = null

const initializeWebSocket = () => {
    binanceWs = new WebSocket(wsUrl)

    binanceWs.on('open', () => {
        console.log('Connected to Binance WebSocket')
    })

    binanceWs.on('message', async (data) => {
        await processPriceUpdate(data)
        // const message = JSON.parse(data)
        // console.log(`Price for ${message.data.s} updated to ${message.data.p}`)
    })

    binanceWs.on('error', (error) => {
        console.error(`Binance WebSocket Error: ${error}`)
    })

    binanceWs.on('close', () => {
        console.log('Binance WebSocket Closed')
    })
}

module.exports = {
    initializeWebSocket
}
