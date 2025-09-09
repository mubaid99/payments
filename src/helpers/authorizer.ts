import { Logger } from '@core/logger'
import JWTHelper from '@helpers/jwt'
import { NextFunction, Request, Response } from 'express'


export const authorize = async (req: Request,res:Response,next:NextFunction) => {
        try {
                
                const token = req.headers.authorization?.split(' ')[1]
                
                const user = await JWTHelper.GetUser({ token })
                
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
