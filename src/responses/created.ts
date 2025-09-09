import { Response } from 'express'

export default function (_data = {}): Response {
	const statusCode = 201
	const {
		isSuccess = true,
		message = null,
		data = null,
	}: {
		isSuccess?: boolean
		message?: string
		data?: any
	} = _data

	const resultant = {
		isSuccess,
		message: message ? message : App.Message.Success.Created(),
		statusCode,
		data: data ? data : undefined,
	}

	// All Done
	return this.status(statusCode).json(resultant)
}
