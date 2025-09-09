import { Response } from 'express'
import '@core/declarations'

export default function (data): Response {
	const statusCode = 404
	const {
		isSuccess = false,
		message = App.Message.Error.NotFound(),
		error = null,
	}: {
		isSuccess?: boolean
		message?: string
		error?: string
	} = data
	const resultant = {
		isSuccess,
		statusCode,
		message,
		error,
	}

	// All Done
	return this.status(statusCode).json(resultant)
}
