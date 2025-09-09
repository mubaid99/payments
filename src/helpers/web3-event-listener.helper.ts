
export default class Web3EventListenerHelper {
	// contractMetadata: any
	// contract: any
	// WSS_URL: string
	// eventName: string
	// eventHandler: any
	// Web3Socket: any

	// constructor({ contract, eventHandler, eventName }) {
	// 	this.contractMetadata = contract
	// 	this.eventName = eventName
	// 	this.eventHandler = eventHandler
	// 	this.WSS_URL = App.Config.POLYGON.RPC_URL_WSS

	// 	// Socket
	// 	// this.Web3Socket = new Web3(new Web3.providers.WebsocketProvider(this.WSS_URL))

	// 	// Finalize ABI
	// 	const abi =
	// 		this.contractMetadata.type === constant.BLOCKCHAIN.CONTRACT_TYPES[0]
	// 			? icoABI
	// 			: this.contractMetadata.type === constant.BLOCKCHAIN.CONTRACT_TYPES[1]
	// 			? tokenABI
	// 			: ''

	// 	// Create Contract
	// 	// this.contract = new this.Web3Socket.eth.Contract(abi, this.contractMetadata.address)

	// 	this.initializeListener()

	// 	// if (0 && lastSeenBlock != undefined) {
	// 	// 	// lastSeenBlock = lastSeenBlock - 5000
	// 	// 	this.listenToMissedEvents({ lastSeenBlock }).then(() => {
	// 	// 		this.initializeListener()
	// 	// 	})
	// 	// } else {
	// 	// 	this.initializeListener()
	// 	// }
	// }

	// initializeListener() {
	// 	// this.contract.events[this.eventName]().on('data', (event: any) => {
	// 	// 	Logger.info(`Event: ${event.event} | Hash: ${event.transactionHash}`)
	// 	// 	this.eventHandler(event)
	// 	// // })

	// 	// Logger.info(`Initialized Listener:  ${this.eventName}`)
	// }

	// async listenToMissedEvents({ lastSeenBlock }) {
	// 	logger.warn(
	// 		`Getting Missed ${this.contractMetadata.MULTI_CHAIN_NAME}.${this.eventName} Events.`
	// 	)
	// 	await this.contract.getPastEvents(
	// 		this.eventName,
	// 		{
	// 			fromBlock: lastSeenBlock,
	// 			toBlock: 'latest',
	// 		},
	// 		async (error, events) => {
	// 			if (!error) {
	// 				for (let event of events) {
	// 					await this.eventHandler(event, this.CHAIN_CODE)
	// 				}
	// 			} else {
	// 				logger.error(error)
	// 			}
	// 		}
	// 	)
	// }
}
