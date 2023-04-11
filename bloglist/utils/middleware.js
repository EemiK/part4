const logger = require('./logger')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const requestLogger = (request, response, next) => {
    logger.info('Method:', request.method)
    logger.info('Path:', request.path)
    logger.info('Body:', request.body)
    logger.info('---')
    next()
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (request, response, next) => {
    logger.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'mallformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    } else if (error.name === 'JsonWebTokenError') {
        return response.status(400).json({
            error: 'invalid token'
        })
    } else if (error.name === 'TokenExpiredError') {
        return response.status(401).json({
            error: 'token expired'
        })
    }

    next(error)
}

const tokenExtractor = (request, response, next) => {
    const authorization = request.get('authorization')
    if (authorization && authorization.startsWith('bearer ')) {
        request.token = authorization.replace('bearer ', '')
    }

    next()
}

const userExtractor = async (request, response, next) => {
    let token = null
    const authorization = request.get('authorization')
    if (authorization && authorization.startsWith('bearer ')) {
        token = authorization.replace('bearer ', '')
    }

    if (token === null) {
        return response.status(401).json({
            error: 'token missing'
        })
    }

    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!decodedToken.id || !decodedToken.id) {
        return response.status(401).json({
            error: 'token invalid or doesn`t exist'
        })
    }

    const user = await User.findById(decodedToken.id)
    request.user = user

    next()
}

module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler,
    tokenExtractor,
    userExtractor
}