const {
	findAllLawyerProfiles,
	findLawyerProfileByUser,
	updateLawyerProfileByUser,
} = require("../services/lawyerProfileService");

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
		const lawyerProfile = await updateLawyerProfileByUser(req.user, req.body);

		return res.status(200).json({
			success: true,
			message: "Lawyer profile updated successfully",
			lawyerProfile,
		});
	} catch (error) {
		next(error);
	}
};

exports.getMyLawyerProfile = async (req, res, next) => {
	try {
		const lawyerProfile = await findLawyerProfileByUser(req.user);

		return res.status(200).json({
			success: true,
			lawyerProfile,
		});
	} catch (error) {
		next(error);
	}
};

