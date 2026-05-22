import { Pool } from "pg";
import config from "../config";

export const pool = new Pool({
	connectionString: config.connection_string,
});

export const initDB = async () => {
	try {
		await pool.query(`DROP TABLE IF EXISTS issues, users CASCADE`);
		await pool.query(`DROP TYPE IF EXISTS user_role, issue_type, issue_status`);

		await pool.query(`
			CREATE TYPE user_role AS ENUM ('contributor', 'maintainer');
			CREATE TYPE issue_type AS ENUM ('bug', 'feature_request');
			CREATE TYPE issue_status AS ENUM ('open', 'in_progress', 'resolved');
		`);

		await pool.query(`
			CREATE TABLE users (
				id SERIAL PRIMARY KEY,
				name VARCHAR(255) NOT NULL,
				email VARCHAR(255) NOT NULL UNIQUE,
				password VARCHAR(60) NOT NULL,
				role user_role NOT NULL DEFAULT 'contributor',
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			);
		`);

		await pool.query(`
			CREATE TABLE issues (
				id SERIAL PRIMARY KEY,
				title VARCHAR(150) NOT NULL,
				description TEXT NOT NULL CHECK (LENGTH(description) >= 20),
				type issue_type NOT NULL,
				status issue_status NOT NULL DEFAULT 'open',
				reporter_id INT,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			);
		`);

		console.log("Database connection successful");
	} catch (error) {
		console.error("Error connecting to database:", error);
	}
};
