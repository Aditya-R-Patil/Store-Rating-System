import express from 'express'

import {
    submitRating,
    ratingValidation,
    getMyRating
} from '../controllers/ratingController.js'

import { verifyToken } from '../middleware/authMiddleware.js'
import { authorizeRole } from '../middleware/roleMiddleware.js'

const router = express.Router()

// Submit or Update Rating
router.post(
    '/',
    verifyToken,
    authorizeRole('user'),
    ratingValidation,
    submitRating
)

// Get Logged-in User's Rating
router.get(
    '/:store_id',
    verifyToken,
    authorizeRole('user'),
    getMyRating
)

export default router