import { subscribeToSocket } from '@helpers/coinAPI'
import { addAlert, addAssetToSubscribed, fetchAccount, fetchAlerts, fetchAssetById } from '../services'
import { Request, Response } from 'express'
import constant from '@core/constants'
import { createAlertValidator } from '../dto'
import requestValidator from '@helpers/request-validator.helper'

export const createAlert = async (req:Request, res:Response) => {
	try {
		const error = requestValidator(createAlertValidator, req.body)
		if (error) {
            return res.badRequest({ err: error })
			
		}
		const { walletAddress, token, type, price, change, frequency } = req.body

		// fetch account
		const account = await fetchAccount('walletAddress', {
			$regex: new RegExp(walletAddress, 'i'),
		})
		if (account?.error) {
			return res.badRequest({ err: error })
		}
		if (!account) {
			return res.badRequest({ err: error })
		}

		// fetch active alert counts
		const query = {
			walletAddress,
			status: 'active',
		}
		const activeAlerts = await fetchAlerts(query)
		const activeAlertsCount = activeAlerts.length
		if (activeAlertsCount >= constant.alert.limit) {
			return  res.badRequest({
				res,
				err: `Alerts limit exceeded, maximum of ${constant.alert.limit} can be created.`,
				statusCode: 400,
			})
		}

		// set expiry
		const expiry = new Date(new Date().setDate(new Date().getDate() + constant.alert.validity))

		// alert request
		const alertRequest = {
			_account: account._id,
			walletAddress,
			token,
			type,
			price,
			change,
			frequency,
			expiry,
		}

		const alert = await addAlert(alertRequest)

		const asset = await fetchAssetById(`${token.symbol}/USDT`)
		if (asset?.error || !asset) {
			if (token.symbol !== 'USDT') {
				// subscribe asset to websocket
				const subscriptionMessage = {
					type: 'subscribe',
					apikey: App.Config.COIN_API.API_KEY,
					heartbeat: false,
					subscribe_data_type: ['trade'],
					subscribe_filter_exchange_id: ['BINANCE'],
					subscribe_update_limit_ms_quote: 2000,
					subscribe_filter_period_id: ['1day'],
					subscribe_filter_asset_id: [`${token.symbol}/USDT`],
				}
				await subscribeToSocket(subscriptionMessage)
				await addAssetToSubscribed({
					asset_id: `${token.symbol}/USDT`,
					exchange_id: 'HOLESKY',
				})
			}
		}

		return res.success({
			data: alert,
			msg: 'Alert created successfully',
		})
	} catch (err) {
		Logger.error(err.message)
		return res.internalServerError({ err })
	}
}
