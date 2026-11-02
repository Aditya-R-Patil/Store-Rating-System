import express from 'express'

import { getUserStores } from '../controllers/storeController.js'

import { verifyToken } from '../middleware/authMiddleware.js'
import { authorizeRole } from '../middleware/roleMiddleware.js'

const router = express.Router()

// Get All Stores for Normal User
router.get(
    '/stores',
    verifyToken,
    authorizeRole('user'),
    getUserStores
)

export default router