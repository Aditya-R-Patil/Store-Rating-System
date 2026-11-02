
import db from '../config/db.js'

// Owner Dashboard
export const getOwnerDashboard = async (req, res) => {
    try {
        const ownerId = req.user.id

        const [stores] = await db.query(
            `SELECT
                s.*,
                COALESCE(ROUND(AVG(r.rating), 1), 0) AS averageRating,
                COUNT(r.id) AS totalRatings
             FROM stores s
             LEFT JOIN ratings r ON s.id = r.store_id
             WHERE s.owner_id = ?
             GROUP BY s.id
             ORDER BY s.id DESC`,
            [ownerId]
        )

        for (const store of stores) {
            const [ratings] = await db.query(
                `SELECT
                    r.id,
                    r.rating,
                    r.created_at,
                    u.name AS userName,
                    u.email AS userEmail
                 FROM ratings r
                 JOIN users u ON r.user_id = u.id
                 WHERE r.store_id = ?
                 ORDER BY r.created_at DESC`,
                [store.id]
            )

            store.ratings = ratings
        }

        res.status(200).json({
            success: true,
            totalStores: stores.length,
            stores
        })

    } catch (error) {
        console.error(error)

        res.status(500).json({
            success: false,
            message: 'Unable to fetch owner dashboard'
        })
    }
}


// Get All Stores Assigned to Owner
export const getOwnerStore = async (req, res) => {
    try {
        const ownerId = req.user.id

        const [stores] = await db.query(
            `SELECT
                s.*,
                COALESCE(ROUND(AVG(r.rating), 1), 0) AS averageRating,
                COUNT(r.id) AS totalRatings
             FROM stores s
             LEFT JOIN ratings r ON s.id = r.store_id
             WHERE s.owner_id = ?
             GROUP BY s.id
             ORDER BY s.id DESC`,
            [ownerId]
        )

        res.status(200).json({
            success: true,
            totalStores: stores.length,
            stores
        })

    } catch (error) {
        console.error(error)

        res.status(500).json({
            success: false,
            message: 'Unable to fetch store details'
        })
    }
}


// Get Users Who Rated Owner's Stores
export const getOwnerRatings = async (req, res) => {
    try {
        const ownerId = req.user.id

        const [ratings] = await db.query(
            `SELECT
                r.id,
                r.rating,
                r.created_at,
                u.name AS userName,
                u.email AS userEmail,
                s.id AS storeId,
                s.name AS storeName
             FROM ratings r
             JOIN users u ON r.user_id = u.id
             JOIN stores s ON r.store_id = s.id
             WHERE s.owner_id = ?
             ORDER BY r.created_at DESC`,
            [ownerId]
        )

        res.status(200).json({
            success: true,
            totalRatings: ratings.length,
            ratings
        })

    } catch (error) {
        console.error(error)

        res.status(500).json({
            success: false,
            message: 'Unable to fetch owner ratings'
        })
    }
}
