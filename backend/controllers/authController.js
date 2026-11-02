
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { body, validationResult } from 'express-validator'
import { createUser, findUserByEmail } from '../models/userModel.js'
import db from '../config/db.js'

export const signupValidation = [
    body('name')
        .trim()
        .isLength({ min: 20, max: 60 })
        .withMessage('Name must be between 20 and 60 characters'),

    body('email')
        .trim()
        .isEmail()
        .withMessage('Enter a valid email'),

    body('address')
        .trim()
        .notEmpty()
        .withMessage('Address is required')
        .isLength({ max: 400 })
        .withMessage('Address cannot exceed 400 characters'),

    body('password')
        .isLength({ min: 8, max: 16 })
        .matches(/^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/)
        .withMessage('Password must contain 8-16 characters, one uppercase letter and one special character')
]

export const signup = async (req, res) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            })
        }

        const { name, email, address, password } = req.body

        const existingUser = await findUserByEmail(email.trim())

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email already registered'
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await createUser(
            name.trim(),
            email.trim(),
            address.trim(),
            hashedPassword,
            'user'
        )

        res.status(201).json({
            success: true,
            message: 'User registered successfully'
        })

    } catch (error) {
        console.error(error)

        res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            })
        }

        const user = await findUserByEmail(email)

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            })
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        )

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })

    } catch (error) {
        console.error(error)

        res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
}

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Both passwords are required'
            })
        }

        if (
            newPassword.length < 8 ||
            newPassword.length > 16 ||
            !/[A-Z]/.test(newPassword) ||
            !/[^A-Za-z0-9]/.test(newPassword)
        ) {
            return res.status(400).json({
                success: false,
                message: 'New password must be 8-16 characters with uppercase and special character'
            })
        }

        const [rows] = await db.query(
            'SELECT password FROM users WHERE id = ?',
            [req.user.id]
        )

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        const isMatch = await bcrypt.compare(
            currentPassword,
            rows[0].password
        )

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await db.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, req.user.id]
        )

        res.json({
            success: true,
            message: 'Password changed successfully'
        })

    } catch (error) {
        console.error(error)

        res.status(500).json({
            success: false,
            message: 'Unable to change password'
        })
    }
}
