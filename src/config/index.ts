import dotevn from "dotenv";

dotevn.config({
	path: process.cwd() + "/.env",
});

const config = {
	connection_string: process.env.CONNECTION_STRING || "",
	port: process.env.PORT || "3000",
};

export default config;
