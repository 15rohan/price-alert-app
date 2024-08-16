const sequelize = require('../config/db')
const User = require('./user')
const Alert = require('./alert')

Alert.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
})

User.hasMany(Alert, {
    foreignKey: 'userId',
    as: 'alerts'
})

module.exports = {
    sequelize,
    User,
    Alert
}