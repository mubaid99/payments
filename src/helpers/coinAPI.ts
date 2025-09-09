import '@core/declarations'
import WebSocket from 'ws'
import { processSocketMessage } from './../modules/alerts/services'

const apiKey = App.Config.COIN_API.API_KEY
const ws = new WebSocket(`ws://ws.coinapi.io/v1/`, {
  headers: { 'X-CoinAPI-Key': apiKey },
})

ws.on('open', () => {
  Logger.info("Connected to CoinAPI WebSocket...")
})

ws.on('message', (data:any) => {
  const message = JSON.parse(data)
  // Alert logic
  processSocketMessage(message)
  return
})

ws.on('close', () => Logger.info('Disconnected from CoinAPI WebSocket'))

export const subscribeToSocket = async (subscriptionMessage:any) => {
  Logger.info('Subscribe to CoinAPI Websocket...')
  ws.send(JSON.stringify(subscriptionMessage))
}

export default ws