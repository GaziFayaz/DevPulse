import { Pool } from "pg";
import config from "../config";

export const pool = new Pool({
	connectionString: config.connection_string,
});

export const initDB = async () => {
	try {
		await pool.query(`
				CREATE TABLE IF NOT EXISTS users (
					id SERIAL PRIMARY KEY,
					name VARCHAR(50) NOT NULL,
					email VARCHAR(25) NOT NULL UNIQUE,
					password VARCHAR(20) NOT NULL,
					role user_role NOT NULL DEFAULT 'contributor',
					created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
					updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
				);
		`)

		await pool.query(`
				CREATE TABLE IF NOT EXISTS issues (
					id SERIAL PRIMARY KEY,
					title VARCHAR(100) NOT NULL,
					description TEXT,
					type issue_type NOT NULL,
					status issue_status NOT NULL DEFAULT 'open',
					reporter_id INT REFERENCES users(id) ON DELETE SET NULL,
					created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
					updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
				);
			`)
		console.log("Database connection successful");
	} catch (error) {
		console.error("Error connecting to database:", error);
	}
};
