import '@core/declarations'
import { Router } from 'express'

import qrRouter from '@modules/paymentQr/routes'
import holobankRouter from '@modules/holobank/routes'


const router = Router()

router.use('/qr', qrRouter)
router.use('/holobank', holobankRouter)

export const AppRoutes = router
