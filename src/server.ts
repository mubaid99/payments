import dotenv from 'dotenv'
dotenv.config()

// Load Path Alias For Transpiled Code [Sync]
import path from 'path'
if (path.extname(__filename) === '.js') {
	require('module-alias/register')
}
import fs from 'fs';

// Load the Express App
import '@core/declarations'
import Application from './app'
import Bootstrap from '@core/bootstrap'
import express from 'express'
import { createServer } from 'http'
import jwt from '@helpers/jwt'
import initializeSocket from '@helpers/socket-io.helper'
import getAndStoreSecret from '@helpers/secret-firebase';
import { initSocketHandlers } from '@modules/paymentQr/controllers/payment.listener';

const expressApp: express.Application = Application.express()

// Execute Bootstrap Code
Bootstrap().then(() => {
	const httpServer = createServer(expressApp)
	httpServer.listen(expressApp.get('port'), async () => {
		jwt.GenerateKeys()
		const secretFilePath = './serviceAccountKey.json';
		if (!fs.existsSync(secretFilePath)) {
            console.log(`Fetching secret as ${secretFilePath} does not exist...`)
            await getAndStoreSecret(App.Config.FIREBASE_SECRET_NAME, secretFilePath)
        }
		
		await Application.onServerStart()
		await initializeSocket(httpServer)
		await initSocketHandlers()
		// startListeners().catch(console.error)

	})

	process.on('SIGINT', () => {
		Logger.info('SIGINT signal received: closing HTTP server')
		httpServer.close(() => {
			Logger.info('HTTP server closed')
			process.exit(0) // Exit the process after cleanup
		})
	})

	process.on('SIGTERM', () => {
		Logger.info('SIGTERM signal received: closing HTTP server')
		httpServer.close(() => {
			Logger.info('HTTP server closed')
			process.exit(0) // Exit the process after cleanup
		})
	})
})

// Error Handling for uncaught exception
process.on('uncaughtException', (err) => {
	Logger.error('UNCAUGHT EXCEPTION!!! Shutting Down...')
	Logger.error(err)
	process.exit(1)
})

// Error Handling for uncaught rejection
process.on('unhandledRejection', (err) => {
	Logger.error('UNHANDLED REJECTION!!! Shutting Down...')
	Logger.error(err)
	process.exit(1)
})
