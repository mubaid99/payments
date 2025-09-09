import '@core/declarations'
import express, { Request, Response, NextFunction } from 'express'
import { Global } from '@core/globals'
import cors from 'cors'
import helmet from 'helmet'
import morganLogger from 'morgan'
import fileUpload from 'express-fileupload'
import { _registerResponders } from '@core/response-handler'
import { Database } from '@core/database'

import constant from '@core/constants'
import cronHelper from '@helpers/cron.helper'
import bodyParser from 'body-parser'
import { AppRoutes } from './app.routes'

export class Application {
        private app: express.Application

        constructor() {
                this.app = express()
                this.middleware()
                this.config()
                this.connectDatabase()
                this.registerResponders()
                this.registerRoutes()
                this.cron()
        }

        /** Returns Express App */
        express() {
                return this.app
        }

        /** Configuration and Setup */
        private config(): void {
                this.app.set('port', App.Config.PORT || constant.PORT)
                this.app.set('env', App.Config.ENVIRONMENT || constant.DEVELOPMENT)
                this.app.disable(constant.X_POWERED_BY)
        }

        /** Http(s) request middleware */
        private middleware(): void {
                this.app.use(morganLogger('dev'))
                this.app.use(
                        cors({
                                origin: '*',
                                methods: 'GET,PUT,PATCH,POST,DELETE',
                                preflightContinue: false,
                                optionsSuccessStatus: 204,
                        })
                )
                this.app.use(helmet())
                this.app.use(bodyParser.json())
                this.app.use(fileUpload())
        }

        /** Register Responders Dynamically */
        private async registerResponders(): Promise<void> {
                this.app.use(async (_request: Request, response: Response, next: NextFunction) => {
                        await _registerResponders(response)
                        next()
                })
        }

        /** Register Routes */
        /** Register Routes */
        private async registerRoutes(): Promise<void> {
                this.app.use(constant.API_VERSION, AppRoutes)
                this.app.get('/', (_req: Request, res: Response) => {
                        return (res as any).success()
                })

                /** Handle the 404 errors */
                /** Handle the 404 errors */
                this.app.use((req: Request, res: Response) => {
                        return (res as any).notFound({ error: App.Message.Error.UrlNotFound({ url: req.originalUrl }) })
                })
        }

        /** Connect Database */
        private async connectDatabase(): Promise<void> {
                const database = new Database({
                        url: App.Config.DB_CONNECTION_STRING,
                })
                await database.connect()
                Global.App.Database = database
        }
        // Do things after the server starts
        async onServerStart(): Promise<any> {
                Logger.info(
                        App.Message.Success.ServerStartUp({
                                port: App.Config.PORT,
                                mode: App.Config.ENVIRONMENT,
                        })
                )
                Logger.info(App.Message.Success.StopServerMessage())
        }

        /** Cron Job */
        private async cron(): Promise<void> {
                await cronHelper.cronJob()
        }
}

export default new Application()
