
import express from 'express'

import {
    signup,
    signupValidation,
    login,
    changePassword
} from '../controllers/authController.js'

import { verifyToken } from '../middleware/authMiddleware.js'

const router = express.Router()

// Signup
router.post('/signup', signupValidation, signup)

// Login
router.post('/login', login)

// Change Password
router.put('/change-password', verifyToken, changePassword)

export default router
