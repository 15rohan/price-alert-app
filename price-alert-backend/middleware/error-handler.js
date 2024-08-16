const { StatusCodes } = require('http-status-codes')

const errorHandlerMiddleware = (err, req, res, next) => {
    let customError = {
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        msg: err.message || "Something went wrong, try again later"
    }

    if (err.name === 'SequelizeValidationError') {
        customError.msg = err.errors.map((item) => item.message).join(', ');
        customError.statusCode = StatusCodes.BAD_REQUEST;
    }

    if (err.name === 'SequelizeUniqueConstraintError') {
        customError.msg = `Duplicate value for ${Object.keys(err.fields)} field. Please provide another value.`;
        customError.statusCode = StatusCodes.BAD_REQUEST;
    }

    return res.status(customError.statusCode).json({ msg: customError.msg })
}

module.exports = errorHandlerMiddleware