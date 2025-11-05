import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const dropClerkIdIndex = async () => {
	try {
		// Connect to MongoDB
		await mongoose.connect(process.env.MONGODB_URI);
		console.log("Connected to MongoDB");

		// Get the users collection
		const db = mongoose.connection.db;
		const usersCollection = db.collection("users");

		// Check existing indexes
		console.log("\nExisting indexes before cleanup:");
		const indexesBefore = await usersCollection.indexes();
		indexesBefore.forEach((index) => {
			console.log(`- ${index.name}:`, JSON.stringify(index.key));
		});

		// Drop the clerkId_1 index if it exists
		try {
			await usersCollection.dropIndex("clerkId_1");
			console.log("\n✅ Successfully dropped clerkId_1 index");
		} catch (error) {
			if (error.code === 27 || error.codeName === "IndexNotFound") {
				console.log("\n⚠️  clerkId_1 index not found (already removed or never existed)");
			} else {
				throw error;
			}
		}

		// Remove clerkId field from all existing documents
		const result = await usersCollection.updateMany(
			{ clerkId: { $exists: true } },
			{ $unset: { clerkId: "" } }
		);
		console.log(`\n✅ Removed clerkId field from ${result.modifiedCount} documents`);

		// Check indexes after cleanup
		console.log("\nExisting indexes after cleanup:");
		const indexesAfter = await usersCollection.indexes();
		indexesAfter.forEach((index) => {
			console.log(`- ${index.name}:`, JSON.stringify(index.key));
		});

		console.log("\n🎉 Migration completed successfully!");
	} catch (error) {
		console.error("❌ Error during migration:", error);
		process.exit(1);
	} finally {
		await mongoose.connection.close();
		console.log("\nDisconnected from MongoDB");
		process.exit(0);
	}
};

dropClerkIdIndex();
