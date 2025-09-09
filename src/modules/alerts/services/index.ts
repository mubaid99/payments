import '@core/declarations'

import { subscribeToSocket } from '@helpers/coinAPI'
import { sendPushNotification } from '@helpers/pushNotification'
import constants from '@core/constants'
import moment from 'moment'

export const addAlert = async (data) => {
  try {
    const alert = await App.Models.ALERT.create(data)
    
    return alert
  } catch (err) {
    Logger.error(err.message)
    return { error: err.message }
  }
}

export const fetchAlerts = async (query) => {
  try {
    const alerts = await App.Models.ALERT.find(query)
    return alerts
  } catch (err) {
    Logger.error(err.message)
    return { error: err.message }
  }
}

export const removeAlerts = async (query) => {
  try {
    const alerts = await App.Models.ALERT.deleteMany(query)
    return alerts
  } catch (err) {
    Logger.error(err.message)
    return { error: err.message }
  }
}

export const fetchAssetById = async (asset_id) => {
  try {
    const assets = await App.Models.SUBSCRIBED_ASSETS.findOne({ asset_id })
    return assets
  } catch (err) {
    Logger.error(err.message)
    return { error: err.message }
  }
}

export const fetchAndSubscribeAssets = async () => {
  try {
    const assets = await App.Models.SUBSCRIBED_ASSETS.find()
    if (assets.length > 0) {
      const assetList = assets.map(it => it.asset_id)
      const subscriptionMessage = {
        type: 'subscribe',
        apikey: App.Config.COIN_API.API_KEY,
        heartbeat: false,
        subscribe_data_type: ['trade'],
        subscribe_filter_exchange_id: [
          'BINANCE',
        ],
        subscribe_update_limit_ms_quote: 2000,
        subscribe_filter_period_id: ['1day'],
        subscribe_filter_asset_id: assetList
      }
      await subscribeToSocket(subscriptionMessage)
    }
    return
  } catch (err) {
    Logger.error(err.message)
    return { error: err.message }
  }
}

export const addAssetToSubscribed = async (data) => {
  try {
    const asset = await App.Models.SUBSCRIBED_ASSETS.create(data)
    return asset
  } catch (err) {
    Logger.error(err.message)
    return { error: err.message }
  }
}

const trimAssetSymbol = async (asset) => {
  try {
    let symbol = asset.split('_')
    symbol = symbol[symbol.length - 2]
    return symbol
  } catch (err) {
    Logger.error(err.message)
    return { error: err.message }
  }
}

export const processSocketMessage = async (message) => {
  try {
    const price = message.price
    const symbol = await trimAssetSymbol(message.symbol_id)
    // Fetch alerts for the given symbol
    const alerts = await App.Models.ALERT.find({ 'token.symbol': symbol, status: 'active' })

    const triggeredAlerts = await Promise.all(
      alerts.map(async (alert) => {
        // Define whether the alert should be triggered
        let shouldTrigger = false
        // Price reaches
        if (alert.type === constants.alert.types[1]) {
          if (price >= Number(alert.price)) {
            if (!alert.priceMove) {
              await App.Models.ALERT.updateOne({ _id: alert._id }, { priceMove: 'up' })
            } else if (alert.priceMove === 'down') {
              await App.Models.ALERT.updateOne({ _id: alert._id }, { priceMove: 'up' })
              shouldTrigger = true
            }
          } else if (price <= Number(alert.price)) {
            if (!alert.priceMove) {
              await App.Models.ALERT.updateOne({ _id: alert._id }, { priceMove: 'down' })
            } else if (alert.priceMove === 'up') {
              await App.Models.ALERT.updateOne({ _id: alert._id }, { priceMove: 'down' })
              shouldTrigger = true
            }
          }
        }

        // Price above
        if (alert.type === constants.alert.types[2]) {
          if (price >= Number(alert.price)) {
            if (alert.shouldAlert) {
              await App.Models.ALERT.updateOne({ _id: alert._id }, { shouldAlert: false })
              shouldTrigger = true
            }
          } else {
            await App.Models.ALERT.updateOne({ _id: alert._id }, { shouldAlert: true })
          }
        }

        // Price below
        if (alert.type === constants.alert.types[3]) {
          if (price <= Number(alert.price)) {
            if (alert.shouldAlert) {
              await App.Models.ALERT.updateOne({ _id: alert._id }, { shouldAlert: false })
              shouldTrigger = true
            }
          } else {
            await App.Models.ALERT.updateOne({ _id: alert._id }, { shouldAlert: true })
          }
        }

        // Change is over
        if (alert.type === constants.alert.types[4]) {
          if (price >= Number(alert.price)) {
            if (alert.shouldAlert) {
              await App.Models.ALERT.updateOne({ _id: alert._id }, { shouldAlert: false })
              shouldTrigger = true
            }
          } else {
            await App.Models.ALERT.updateOne({ _id: alert._id }, { shouldAlert: true })
          }
        }

        // Change is under
        if (alert.type === constants.alert.types[5]) {
          if (price <= Number(alert.price)) {
            if (alert.shouldAlert) {
              await App.Models.ALERT.updateOne({ _id: alert._id }, { shouldAlert: false })
              shouldTrigger = true
            }
          } else {
            await App.Models.ALERT.updateOne({ _id: alert._id }, { shouldAlert: true })
          }
        }

        // Return the alert object if it should trigger, otherwise return null
        return shouldTrigger ? alert : null
      })
    )

    // Filter out null values to get the actual alert objects
    const filteredTriggeredAlerts = triggeredAlerts.filter((alert) => alert !== null)
    for (const alert of filteredTriggeredAlerts) {
      const fcm = await App.Models.FCM.find({ walletAddress: { $regex: new RegExp(alert.walletAddress, 'i') } })
      const fcmTokens = []
      fcm.forEach((el) => fcmTokens.push(el.fcmToken))
      if (fcmTokens.length === 0) continue
      let body
      switch (alert.type) {
        case constants.alert.types[1]:
          body = `🚀 ${alert.token.symbol} reaches $${alert.price}!`
          break
        case constants.alert.types[2]:
          body = `🚀 ${alert.token.symbol} price surged above $${alert.price}!`
          break
        case constants.alert.types[3]:
          body = `📉 ${alert.token.symbol} price dropped to $${alert.price}.`
          break
        case constants.alert.types[4]:
          body = `🚀 ${alert.token.symbol} price surged above $${alert.price}!`
          break
        case constants.alert.types[5]:
          body = `📉 ${alert.token.symbol} price dropped to $${alert.price}.`
          break
        default:
          break
      }
      const metadata = {
        type: 'Alert',
        walletAddress: alert?.walletAddress
      }
      if (alert.frequency === constants.alert.frequency[1]) {
        await sendPushNotification(fcmTokens, { title: 'Price Alert', body }, metadata)
        await App.Models.ALERT.updateOne({ _id: alert._id }, { status: 'triggered' })
        continue
      }
      if (alert.frequency === constants.alert.frequency[2]) {
        if (!alert.lastTriggered || new Date(alert.lastTriggered).toDateString() !== new Date().toDateString()) {
          // Trigger alert 
          await sendPushNotification(fcmTokens, { title: 'Price Alert', body }, metadata)
          await App.Models.ALERT.updateOne({ _id: alert._id }, { lastTriggered: new Date() })
        }
        continue
      }
      if (alert.frequency === constants.alert.frequency[3]) {
        const currDate = moment()
        if (!alert.lastTriggered ||  currDate.diff(moment(alert.lastTriggered), 'minutes') > constants.alert.timeBuffer * 60 * 1000) {
          // Trigger alert
          await sendPushNotification(fcmTokens, { title: 'Price Alert', body }, metadata)
          await App.Models.ALERT.updateOne({ _id: alert._id }, { lastTriggered: new Date() })
        }
        continue
      }
    }
  } catch (err) {
    Logger.error(err.message)
    return { error: err.message }
  }
}

export const checkAlertExpiry = async () => {
  try {
    const now = new Date()
    const threshold = new Date(now.setDate(now.getDate() - constants.alert.validity))
    for await (const alert of App.Models.ALERT.find({ createdAt: { $lt: threshold }, status: 'active' })) {
      await App.Models.ALERT.updateOne({ _id: alert._id }, { status: 'expired' })
    }
    return
  } catch (err) {
    Logger.error(err.message)
    return { error: err.message }
  }
}



export const fetchAccount = async (field:any, value:any) => {
  try {
    const wallet = await App.Models.User.findOne({ [`${field}`]: value })
    return wallet
  } catch (err) {
    Logger.error(err.message)
    return { error: err.message }
  }
}

export const createFcm = async (data:any) => {
  try {
    const fcm = await App.Models.FCM.create(data)
    return fcm
  } catch (err) {
    Logger.error(err.message)
    return { error: err.message }
  }
}

export const fetchFcmDetails = async (query) => {
  try {
    const fcm = await App.Models.FCM.findOne(query)
    return fcm
  } catch (err) {
    Logger.error(err.message)
    return { error: err.message }
  }
}