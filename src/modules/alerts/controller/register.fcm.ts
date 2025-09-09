import { Request, Response } from "express"
import { createFcm, fetchAccount, fetchFcmDetails } from "../services"

export const registerFcm = async (req:Request, res:Response) => {
    try {
      const { walletAddress, deviceId, os, fcmToken } = req.body
      // fetch account
      const account = await fetchAccount('walletAddress', { $regex: new RegExp(walletAddress, 'i') })
      if (account?.error) {
        return res.badRequest({ err: account.error })
      }
      if (!account) return res.badRequest({ err: 'Account not found' })
  
      // check if fcm exists
      const query = {
        walletAddress: { $regex: new RegExp(walletAddress, 'i') },
        fcmToken
      }
      const fcm = await fetchFcmDetails(query)
      if (fcm) {
        return res.success({ data: fcm, msg: 'FCM added successfully' })
      }
  
      const fcmRequest = {
        _account: account._id,
        walletAddress: account.walletAddress,
        deviceId,
        os,
        fcmToken
      }
      const newToken = await createFcm(fcmRequest)
      return res.success({ data: newToken, msg: 'FCM added successfully' })
    } catch (err) {
      Logger.error(err.message)
      return res.internalServerError({  err: err.message })
    }
  }