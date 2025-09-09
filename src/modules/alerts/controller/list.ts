import { Request, Response } from 'express'
import { fetchAccount, fetchAlerts } from "../services"
import { listAlertsValidator } from '../dto'
import requestValidator from '@helpers/request-validator.helper'

export const listAlerts = async (req:Request, res:Response) => {
    try {
      const error = requestValidator(listAlertsValidator, req.body)
      if (error) {
        return res.badRequest({ err: error })
    }
      const { walletAddress } = req.body
      const { page = 1, limit = 20 } = req.query
  
      // fetch account
      const account = await fetchAccount('walletAddress', { $regex: new RegExp(walletAddress, 'i') })
      if (account?.error) {
        return res.badRequest({ err: account.error })

        
      }
      if (!account) {
        return res.badRequest({ err: 'Account not found' })

        
      }
  
      // fetch alerts
      const query = {
        walletAddress,
        status: 'active'
      }
      let alerts = await fetchAlerts(query)
      if (alerts?.error) return res.badRequest({  err: alerts.error })
      const totalCount = alerts.length
      const startIndex = (Number(page) - 1) * Number(limit)
      const endIndex = startIndex + Number(limit)
      alerts = alerts.slice(startIndex, endIndex)
      const result = {
        totalCount,
        alerts
      }
      return res.success({ data: result, msg: 'Alerts list' })
    } catch (err) {
      Logger.error(err.message)
      return res.internalServerError({ err: err.message })
    }
  }
  