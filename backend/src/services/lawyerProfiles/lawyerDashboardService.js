import ConsultationRequest from "../../models/consultation/consultationRequestModel.js";
import Case from "../../models/case/caseModel.js";
import Article from "../../models/articles/articleModel.js";
import LawyerProfile from "../../models/lawyerProfiles/lawyerProfileModel.js";
import User from "../../models/userModel.js";

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

  const user = await User.findById(lawyerId).select("name profilePhoto").lean();

  // Define completion criteria based on lawyerProfileService.js logic
  const DEFAULT_PHOTO = "https://res.cloudinary.com/lawroute/image/upload/v1771770529/profile_pic_placeholder_co6aye.png";
  
  const sections = [
    { id: "photo", label: "Professional Photo", isCompleted: !!(user?.profilePhoto && user.profilePhoto !== DEFAULT_PHOTO) },
    { id: "title", label: "Professional Title", isCompleted: !!lawyerProfile?.basicInfo?.professionalTitle },
    { id: "bio", label: "Professional Bio", isCompleted: !!(lawyerProfile?.basicInfo?.bio && lawyerProfile.basicInfo.bio.length >= 50) },
    { id: "contact", label: "Contact Details", isCompleted: !!(lawyerProfile?.basicInfo?.contactInfo?.phone && lawyerProfile?.basicInfo?.contactInfo?.location) },
    { id: "practice", label: "Practice Areas", isCompleted: !!(lawyerProfile?.basicInfo?.practiceAreas?.length > 0) },
    { id: "expertise", label: "Primary Expertise", isCompleted: !!(lawyerProfile?.expertise && lawyerProfile.expertise !== "general") },
    { id: "education", label: "Education Records", isCompleted: !!(lawyerProfile?.educationQualifications?.education?.length > 0) },
    { id: "memberships", label: "Memberships", isCompleted: !!(lawyerProfile?.memberships?.length > 0) },
    { id: "bar", label: "Bar Registration", isCompleted: !!lawyerProfile?.barRegistrationNumber },
  ];

  const completedCount = sections.filter(s => s.isCompleted).length;
  const completionPercentage = Math.round((completedCount / sections.length) * 100);

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
      completionPercentage,
      verificationStatus: lawyerProfile?.verificationStatus || "pending",
      barRegistrationNumber: lawyerProfile?.barRegistrationNumber || null,
      sections,
      nextAction: sections.find(s => !s.isCompleted)?.label || "None",
    },
  };
}
