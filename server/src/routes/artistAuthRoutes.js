import { Router } from 'express'
import { getMe, loginArtist, registerArtist } from '../controllers/authController.js'
import { requireArtist } from '../middleware/authMiddleware.js'

const artistAuthRouter = Router()

artistAuthRouter.post('/register', registerArtist)
artistAuthRouter.post('/login', loginArtist)
artistAuthRouter.get('/me', requireArtist, getMe)

export default artistAuthRouter
