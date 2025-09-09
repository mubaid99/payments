import express from 'express'
import Controller from '../controllers'
import { Wrap } from '@core/utils'



const router = express.Router()

router.post('/createQR', Wrap(Controller.createQRPayment))

export default router