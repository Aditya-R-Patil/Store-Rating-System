
import express from 'express'

import {
    getDashboardStats,
    getAllUsers,
    addUser,
    addUserValidation,
    getUserDetails,
    deleteUser
} from '../controllers/adminController.js'

import { verifyToken } from '../middleware/authMiddleware.js'
import { authorizeRole } from '../middleware/roleMiddleware.js'

const router = express.Router()

// Admin Dashboard
router.get(
    '/dashboard',
    verifyToken,
    authorizeRole('admin'),
    getDashboardStats
)

// Get All Users
router.get(
    '/users',
    verifyToken,
    authorizeRole('admin'),
    getAllUsers
)

// Add New User
router.post(
    '/users',
    verifyToken,
    authorizeRole('admin'),
    addUserValidation,
    addUser
)

// Get User Details
router.get(
    '/users/:id',
    verifyToken,
    authorizeRole('admin'),
    getUserDetails
)

// Delete User
router.delete(
    '/users/:id',
    verifyToken,
    authorizeRole('admin'),
    deleteUser
)

export default router
