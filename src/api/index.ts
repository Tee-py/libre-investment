import app from "./app";
import { logger } from "../utils/logger";
import { env } from "./config";

app.listen(env.PORT, () => {
    logger.info(`Server ${env.NODE_ENV} listening at http://${env.HOST}:${env.PORT}`)
})