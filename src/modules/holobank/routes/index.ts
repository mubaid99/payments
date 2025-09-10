import express from 'express'
import Controller from '../controllers'
import { Wrap } from '@core/utils'
import { authorize } from '@helpers/authorizer'

const router = express.Router()

// KYC routes
router.use(authorize)
router.post('/kyc', Wrap(Controller.uploadKYC))

// Account routes
router.post('/account', Wrap(Controller.createAccount))

// Card routes  
router.post('/card', Wrap(Controller.createCard))

// Transfer routes
router.post('/transfer', Wrap(Controller.createTransfer))

// Balance routes
router.get('/balance/:accountId', Wrap(Controller.getBalance))

export default router