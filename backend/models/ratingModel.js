
import db from '../config/db.js'

const createRating = async (user_id, store_id, rating) => {
    const [result] = await db.query(
        `INSERT INTO ratings (user_id, store_id, rating)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE rating = VALUES(rating)`,
        [user_id, store_id, rating]
    )

    return result
}

const getStoreAverageRating = async (store_id) => {
    const [rows] = await db.query(
        `SELECT AVG(rating) AS averageRating, COUNT(*) AS totalRatings
         FROM ratings
         WHERE store_id = ?`,
        [store_id]
    )

    return rows[0]
}

const getUserRating = async (user_id, store_id) => {
    const [rows] = await db.query(
        `SELECT rating FROM ratings
         WHERE user_id = ? AND store_id = ?`,
        [user_id, store_id]
    )

    return rows[0]
}

const getStoreRatings = async (store_id) => {
    const [rows] = await db.query(
        `SELECT 
            r.id,
            r.rating,
            r.created_at,
            u.name AS user_name,
            u.email AS user_email
         FROM ratings r
         JOIN users u ON r.user_id = u.id
         WHERE r.store_id = ?
         ORDER BY r.created_at DESC`,
        [store_id]
    )

    return rows
}

export {
    createRating,
    getStoreAverageRating,
    getUserRating,
    getStoreRatings
}
