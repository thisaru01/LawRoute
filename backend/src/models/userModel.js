const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin", "lawyer", "authority"],
      default: "user",
    },
    // Lawyer-specific fields (used when role === "lawyer")
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
    },
    // Only meaningful for lawyers; set via pre-save hook
    isVerified: {
      type: Boolean,
    },
    isFree: {
      type: Boolean,
    },
  },
  { timestamps: true },
);

// Hash password and set lawyer defaults before saving
userSchema.pre("save", async function () {
  // Hash password if modified
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Set lawyer-only defaults
  if (this.role === "lawyer") {
    if (!this.expertise) {
      this.expertise = "general";
    }

    if (typeof this.isVerified === "undefined") {
      this.isVerified = false;
    }

    if (typeof this.isFree === "undefined") {
      this.isFree = false;
    }
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
