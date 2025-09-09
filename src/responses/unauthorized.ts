import { Response } from 'express'
import '@core/declarations'

export default function (data = {}): Response {
	const statusCode = 401
	const {
		isSuccess = false,
		message = App.Message.Error.Unauthorized(),
	}: {
		isSuccess?: boolean
		message?: string
	} = data

	const resultant = {
		isSuccess,
		message,
		statusCode,
	}

	// All Done
	return this.status(statusCode).json(resultant)
}
