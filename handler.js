// Packages
const mongoose = require("mongoose");
const fs = require("fs");
const crypto = require("node:crypto");
const logger = require("./logger");

// Connect to MongoDB
mongoose.set("strictQuery", true);

this.mongo = mongoose
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
}

// Users
class Users {
	static async create(
		Username,
		UserID,
		Bio,
		Avatar,
		CreatedAt,
		Connections,
		Notifications
	) {
		const doc = new schemas["user"]({
			Username,
			UserID,
			Bio,
			Avatar,
			CreatedAt,
			Connections,
			Notifications,
		});

		doc.save()
			.then(() => {
				logger.info("200", "MongoDB Document Created", {});
				return data;
			})
			.catch((err) => {
				logger.error("400", `MongoDB Document Creation Error`, err);
				return err;
			});
	}

	static async get(data) {
		const doc = schemas["user"].findOne(data);
		return doc;
	}

	static async find(data) {
		const doc = schemas["user"].find(data);
		return doc;
	}

	static async update(id, data) {
		schemas["user"].updateOne(
			{
				UserID: id,
			},
			data,
			(err, doc) => {
				if (err) return err;
				if (doc) return true;
			}
		);
	}

	static async delete(data) {
		return schemas["user"].deleteOne(data);
	}
}

// Tokens
class Tokens {
	static async create(UserID, Token, Method) {
		const doc = new schemas["token"]({
			UserID,
			CreatedAt: new Date(),
			Token,
			Method,
		});

		doc.save()
			.then(() => {
				logger.info("200", "MongoDB Document Created", {});
				return data;
			})
			.catch((err) => {
				logger.error("400", `MongoDB Document Creation Error`, err);
				return err;
			});
	}

	static async get(token) {
		const tokenData = await schemas["token"].findOne({
			Token: token,
		});

		if (tokenData) {
			const user = schemas["user"].findOne({
				UserID: tokenData.UserID,
			});

			if (user) {
				user["token"] = token;

				return user;
			} else
				return {
					error: "That user does not exist!",
				};
		} else
			return {
				error: "The specified token is invalid.",
			};
	}

	static async getAllUserTokens(UserID) {
		const doc = schemas["token"].find({
			UserID,
		});

		return doc;
	}

	static async delete(data) {
		return schemas["token"].deleteOne(data);
	}
}

// Posts
class Posts {
	static async create(UserID, Caption, Image, Plugins, Type) {
		const doc = new schemas["post"]({
			UserID,
			Caption,
			Image,
			Plugins,
			Type,
			CreatedAt: new Date(),
			PostID: crypto.randomUUID(),
		});

		doc.save()
			.then(() => {
				logger.info("200", "MongoDB Document Created", {});
				return data;
			})
			.catch((err) => {
				logger.error("400", `MongoDB Document Creation Error`, err);
				return err;
			});
	}

	static async get(PostID) {
		let post = await schemas["post"].findOne({
			PostID: PostID,
		});

		if (post) {
			const user = schemas["user"].findOne({
				UserID: post.UserID,
			});

			if (user) {
				post.user = user;

				return post;
			} else
				return {
					error: "The specified post id is invalid.",
				};
		} else
			return {
				error: "The specified post id is invalid.",
			};
	}

	static async listAllPosts(type) {
		let posts = [];

		const docs = schemas["post"].find({
			Type: type,
		});

		docs.map((i) => {
			const user = schemas["user"].findOne({
				UserID: i.UserID,
			});

			i.user = user;

			posts.push(i);
		});
	}

	static async getAllUserPosts(UserID, Type) {
		const docs = schemas["post"].find({
			UserID,
			Type,
		});

		return docs;
	}

	static async delete(PostID, UserID) {
		return schemas["post"].deleteOne({
			PostID,
			UserID,
		});
	}
}

// Expose Functions
module.exports = {
	Users,
	Tokens,
	Posts,
};
