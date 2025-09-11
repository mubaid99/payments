import express from 'express'
import Controller from '../controllers'
import { Wrap } from '@core/utils'
import { authorize } from '@helpers/authorizer'

const router = express.Router()

// Webhook routes (no authentication needed for webhooks)
// Use raw body parser for signature verification
router.post('/webhook', 
  express.raw({ type: 'application/json' }),
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Store raw body and parse JSON for controller
    (req as any).rawBody = req.body
    try {
      req.body = JSON.parse(req.body.toString())
    } catch (e) {
      req.body = {}
    }
    next()
  },
  Wrap(Controller.handleWebhook)
)

// All other routes require authentication
router.use(authorize)

// KYC routes
router.post('/kyc', Wrap(Controller.uploadKYC))

// Account routes
router.post('/account', Wrap(Controller.createAccount))

// Card routes  
router.post('/card', Wrap(Controller.createCard))

// Transfer routes
router.post('/transfer', Wrap(Controller.createTransfer))

// Balance routes
router.get('/balance/:accountId', Wrap(Controller.getBalance))

// Transaction routes
router.get('/transactions', Wrap(Controller.getTransactions))
router.get('/transaction/:transactionId', Wrap(Controller.getTransactionById))

export default router