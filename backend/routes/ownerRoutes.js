
import express from 'express'

import {
    getOwnerDashboard,
    getOwnerStore,
    getOwnerRatings
} from '../controllers/ownerController.js'

import { verifyToken } from '../middleware/authMiddleware.js'
import { authorizeRole } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.get('/dashboard', verifyToken, authorizeRole('owner'), getOwnerDashboard)

router.get('/store', verifyToken, authorizeRole('owner'), getOwnerStore)

router.get('/ratings', verifyToken, authorizeRole('owner'), getOwnerRatings)

export default router
