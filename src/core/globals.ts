import Config, { ConfigInterface } from '@config'
import { Logger } from './logger'
import { GenerateCallableMessages } from './utils'
import messages from '../response-messages'
import notificationMessages from '../notification-messages'
import FCMModel from '@models/fcm.model'

import { User } from '@models/user'
import { Transaction } from '@models/transaction'


const config: ConfigInterface = Config()
// Export Global Variables
export const Global: any = global
Global.Logger = Logger
Global.App = {
        Config: config,
        Message: GenerateCallableMessages(messages),
        Notification: GenerateCallableMessages(notificationMessages),
        Models: {
                FCM:FCMModel,
                User:User,
                Transaction:Transaction,
        }
}
