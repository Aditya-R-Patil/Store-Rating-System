
import db from '../config/db.js'
import bcrypt from 'bcrypt'
import { body, validationResult } from 'express-validator'

export const getDashboardStats = async (req, res) => {
    try {
        const [userCount] = await db.query(
            'SELECT COUNT(*) AS totalUsers FROM users'
        )

        const [storeCount] = await db.query(
            'SELECT COUNT(*) AS totalStores FROM stores'
        )

        const [ratingCount] = await db.query(
            'SELECT COUNT(*) AS totalRatings FROM ratings'
        )

        res.status(200).json({
            success: true,
            dashboard: {
                totalUsers: userCount[0].totalUsers,
                totalStores: storeCount[0].totalStores,
                totalRatings: ratingCount[0].totalRatings
            }
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: 'Unable to fetch dashboard statistics'
        })
    }
}


export const getAllUsers = async (req, res) => {
    try {
        const {
            search = '',
            role = '',
            sortBy = 'name',
            order = 'ASC'
        } = req.query

        const allowedSortFields = ['name', 'email', 'address', 'role']
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name'
        const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'

        let sql = `
            SELECT id, name, email, address, role, created_at
            FROM users
            WHERE (name LIKE ? OR email LIKE ? OR address LIKE ?)
        `

        const values = [`%${search}%`, `%${search}%`, `%${search}%`]

        if (role) {
            sql += ' AND role = ?'
            values.push(role)
        }

        sql += ` ORDER BY ${sortField} ${sortOrder}`

        const [users] = await db.query(sql, values)

        res.status(200).json({
            success: true,
            totalUsers: users.length,
            users
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: 'Unable to fetch users'
        })
    }
}


// Add User Validation
export const addUserValidation = [
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
        .withMessage('Password must contain uppercase and special character'),

    body('role')
        .isIn(['admin', 'user', 'owner'])
        .withMessage('Invalid user role')
]


// Add User
export const addUser = async (req, res) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            })
        }

        const { name, email, address, password, role } = req.body

        const [existingUser] = await db.query(
            'SELECT id FROM users WHERE email = ?',
            [email.trim()]
        )

        if (existingUser.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Email already registered'
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await db.query(
            `INSERT INTO users (name, email, address, password, role)
             VALUES (?, ?, ?, ?, ?)`,
            [name.trim(), email.trim(), address.trim(), hashedPassword, role]
        )

        res.status(201).json({
            success: true,
            message: 'User created successfully'
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: 'Unable to create user'
        })
    }
}


// Get User Details
export const getUserDetails = async (req, res) => {
    try {
        const { id } = req.params

        const [users] = await db.query(
            `SELECT id, name, email, address, role, created_at
             FROM users WHERE id = ?`,
            [id]
        )

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        const user = users[0]
        let stores = []

        if (user.role === 'owner') {
            const [ownerStores] = await db.query(
                `SELECT s.id, s.name, s.email, s.address,
                    COALESCE(AVG(r.rating), 0) AS averageRating,
                    COUNT(r.id) AS totalRatings
                 FROM stores s
                 LEFT JOIN ratings r ON s.id = r.store_id
                 WHERE s.owner_id = ?
                 GROUP BY s.id`,
                [id]
            )

            stores = ownerStores
        }

        res.status(200).json({
            success: true,
            user,
            stores
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: 'Unable to fetch user details'
        })
    }
}


// Delete User
export const deleteUser = async (req, res) => {
    const connection = await db.getConnection()

    try {
        const { id } = req.params

        if (!/^\d+$/.test(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            })
        }

        if (Number(id) === Number(req.user.id)) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account'
            })
        }

        await connection.beginTransaction()

        const [users] = await connection.query(
            'SELECT id, role FROM users WHERE id = ? FOR UPDATE',
            [id]
        )

        if (users.length === 0) {
            await connection.rollback()
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        const user = users[0]

        if (user.role === 'admin') {
            await connection.rollback()
            return res.status(403).json({
                success: false,
                message: 'Admin accounts cannot be deleted here'
            })
        }

        if (user.role === 'owner') {
            const [stores] = await connection.query(
                'SELECT id FROM stores WHERE owner_id = ?',
                [id]
            )

            for (const store of stores) {
                await connection.query(
                    'DELETE FROM ratings WHERE store_id = ?',
                    [store.id]
                )
            }

            await connection.query(
                'DELETE FROM stores WHERE owner_id = ?',
                [id]
            )
        } else {
            await connection.query(
                'DELETE FROM ratings WHERE user_id = ?',
                [id]
            )
        }

        await connection.query(
            'DELETE FROM users WHERE id = ?',
            [id]
        )

        await connection.commit()

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        })

    } catch (error) {
        await connection.rollback()
        console.error(error)

        res.status(500).json({
            success: false,
            message: 'Unable to delete user'
        })

    } finally {
        connection.release()
    }
}
