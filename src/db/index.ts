import { Pool } from "pg";
import config from "../config";

export const pool = new Pool({
	connectionString: config.connection_string,
});

export const initDB = async () => {
	try {
		console.log("Database connection successful");
	} catch (error) {
		console.error("Error connecting to database:", error);
	}
};
