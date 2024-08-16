const User = require('../models/user')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError } = require('../errors')
const { addToBlacklist } = require('../utils/blacklist')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const register = async (req, res) => {
    const { username, email, password } = req.body;

    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = await User.create({ username, email, password: hashedPassword })
    res.status(StatusCodes.CREATED).json({ msg: "User created successfully", user })  
}

const login = async (req, res) => {
    const {email,password} = req.body
    if(!email || !password){
        throw new BadRequestError('Please enter email and password');
    }

    const user = await User.findOne({where:{email}})
    if(!user){
        throw new UnauthenticatedError('Invalid Credentials')
    }

    const correctPass = await bcrypt.compare(password,user.password)
    if(!correctPass){
        throw new UnauthenticatedError('Invalid Password')
    }

    const token = jwt.sign({userId: user.id, username: user.username}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_LIFETIME})
    res.status(StatusCodes.OK).json({ token })
}

const logout = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]
    await addToBlacklist(token)
    res.status(StatusCodes.OK).json({ message: 'Logged out successfully' })
}

module.exports = {
    login,
    register,
    logout
}