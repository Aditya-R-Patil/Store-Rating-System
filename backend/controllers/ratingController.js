import {
    createRating,
    getStoreAverageRating,
    getUserRating
} from '../models/ratingModel.js'

import { body, validationResult } from 'express-validator'

export const ratingValidation = [
    body('store_id')
        .isInt({ min: 1 })
        .withMessage('Valid store ID is required'),

    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5')
]

export const submitRating = async (req, res) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            })
        }

        const userId = req.user.id
        const { store_id, rating } = req.body

        await createRating(userId, store_id, rating)

        const average = await getStoreAverageRating(store_id)

        res.status(200).json({
            success: true,
            message: 'Rating submitted successfully',
            averageRating: average.averageRating,
            totalRatings: average.totalRatings
        })

    } catch (error) {
        console.error(error)

        res.status(500).json({
            success: false,
            message: 'Unable to submit rating'
        })
    }
}

export const getMyRating = async (req, res) => {
    try {
        const userId = req.user.id
        const { store_id } = req.params

        const rating = await getUserRating(userId, store_id)

        res.json({
            success: true,
            rating: rating ? rating.rating : null
        })

    } catch (error) {
        console.error(error)

        res.status(500).json({
            success: false,
            message: 'Unable to fetch rating'
        })
    }
}