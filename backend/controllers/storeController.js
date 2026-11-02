
import { body, validationResult } from 'express-validator'
import db from '../config/db.js'
import { createStore } from '../models/storeModel.js'

// Store Validation
export const addStoreValidation = [
    body('name')
        .trim()
        .isLength({ min: 1, max: 20 })
        .withMessage('Store name must be 1 to 20 characters'),

    body('email')
        .trim()
        .isEmail()
        .withMessage('Enter a valid email'),

    body('address')
        .trim()
        .notEmpty()
        .withMessage('Address is required')
        .bail()
        .isLength({ max: 400 })
        .withMessage('Address cannot exceed 400 characters'),

    body('owner_id')
        .isInt({ min: 1 })
        .withMessage('Valid owner ID is required'),

    body('category')
        .optional({ values: 'falsy' })
        .isLength({ max: 100 })
        .withMessage('Category cannot exceed 100 characters'),

    body('description')
        .optional({ values: 'falsy' })
        .isString()
        .withMessage('Description must be text'),

    body('contact_number')
        .optional({ values: 'falsy' })
        .isLength({ max: 20 })
        .withMessage('Contact number cannot exceed 20 characters'),

    body('opening_hours')
        .optional({ values: 'falsy' })
        .isLength({ max: 100 })
        .withMessage('Opening hours cannot exceed 100 characters'),

    body('website_url')
        .optional({ values: 'falsy' })
        .isURL({
            protocols: ['http', 'https'],
            require_protocol: true
        })
        .withMessage('Enter a valid website URL'),

    body('location_url')
        .optional({ values: 'falsy' })
        .isURL({
            protocols: ['http', 'https'],
            require_protocol: true
        })
        .withMessage('Enter a valid Google Maps URL')
]

// Add Store
export const addStore = async (req, res) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            })
        }

        const {
            name,
            email,
            address,
            owner_id,
            category,
            description,
            contact_number,
            opening_hours,
            website_url,
            location_url
        } = req.body

        // Check Store Owner
        const [owner] = await db.query(
            'SELECT id FROM users WHERE id = ? AND role = ?',
            [owner_id, 'owner']
        )

        if (owner.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Store owner not found'
            })
        }

        // Store Image
        const image_url = req.file
            ? `/uploads/${req.file.filename}`
            : null

        // Create Store
        const result = await createStore(
            name,
            email,
            address,
            owner_id,
            image_url,
            category || null,
            description || null,
            contact_number || null,
            opening_hours || null,
            website_url || null,
            location_url || null
        )

        return res.status(201).json({
            success: true,
            message: 'Store added successfully',
            storeId: result.insertId
        })

    } catch (error) {
        console.error('Add Store Error:', error)

        return res.status(500).json({
            success: false,
            message: 'Failed to add store'
        })
    }
}

// Get All Stores (Admin)
export const getAllStores = async (req, res) => {
    try {
        const search = req.query.search || ''
        const sortBy = req.query.sortBy || 'id'
        const order = req.query.order === 'asc' ? 'ASC' : 'DESC'

        const allowedSortColumns = {
            id: 's.id',
            name: 's.name',
            email: 's.email',
            address: 's.address',
            owner_name: 'u.name'
        }

        const sortColumn = allowedSortColumns[sortBy] || 's.id'

        const [stores] = await db.query(
            `SELECT
                s.*,
                u.name AS owner_name,
                ROUND(AVG(r.rating), 1) AS averageRating,
                COUNT(r.id) AS totalRatings
             FROM stores s
             LEFT JOIN users u ON s.owner_id = u.id
             LEFT JOIN ratings r ON s.id = r.store_id
             WHERE s.name LIKE ?
                OR s.email LIKE ?
                OR s.address LIKE ?
                OR u.name LIKE ?
             GROUP BY s.id
             ORDER BY ${sortColumn} ${order}`,
            [
                `%${search}%`,
                `%${search}%`,
                `%${search}%`,
                `%${search}%`
            ]
        )

        return res.status(200).json({
            success: true,
            stores
        })

    } catch (error) {
        console.error('Get All Stores Error:', error)

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch stores'
        })
    }
}

// Get Stores for Normal User
export const getUserStores = async (req, res) => {
    try {
        const userId = req.user.id
        const search = req.query.search || ''
        const sortBy = req.query.sortBy || 'id'
        const order = req.query.order === 'asc' ? 'ASC' : 'DESC'

        const allowedSortColumns = {
            id: 's.id',
            name: 's.name',
            address: 's.address',
            averageRating: 'averageRating'
        }

        const sortColumn = allowedSortColumns[sortBy] || 's.id'

        const [stores] = await db.query(
            `SELECT
                s.*,
                ROUND(AVG(allRatings.rating), 1) AS averageRating,
                COUNT(allRatings.id) AS totalRatings,
                MAX(
                    CASE
                        WHEN allRatings.user_id = ?
                        THEN allRatings.rating
                        ELSE NULL
                    END
                ) AS userRating
             FROM stores s
             LEFT JOIN ratings allRatings
                ON s.id = allRatings.store_id
             WHERE s.name LIKE ?
                OR s.category LIKE ?
                OR s.address LIKE ?
             GROUP BY s.id
             ORDER BY ${sortColumn} ${order}`,
            [
                userId,
                `%${search}%`,
                `%${search}%`,
                `%${search}%`
            ]
        )

        return res.status(200).json({
            success: true,
            stores
        })

    } catch (error) {
        console.error('Get User Stores Error:', error)

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch stores'
        })
    }
}
