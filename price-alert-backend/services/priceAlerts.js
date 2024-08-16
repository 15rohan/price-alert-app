const { sequelize, Alert, User } = require('../models/index')
const { sendEmail } = require('./email')

const processPriceUpdate = async (data) => {
    const message = JSON.parse(data)
    const symbol = message.data.s.toLowerCase()
    const price = parseFloat(message.data.p).toFixed(1)

    let transaction;
    try {
        transaction = await sequelize.transaction()

        const alerts = await Alert.findAll({
            where: {
                cryptocurrency: symbol,
                status: 'created',
            },
            lock: true,   //Lock rows
            transaction
        })

        for (const alert of alerts) {
            const alertTargetPrice = parseFloat(alert.targetPrice).toFixed(1)
            let send = false

            if ((alert.bound === 'upper' && parseFloat(price) >= parseFloat(alertTargetPrice)) || (alert.bound === 'lower' && parseFloat(price) <= parseFloat(alertTargetPrice))) {
                send = true
            }

            if (send) {
                await alert.update({ status: 'triggered' }, { transaction })    //Update alert status
                console.log(`Alert triggered for ${symbol}: Price reached ${price}`)

                const user = await User.findByPk(alert.userId, { transaction })
                if (user) {
                    const subject = `Price Alert Triggered: ${symbol}`
                    const text = `The price of ${symbol} has ${alert.bound === 'upper' ? 'risen above' : 'dropped below'} your target of ${alert.targetPrice}. Current price: ${price}`
                    await sendEmail(user.email, subject, text)
                    console.log(`Email sent to ${user.email}`)
                }
            }
        }

        await transaction.commit()
    } catch (error) {
        if (transaction) await transaction.rollback()
        console.error('Error processing price update:', error)
    }
}

module.exports = processPriceUpdate