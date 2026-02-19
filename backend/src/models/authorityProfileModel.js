const mongoose = require("mongoose");

const { Schema } = mongoose;

const authorityProfileSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        managedCategory: {
            type: String,
            enum: ["land", "police", "harassment", "public_services", "other"],
            required: true,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model("AuthorityProfile", authorityProfileSchema);
