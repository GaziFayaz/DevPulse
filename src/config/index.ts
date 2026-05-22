import dotevn from "dotenv";

dotevn.config({
	path: process.cwd() + "/.env",
});

const config = {
	connection_string: process.env.CONNECTION_STRING || "",
	port: process.env.PORT || "3000",
	jwt_secret: process.env.JWT_SECRET || "devpulse-secret-key",
	jwt_expires_in: process.env.JWT_EXPIRES_IN || "7d",
};

export default config;
