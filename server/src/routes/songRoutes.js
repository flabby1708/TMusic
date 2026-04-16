import { Router } from 'express'
import { getSongs } from '../controllers/songController.js'

const songRouter = Router()

songRouter.get('/', getSongs)

export default songRouter
