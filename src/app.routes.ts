import '@core/declarations'
import { Router } from 'express'

import qrRouter from '@modules/paymentQr/routes'
import holobankRouter from '@modules/holobank/routes'
import { SwapRoutes } from '@modules/swap/routes'


const router = Router()

router.use('/qr', qrRouter)
router.use('/holobank', holobankRouter)
router.use('/swap', SwapRoutes)

export const AppRoutes = router
