const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const ALLOWED_ROOT_FIELDS = [
	"basicInfo",
	"experience",
	"educationQualifications",
	"isFree",
	"profilePhoto",
	"professionalTitle",
	"contactInfo",
	"bio",
	"languages",
	"practiceAreas",
	"phone",
	"officeAddress",
	"location",
	"yearsOfExperience",
];

const ALLOWED_BASIC_FIELDS = [
	"profilePhoto",
	"professionalTitle",
	"contactInfo",
	"bio",
	"languages",
	"practiceAreas",
	"isFree",
];

const ALLOWED_EXPERIENCE_FIELDS = ["totalYearsExperience", "workHistory"];

const ALLOWED_EDUCATION_FIELDS = [
	"education",
	"certifications",
	"barRegistrationNumber",
	"memberships",
];

const isObject = (value) => value && typeof value === "object" && !Array.isArray(value);

const hasOnlyAllowedKeys = (obj, allowedFields) =>
	Object.keys(obj).every((key) => allowedFields.includes(key));

const validateUpdateLawyerProfile = (req, res, next) => {
	const { body } = req;

	if (!isObject(body)) {
		return res.status(400).json({
			success: false,
			message: "Request body must be a JSON object",
		});
	}

	if (Object.keys(body).length === 0) {
		return res.status(400).json({
			success: false,
			message: "Request body cannot be empty",
		});
	}

	if (!hasOnlyAllowedKeys(body, ALLOWED_ROOT_FIELDS)) {
		return res.status(400).json({
			success: false,
			message: "Request contains invalid fields",
		});
	}

	if (hasOwn(body, "basicInfo")) {
		if (!isObject(body.basicInfo)) {
			return res.status(400).json({
				success: false,
				message: "basicInfo must be an object",
			});
		}

		if (!hasOnlyAllowedKeys(body.basicInfo, ALLOWED_BASIC_FIELDS)) {
			return res.status(400).json({
				success: false,
				message: "basicInfo contains invalid fields",
			});
		}
	}

	if (hasOwn(body, "experience")) {
		if (!isObject(body.experience)) {
			return res.status(400).json({
				success: false,
				message: "experience must be an object",
			});
		}

		if (!hasOnlyAllowedKeys(body.experience, ALLOWED_EXPERIENCE_FIELDS)) {
			return res.status(400).json({
				success: false,
				message: "experience contains invalid fields",
			});
		}
	}

	if (hasOwn(body, "educationQualifications")) {
		if (!isObject(body.educationQualifications)) {
			return res.status(400).json({
				success: false,
				message: "educationQualifications must be an object",
			});
		}

		if (
			!hasOnlyAllowedKeys(
				body.educationQualifications,
				ALLOWED_EDUCATION_FIELDS,
			)
		) {
			return res.status(400).json({
				success: false,
				message: "educationQualifications contains invalid fields",
			});
		}
	}

	return next();
};

module.exports = {
	validateUpdateLawyerProfile,
};