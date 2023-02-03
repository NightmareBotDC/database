// Packages
const mongoose = require("mongoose");
const fs = require("fs");
const logger = require("./logger");

// Connect to MongoDB
mongoose.set("strictQuery", true);

mongoose
	.connect(
		"mongodb+srv://select:PPA10082@nightmareproject.5en4i6u.mongodb.net/nightmarebot?retryWrites=true&w=majority"
	)
	.then(() => {
		logger.success("Database", "Connected!");
    })
	.catch((err) => {
		logger.error("Database", `Failed to connect\nError: ${err}`);
	});

// Schemas
const schemaFiles = fs
	.readdirSync("./database/schemas")
	.filter((file) => file.endsWith(".js"));
const schemas = {};

for (const fileName of schemaFiles) {
	const file = require(`./schemas/${fileName}`);
	schemas[file.name] = mongoose.model(file.name, file.schema);
};

// Users
class Users {};

// Tokens
class Tokens {};

// Expose Functions
module.exports = {
    Users,
    Tokens
};