import express from 'express';
import helmet from 'helmet';
import { requestLogger } from './middlewares/requestLogger';
import apiCors from './middlewares/corsOrigin';
import errorHandler from './middlewares/errorHandler';

const app = express()

// Regular middleware
app.use(helmet())
app.use(express.json())
app.use(requestLogger)
app.use(apiCors)

// Error handler
app.use(errorHandler)

export default app