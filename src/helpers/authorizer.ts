import { Logger } from '@core/logger'

import axios from 'axios'
import { NextFunction, Request, Response } from 'express'

export const authorize = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const token = req.headers.authorization?.split(' ')[1]
		// const
		const response = await axios.get(`${App.Config.AUTH_API_URL}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
		
		const user = await App.Models.User.findOne({
			_id: response?.data?.data?._id,
		})
                

		if (!user) {
			return (res as any).unauthorized()
		}
		req.user = user
		return next()
	} catch (error) {
		Logger.error(error)
		return (res as any).unauthorized()
	}
}
