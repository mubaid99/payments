import '@core/declarations'
import cron from 'node-cron'

import {startListeners} from '@modules/paymentQr/controllers/payment.listener'

class CronHelper {
	async cronJob(): Promise<void> {
		// Schedule job to run at 5:30 AM IST
		cron.schedule('* * * * *',async ()=>{
			console.log('running cron')
			await startListeners()
		})
		
	}
}
export default new CronHelper()
