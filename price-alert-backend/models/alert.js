const { DataTypes, UUIDV4 } = require('sequelize')
const sequelize = require('../config/db')
const User = require('./user')

const Alert = sequelize.define('Alert', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    cryptocurrency: {
        type: DataTypes.STRING,
        allowNull: false
    },
    targetPrice: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    bound: {
        type: DataTypes.ENUM('upper', 'lower'),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('created', 'triggered'),
        defaultValue: 'created'
    }
}, {
    tableName: 'alerts',
    timestamps: true
})

module.exports = Alert