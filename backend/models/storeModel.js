
import db from '../config/db.js'

const createStore = async (
    name,
    email,
    address,
    owner_id,
    image_url,
    category,
    description,
    contact_number,
    opening_hours,
    website_url,
    location_url
) => {
    const [result] = await db.query(
        `INSERT INTO stores (
            name,
            email,
            address,
            owner_id,
            image_url,
            category,
            description,
            contact_number,
            opening_hours,
            website_url,
            location_url
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            name,
            email,
            address,
            owner_id,
            image_url,
            category,
            description,
            contact_number,
            opening_hours,
            website_url,
            location_url
        ]
    )

    return result
}

const getAllStores = async () => {
    const [rows] = await db.query(
        `SELECT
            s.*,
            u.name AS owner_name,
            ROUND(AVG(r.rating), 1) AS averageRating,
            COUNT(r.id) AS totalRatings
         FROM stores s
         LEFT JOIN users u ON s.owner_id = u.id
         LEFT JOIN ratings r ON s.id = r.store_id
         GROUP BY s.id
         ORDER BY s.id DESC`
    )

    return rows
}

const getStoreById = async (id) => {
    const [rows] = await db.query(
        'SELECT * FROM stores WHERE id = ?',
        [id]
    )

    return rows[0]
}

export { createStore, getAllStores, getStoreById }
