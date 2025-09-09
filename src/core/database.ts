import '@core/declarations'
import { connect, ObjectId, Document } from 'mongoose'
import constant from './constants'

export interface BaseModel extends Document {
	isActive?: boolean
	createdAt?: Date
	updatedAt?: Date
	createdBy?: ObjectId
	updatedBy?: ObjectId
}

export class Database {
	private url: string
	private connectionOptions: Record<string, unknown>

	constructor(options: { url: string; connectionOptions?: Record<string, unknown> }) {
		const {
			url = App.Config.DB_CONNECTION_STRING,
			connectionOptions = {
				useNewUrlParser: true,
				useUnifiedTopology: true,
			},
		} = options

		this.url = url
		this.connectionOptions = connectionOptions
	}

	async connect(): Promise<void> {
		try {
			await connect(this.url?.toString(), this.connectionOptions)
			Logger.info(App.Message.Success.DatabaseConnected())
		} catch (err) {
			Logger.error(
				
				Logger.error(`${App.Message.Error.DatabaseConnectionFailed()}.\n${err?.message}`)
			)
		}
	}
}
