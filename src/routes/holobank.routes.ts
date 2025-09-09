import { Router } from 'express'
import { HolobankController } from '../controllers/holobank.controller'
import { Wrap } from '@core/utils'

const router = Router()

/**
 * @route POST /holobank/kyc
 * @desc Upload KYC documents for a user
 * @access Private
 */
router.post('/kyc', Wrap(HolobankController.uploadKYC))

/**
 * @route POST /holobank/account
 * @desc Create a new account for a user
 * @access Private
 */
router.post('/account', Wrap(HolobankController.createAccount))

/**
 * @route POST /holobank/card
 * @desc Create a card for an account
 * @access Private
 */
router.post('/card', Wrap(HolobankController.createCard))

/**
 * @route POST /holobank/transfer
 * @desc Transfer funds between accounts
 * @access Private
 */
router.post('/transfer', Wrap(HolobankController.transfer))

/**
 * @route GET /holobank/balance/:accountId
 * @desc Get account balance
 * @access Private
 */
router.get('/balance/:accountId', Wrap(HolobankController.getBalance))

export { router as HolobankRoutes }