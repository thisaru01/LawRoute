const mongoose = require("mongoose");

const { Schema } = mongoose;

const LawyerProfileSchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			unique: true,
		},
		expertise: {
			type: String,
			enum: [
				"general",
				"civil",
				"criminal",
				"commercial",
				"corporate",
				"family",
				"land",
				"labour",
				"tax",
				"constitutional",
				"administrative",
				"environmental",
				"intellectual_property",
			],
			default: "general",
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		isFree: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model("LawyerProfile", LawyerProfileSchema);

