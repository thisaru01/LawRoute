export const validateCreateArticleInput = ({
  user,
  title,
  content,
  category,
  imageUrl,
  imagecardUrl,
}) => {
  if (!user || !user._id) {
    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }

  const role = user.role;
  if (!["admin", "lawyer"].includes(role)) {
    const err = new Error("Only admins or lawyers can create articles");
    err.status = 403;
    throw err;
  }

  if (!title || !content || !category || !imagecardUrl || !imageUrl) {
    const err = new Error(
      "Title, content, category, image, and imagecard files are required",
    );
    err.status = 400;
    throw err;
  }
};
