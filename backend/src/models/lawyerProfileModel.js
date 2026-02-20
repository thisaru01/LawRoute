import mongoose from "mongoose";

const { Schema } = mongoose;

const workHistorySchema = new Schema(
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

const educationSchema = new Schema(
  {
    degree: { type: String, trim: true, maxlength: 100 },
    institute: { type: String, trim: true, maxlength: 150 },
    graduationYear: { type: Number, min: 1900 },
  },
  { _id: false },
);

const certificationSchema = new Schema(
  {
    title: { type: String, trim: true, maxlength: 120 },
    issuer: { type: String, trim: true, maxlength: 120 },
    year: { type: Number, min: 1900 },
  },
  { _id: false },
);

const practiceAreaSchema = new Schema(
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
    basicInfo: {
      profilePhoto: { type: String, trim: true },
      professionalTitle: { type: String, trim: true, maxlength: 100 },
      contactInfo: { type: Schema.Types.Mixed, default: {} },
      bio: { type: String, trim: true, maxlength: 2000 },
      languages: { type: [String], default: [] },
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
    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model("LawyerProfile", LawyerProfileSchema);
