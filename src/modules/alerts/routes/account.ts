import express from 'express'
import Controller from '../controller'
import { Wrap } from '@core/utils'



const router = express.Router()

router.post('/fcm/register', Wrap(Controller.registerFcm))

export default router