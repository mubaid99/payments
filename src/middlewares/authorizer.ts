// import '@core/declarations'
// import jwt from 'jsonwebtoken'
// import { Request, Response, NextFunction } from 'express'
// import constant from '@core/constants'

// const jwtAuthorize = async (req: Request, res: Response, next: NextFunction) => {
// 	try {
// 		const token = req.headers.authorization?.split(' ')[1]

// 		if (!token) {
// 			return res.unauthorized()
// 		}
// 		let decoded: any
// 		try {
// 			decoded = jwt.verify(token, App.Config.JWT.SECRET)
// 		} catch (error) {
// 			return res.unauthorized({ error })
// 		}

// 		const user = await App.Models.User.findById({ _id: decoded._id })

// 		if (!user) {
// 			return res.unauthorized()
// 		}
// 		delete user?.password
// 		req.user = user
// 		return next()
// 	} catch (error) {
// 		Logger.error(error)
// 		return res.unauthorized({ error })
// 	}
// }

// const creatorAuth = async (req: Request, res: Response, next: NextFunction) => {
// 	try {
// 		const _user = req.user._id

// 		const user = await App.Models.User.findById(_user)
// 		if (!user) {
// 			return res.unauthorized()
// 		}
// 		if (user.userType != constant.USER_TYPES[0]) {
// 			return res.unauthorized()
// 		}

// 		return next()
// 	} catch (error) {
// 		Logger.error(error)
// 		return res.unauthorized({ error })
// 	}
// }

// const investorAuth = async (req: Request, res: Response, next: NextFunction) => {
// 	try {
// 		const _user = req.user._id

// 		const user = await App.Models.User.findById(_user)
// 		if (!user) {
// 			return res.unauthorized()
// 		}
// 		if (user.userType != constant.USER_TYPES[1]) {
// 			return res.unauthorized()
// 		}

// 		return next()
// 	} catch (error) {
// 		Logger.error(error)
// 		return res.unauthorized({ error })
// 	}
// }

// export { jwtAuthorize, creatorAuth, investorAuth }
