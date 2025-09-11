import { createCoreUser } from './user.create'
import { uploadKYC } from './kyc.upload'
import { listKYCs, updateKYCStatus } from './kyc.list'
import { createAccount } from './account.create'
import { createCard } from './card.create'
import { createTransfer } from './transfer.create'
import { getBalance } from './balance.get'
import { getDepositInfo } from './deposit.info'
import { handleWebhook } from './webhook.verify'
import { getTransactions, getTransactionById } from './transaction.list'

export default {
  createCoreUser,
  uploadKYC,
  listKYCs,
  updateKYCStatus,
  createAccount,
  createCard,
  createTransfer,
  getBalance,
  getDepositInfo,
  handleWebhook,
  getTransactions,
  getTransactionById
}