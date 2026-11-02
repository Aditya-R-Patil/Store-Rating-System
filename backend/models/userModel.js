
import db from '../config/db.js'

const createUser = async (name, email, address, password, role = 'user') => {
    const [result] = await db.query(
        `INSERT INTO users (name, email, address, password, role)
         VALUES (?, ?, ?, ?, ?)`,
        [name, email, address, password, role]
    )

    return result
}

const findUserByEmail = async (email) => {
    const [rows] = await db.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
    )

    return rows[0]
}

const getUserById = async (id) => {
    const [rows] = await db.query(
        'SELECT id, name, email, address, role FROM users WHERE id = ?',
        [id]
    )

    return rows[0]
}

export {
    createUser,
    findUserByEmail,
    getUserById
}
