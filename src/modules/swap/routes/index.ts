import '@core/declarations'
import { Router } from 'express'
import { getMeta, getQuote, createSwap, getSwapHistory, getSwapStatus } from '../controllers'
import { authorize } from '@helpers/authorizer'

const router = Router()

// Public routes (no authentication required)
router.get('/meta', getMeta)
router.get('/quote', getQuote)

// Private routes (authentication required)
router.post('/create', authorize, createSwap)
router.get('/history', authorize, getSwapHistory)
router.get('/status/:transactionId', authorize, getSwapStatus)

export { router as SwapRoutes }