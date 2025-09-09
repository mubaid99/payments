import '@core/declarations'
import { Router } from 'express'

import qrRouter from '@modules/paymentQr/routes'
import { HolobankRoutes } from './routes/holobank.routes'


const router = Router()

router.use('/qr', qrRouter)
router.use('/holobank', HolobankRoutes)

export const AppRoutes = router
