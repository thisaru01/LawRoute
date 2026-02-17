const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const workHistorySchema = new mongoose.Schema(
  {
    lawFirm: { type: String, trim: true, maxlength: 150 },
    position: { type: String, trim: true, maxlength: 100 },
    startDate: { type: Date },
    endDate: { type: Date },
    responsibilities: { type: String, trim: true, maxlength: 1000 },
    majorCasesSummary: { type: String, trim: true, maxlength: 1000 },
  },
  { _id: false },
);

const educationSchema = new mongoose.Schema(
  {
    degree: { type: String, trim: true, maxlength: 100 },
    institute: { type: String, trim: true, maxlength: 150 },
    graduationYear: { type: Number, min: 1900 },
  },
  { _id: false },
);

const certificationSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, maxlength: 120 },
    issuer: { type: String, trim: true, maxlength: 120 },
    year: { type: Number, min: 1900 },
  },
  { _id: false },
);

const practiceAreaSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, maxlength: 80 },
    level: {
      type: String,
      enum: ["expert", "intermediate"],
      default: "intermediate",
    },
  },
  { _id: false },
);

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
    // Only meaningful for lawyers; set via pre-save hook
    isVerified: {
      type: Boolean,
    },
    lawyerProfile: {
      basicInfo: {
        profilePhoto: { type: String, trim: true },
        professionalTitle: { type: String, trim: true, maxlength: 100 },
        phone: { type: String, trim: true },
        officeAddress: { type: String, trim: true, maxlength: 300 },
        location: { type: String, trim: true, maxlength: 120 },
        languages: { type: [String], default: [] },
        isFree: { type: Boolean, default: false },
        bio: { type: String, trim: true, maxlength: 2000 },
        practiceAreas: { type: [practiceAreaSchema], default: [] },
      },
      experience: {
        totalYearsExperience: { type: Number, min: 0 },
        workHistory: { type: [workHistorySchema], default: [] },
      },
      educationQualifications: {
        education: { type: [educationSchema], default: [] },
        certifications: { type: [certificationSchema], default: [] },
        barRegistrationNumber: { type: String, trim: true, maxlength: 60 },
        memberships: { type: [String], default: [] },
      },
    },
    profileCompleted: {
      type: Boolean,
      default: false,
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
    if (typeof this.isVerified === "undefined") {
      this.isVerified = false;
    }

    if (!this.lawyerProfile) {
      this.lawyerProfile = {};
    }

    if (!this.lawyerProfile.basicInfo) {
      this.lawyerProfile.basicInfo = {};
    }

    if (typeof this.lawyerProfile.basicInfo.isFree === "undefined") {
      this.lawyerProfile.basicInfo.isFree = false;
    }
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
