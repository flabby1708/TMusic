import { Router } from 'express'
import { getPodcasts } from './podcastController.js'

const podcastRouter = Router()

podcastRouter.get('/', getPodcasts)

export default podcastRouter
