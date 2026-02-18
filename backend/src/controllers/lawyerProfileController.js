const User = require("../models/userModel");
const LawyerProfile = require("../models/lawyerProfileModel");
const { findAllLawyerProfiles } = require("../services/lawyerProfileService");

const ALLOWED_BASIC_FIELDS = [
	"profilePhoto",
	"professionalTitle",
	"contactInfo",
	"bio",
	"languages",
	"practiceAreas",
];

const ALLOWED_EXPERIENCE_FIELDS = ["totalYearsExperience", "workHistory"];

const ALLOWED_EDUCATION_FIELDS = [
	"education",
	"certifications",
	"barRegistrationNumber",
	"memberships",
];

const LEGACY_BASIC_FIELD_MAP = {
	professionalTitle: "professionalTitle",
	profilePhoto: "profilePhoto",
	languages: "languages",
	bio: "bio",
};

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const ensureProfileSections = (lawyerProfile) => {
	if (!lawyerProfile.basicInfo) {
		lawyerProfile.basicInfo = {};
	}

	if (!lawyerProfile.experience) {
		lawyerProfile.experience = {};
	}

	if (!lawyerProfile.educationQualifications) {
		lawyerProfile.educationQualifications = {};
	}
};

const applySectionFields = (source, allowedFields, target) => {
	if (!source || typeof source !== "object") {
		return false;
	}

	let applied = false;

	allowedFields.forEach((field) => {
		if (hasOwn(source, field)) {
			target[field] = source[field];
			applied = true;
		}
	});

	return applied;
};

const applyStructuredPayload = (lawyerProfile, body) => {
	const { basicInfo, experience, educationQualifications } = body;

	let applied = false;

	if (applySectionFields(basicInfo, ALLOWED_BASIC_FIELDS, lawyerProfile.basicInfo)) {
		applied = true;
	}

	if (
		applySectionFields(
			experience,
			ALLOWED_EXPERIENCE_FIELDS,
			lawyerProfile.experience,
		)
	) {
		applied = true;
	}

	if (
		applySectionFields(
			educationQualifications,
			ALLOWED_EDUCATION_FIELDS,
			lawyerProfile.educationQualifications,
		)
	) {
		applied = true;
	}

	if (basicInfo && typeof basicInfo === "object" && hasOwn(basicInfo, "isFree")) {
		lawyerProfile.isFree = Boolean(basicInfo.isFree);
		applied = true;
	}

	if (hasOwn(body, "isFree")) {
		lawyerProfile.isFree = Boolean(body.isFree);
		applied = true;
	}

	return applied;
};

const applyLegacyContactInfo = (lawyerProfile, body) => {
	if (!hasOwn(body, "phone") && !hasOwn(body, "officeAddress") && !hasOwn(body, "location")) {
		return false;
	}

	const currentContactInfo =
		lawyerProfile.basicInfo.contactInfo &&
		typeof lawyerProfile.basicInfo.contactInfo === "object"
			? lawyerProfile.basicInfo.contactInfo
			: {};

	lawyerProfile.basicInfo.contactInfo = {
		...currentContactInfo,
		...(hasOwn(body, "phone") && { phone: body.phone }),
		...(hasOwn(body, "officeAddress") && {
			officeAddress: body.officeAddress,
		}),
		...(hasOwn(body, "location") && { location: body.location }),
	};

	return true;
};

const applyLegacyPayload = (lawyerProfile, body) => {
	let applied = false;

	Object.keys(LEGACY_BASIC_FIELD_MAP).forEach((legacyField) => {
		if (hasOwn(body, legacyField)) {
			lawyerProfile.basicInfo[LEGACY_BASIC_FIELD_MAP[legacyField]] = body[legacyField];
			applied = true;
		}
	});

	if (applyLegacyContactInfo(lawyerProfile, body)) {
		applied = true;
	}

	if (hasOwn(body, "practiceAreas")) {
		const areas = body.practiceAreas;
		lawyerProfile.basicInfo.practiceAreas = Array.isArray(areas)
			? areas.map((item) =>
					typeof item === "string"
						? { name: item, level: "intermediate" }
						: item,
			  )
			: [];
		applied = true;
	}

	if (hasOwn(body, "yearsOfExperience")) {
		lawyerProfile.experience.totalYearsExperience = body.yearsOfExperience;
		applied = true;
	}

	return applied;
};

const computeProfileCompleted = (lawyerProfile) => {
	const basic = lawyerProfile.basicInfo || {};
	const exp = lawyerProfile.experience || {};
	const hasPracticeAreas =
		Array.isArray(basic.practiceAreas) && basic.practiceAreas.length > 0;

	return Boolean(
		basic.professionalTitle &&
			typeof exp.totalYearsExperience === "number" &&
			exp.totalYearsExperience >= 0 &&
			basic.bio &&
			hasPracticeAreas,
	);
};

exports.getAllLawyerProfiles = async (req, res, next) => {
	try {
		const lawyerProfiles = await findAllLawyerProfiles();

		return res.status(200).json({
			success: true,
			count: lawyerProfiles.length,
			lawyerProfiles,
		});
	} catch (error) {
		next(error);
	}
};

exports.updateLawyerProfile = async (req, res, next) => {
	try {
		const user = await User.findById(req.user._id);

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		if (user.role !== "lawyer") {
			return res.status(403).json({
				success: false,
				message: "Only lawyers can update lawyer profile",
			});
		}

		let lawyerProfile = await LawyerProfile.findOne({ user: user._id });

		if (!lawyerProfile) {
			lawyerProfile = await LawyerProfile.create({
				user: user._id,
			});
		}

		ensureProfileSections(lawyerProfile);

		let hasValidField = applyStructuredPayload(lawyerProfile, req.body);

		if (!hasValidField) {
			hasValidField = applyLegacyPayload(lawyerProfile, req.body);
		}

		if (!hasValidField) {
			return res.status(400).json({
				success: false,
				message: "No valid fields provided for update",
			});
		}

		lawyerProfile.profileCompleted = computeProfileCompleted(lawyerProfile);

		await lawyerProfile.save();

		return res.status(200).json({
			success: true,
			message: "Lawyer profile updated successfully",
			lawyerProfile,
		});
	} catch (error) {
		next(error);
	}
};

