import { Router } from 'express'
import { getSongs } from './songController.js'

const songRouter = Router()

songRouter.get('/', getSongs)

export default songRouter
