
import express from 'express'

import {
    addStore,
    addStoreValidation,
    getAllStores
} from '../controllers/storeController.js'

import { verifyToken } from '../middleware/authMiddleware.js'
import { authorizeRole } from '../middleware/roleMiddleware.js'
import upload from '../middleware/uploadMiddleware.js'

const router = express.Router()

// Test Store Route
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Store route is working'
    })
})

// Add New Store with Image Upload
router.post(
    '/',
    verifyToken,
    authorizeRole('admin'),
    upload.single('image'),
    addStoreValidation,
    addStore
)

// Get All Stores
router.get(
    '/',
    verifyToken,
    authorizeRole('admin'),
    getAllStores
)

export default router
