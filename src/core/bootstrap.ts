import '@core/declarations'
import '@core/globals'
import InitEventListeners from '../core/web3-init-listener'

export default async () => {
        try {
                // Do stuff that needs to be done before server start
                await InitEventListeners()
        } catch (error) {
                Logger.error(error)
        }
}
