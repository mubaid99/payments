import axios from 'axios'
import { NextFunction, Request, Response } from 'express'

export const authorize = async (req: Request, res: Response, next: NextFunction) => {
        try {
                const token = req.headers.authorization?.split(' ')[1]
                
                // Use environment variable directly for now
                const AUTH_API_URL = process.env.AUTH_API_URL || 'http://localhost:3000/api/v1/auth/verify'
                
                const response = await axios.get(AUTH_API_URL, {
                        headers: {
                                Authorization: `Bearer ${token}`,
                        },
                })
                
                // Import User model directly
                const { User } = await import('@models/user')
                const user = await User.findOne({
                        _id: response?.data?.data?._id,
                })
                

                if (!user) {
                        return (res as any).unauthorized()
                }
                (req as any).user = user
                return next()
        } catch (error) {
                console.error('Authorization error:', error)
                return (res as any).unauthorized()
        }
}
