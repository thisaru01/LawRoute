import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import handlebars from "handlebars";

// __filename / __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure currentYear helper is available for layouts if not already registered
handlebars.registerHelper("currentYear", function () {
  return new Date().getFullYear();
});

function compileTemplate(fileName, data) {
  const templatePath = path.join(
    __dirname,
    "templates",
    "articles",
    fileName,
  );
  const templateSource = fs.readFileSync(templatePath, "utf-8");
  const template = handlebars.compile(templateSource);
  const innerHtml = template(data);

  const layoutPath = path.join(
    __dirname,
    "templates",
    "layouts",
    "mainLayout.hbs",
  );
  const layoutSource = fs.readFileSync(layoutPath, "utf-8");
  const layout = handlebars.compile(layoutSource);

  return layout({ body: innerHtml });
}

// Article status update (published / rejected) notification for the article author
export function articleStatusUpdateTemplate({
  authorName,
  articleTitle,
  status,
  loginUrl,
}) {
  const normalizedStatus = (status || "").toLowerCase();
  const statusLabel =
    normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);

  const isPublished = normalizedStatus === "published";

  const subject = isPublished
    ? "Your Article Was Published — LawRoute"
    : "Your Article Was Rejected — LawRoute";

  const html = compileTemplate("articleStatusUpdate.hbs", {
    authorName,
    articleTitle,
    status: normalizedStatus,
    statusLabel,
    loginUrl,
  });

  return { subject, html };
}
