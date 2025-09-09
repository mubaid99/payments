import { Request, Response } from "express"
import { cancelAlertsValidator } from "../dto"
import requestValidator from "@helpers/request-validator.helper"
import { fetchAccount, removeAlerts } from "../services"

export const cancelAlerts = async (req:Request, res:Response) => {
    try {
      const error = requestValidator(cancelAlertsValidator, req.body)
      if (error) {
        return res.badRequest({ err: error })
      }
      const { walletAddress, alerts } = req.body
      // fetch account
      const account = await fetchAccount('walletAddress', { $regex: new RegExp(walletAddress, 'i') })
      if (account?.error) {
        return res.badRequest({  err: account.error })
      }
      if (!account) {
        return res.badRequest({ err: 'Account not found' })
      }
  
      const query = {
        _id: { $in: alerts }
      }
      const removedAlerts = await removeAlerts(query)
      if (removedAlerts?.error) {
        return res.badRequest({ err: removedAlerts.error })
      }
      
      return res.success({
      
        msg: 'Alerts deleted successfully',
    })
    } catch (err) {
      Logger.error(err.message)
      return res.internalServerError({ err: err.message })
    }
  }