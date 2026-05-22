import app from "./app";
import { initDB } from "./db";

const main = () => {
	initDB();
	app.listen(3000, () => {
		console.log("Server is running on port 3000");
	});
};

main();