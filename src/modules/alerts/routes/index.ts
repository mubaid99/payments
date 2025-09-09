import express from 'express'
import Controller from '../controller'
import { Wrap } from '@core/utils'



const router = express.Router()

router.post('/create', Wrap(Controller.createAlert))
router.post('/list',  Wrap(Controller.listAlerts))
router.post('/cancel', Wrap(Controller.cancelAlerts))
export default router