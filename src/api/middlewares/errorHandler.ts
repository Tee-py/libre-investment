import { Request, Response, NextFunction, ErrorRequestHandler } from "express"
import { logger } from "utils/logger"
import { ValidationError, AuthenticationError, NotFoundError } from "utils/apiErrors"

const errorHandler: ErrorRequestHandler = (err: any, req: Request, res: Response, _next: NextFunction): void => {
    logger.error("Error Occurred", {
        method: req.method,
        url: req.originalUrl,
        status: req.statusCode,
        message: err.message,
        stack: err.stack,
        headers: req.headers,
        body: req.body
    })

    if (err instanceof ValidationError) {
        res.status(400).json({
            error: 'Validation Error',
            message: err.message
        })
        return
    }

    if (err instanceof AuthenticationError) {
        res.status(401).json({
            error: 'Authentication Error',
            message: err.message
        })
        return
    }

    if (err instanceof NotFoundError) {
        res.status(404).json({
            error: 'Not Found',
            message: err.message
        })
        return
    }

    if (err.message?.includes('CORS')) {
        res.status(403).json({
            error: 'Forbidden',
            message: err.message
        })
        return
    }

    res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred'
    })
}

export default errorHandler
