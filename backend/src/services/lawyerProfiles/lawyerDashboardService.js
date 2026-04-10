import ConsultationRequest from "../../models/consultation/consultationRequestModel.js";
import Case from "../../models/case/caseModel.js";
import Article from "../../models/articles/articleModel.js";
import LawyerProfile from "../../models/lawyerProfiles/lawyerProfileModel.js";

/**
 * Get aggregated dashboard statistics for a specific lawyer.
 * @param {string} lawyerId - The ID of the lawyer (User ID).
 * @returns {Promise<Object>} Dashboard stats object.
 */
export async function getLawyerDashboardStats(lawyerId) {
  // Use Promise.all to fetch all metrics in parallel for efficiency
  const [
    pendingConsultationsCount,
    acceptedConsultationsCount,
    rejectedConsultationsCount,
    openCasesCount,
    closedCasesCount,
    pendingArticlesCount,
    publishedArticlesCount,
    recentConsultations,
    lawyerProfile,
  ] = await Promise.all([
    ConsultationRequest.countDocuments({ lawyer: lawyerId, status: "pending" }),
    ConsultationRequest.countDocuments({ lawyer: lawyerId, status: "accepted" }),
    ConsultationRequest.countDocuments({ lawyer: lawyerId, status: "rejected" }),
    Case.countDocuments({ lawyer: lawyerId, status: "open" }),
    Case.countDocuments({ lawyer: lawyerId, status: "closed" }),
    Article.countDocuments({ author: lawyerId, status: "pending" }),
    Article.countDocuments({ author: lawyerId, status: "published" }),
    ConsultationRequest.find({ lawyer: lawyerId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name profilePhoto"),
    LawyerProfile.findOne({ user: lawyerId }).lean(),
  ]);

  // Calculate profile completion percentage based on stored flag or logic
  // lawyerProfile.profileCompleted is a boolean in this system.
  const profileCompletion = lawyerProfile?.profileCompleted ? 100 : 40; // Defaulting to 40 if not completed for visual feedback

  return {
    stats: {
      consultations: {
        pending: pendingConsultationsCount,
        accepted: acceptedConsultationsCount,
        rejected: rejectedConsultationsCount,
        total: pendingConsultationsCount + acceptedConsultationsCount + rejectedConsultationsCount,
      },
      cases: {
        open: openCasesCount,
        closed: closedCasesCount,
        total: openCasesCount + closedCasesCount,
      },
      articles: {
        pending: pendingArticlesCount,
        published: publishedArticlesCount,
        total: pendingArticlesCount + publishedArticlesCount,
      },
    },
    recentConsultations,
    profileStatus: {
      isCompleted: !!lawyerProfile?.profileCompleted,
      completionPercentage: profileCompletion,
      verificationStatus: lawyerProfile?.verificationStatus || "pending",
      barRegistrationNumber: lawyerProfile?.barRegistrationNumber || null,
    },
  };
}
