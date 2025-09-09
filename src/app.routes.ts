import '@core/declarations'
import { Router } from 'express'

import qrRouter from '@modules/paymentQr/routes'


const router = Router()

router.use('/qr', qrRouter)

export const AppRoutes = router
