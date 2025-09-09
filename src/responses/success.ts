import '@core/declarations'
import { Response } from 'express'

export default function (_data = {}): Response {
	const statusCode = 200
	const {
		isSuccess = true,
		message = null,
		data = null,
		// Pagination Related Fields
		totalItems,
		startIndex,
		itemsPerPage,
	}: {
		isSuccess?: boolean
		message?: string
		data?: any
		// Pagination Related Fields
		totalItems?: number
		startIndex?: number
		itemsPerPage?: number
		totalPage?: number
	} = _data

	const resultant = {
		isSuccess,
		message: message ? message : App.Message.Success.Success(),
		statusCode,
		// Pagination Related Fields
		totalItems,
		startIndex,
		itemsPerPage,
		totalPage: Math.ceil(totalItems / itemsPerPage),
		data: data ? data : undefined,
	}

	// All Done
	return this.status(statusCode).json(resultant)
}
