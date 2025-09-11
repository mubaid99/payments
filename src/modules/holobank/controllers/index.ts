import { uploadKYC } from './kyc.upload'
import { createAccount } from './account.create'
import { createCard } from './card.create'
import { createTransfer } from './transfer.create'
import { getBalance } from './balance.get'
import { handleWebhook } from './webhook.verify'
import { getTransactions, getTransactionById } from './transaction.list'

export default {
  uploadKYC,
  createAccount,
  createCard,
  createTransfer,
  getBalance,
  handleWebhook,
  getTransactions,
  getTransactionById
}