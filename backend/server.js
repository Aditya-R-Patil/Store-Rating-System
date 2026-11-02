
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import db from './config/db.js'

import authRoutes from './routes/authRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import storeRoutes from './routes/storeRoutes.js'
import ownerRoutes from './routes/ownerRoutes.js'
import ratingRoutes from './routes/ratingRoutes.js'
import userRoutes from './routes/userRoutes.js'

dotenv.config()

const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(cors({
    origin: 'http://localhost:5173'
}))

app.use(express.json())

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/admin/stores', storeRoutes)
app.use('/api/owner', ownerRoutes)
app.use('/api/ratings', ratingRoutes)
app.use('/api/user', userRoutes)

// Home
app.get('/', (req, res) => {
    res.send('Store Rating System Backend Running')
})

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Backend API is working'
    })
})

// Database Test
app.get('/api/db-test', async (req, res) => {
    try {
        const [result] = await db.query('SELECT DATABASE() AS databaseName')

        res.json({
            success: true,
            message: 'MySQL connected successfully',
            database: result[0].databaseName
        })
    } catch (error) {
        console.error(error.message)

        res.status(500).json({
            success: false,
            message: 'Database connection failed'
        })
    }
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
