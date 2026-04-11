import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import handlebars from "handlebars";

// __dirname for ES Modules to ensure absolute path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Register a Handlebars helper to format raw backend strings (e.g., "public_services" -> "Public Services")
handlebars.registerHelper('formatText', function (text) {
  if (!text) return "";
  return text.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
});

// Register a Handlebars helper to dynamically inject the current year into footers
handlebars.registerHelper('currentYear', function () {
  return new Date().getFullYear();
});

// Helper to reliably load and compile templates into the master layout
function compileTemplate(fileName, data) {
  // 1. Compile the specific inner HTML
  const templatePath = path.join(__dirname, "templates", "civilIssues", fileName);
  const templateSource = fs.readFileSync(templatePath, "utf-8");
  const template = handlebars.compile(templateSource);
  const innerHtml = template(data);

  // 2. Wrap it inside the master layout
  const layoutPath = path.join(__dirname, "templates", "layouts", "mainLayout.hbs");
  const layoutSource = fs.readFileSync(layoutPath, "utf-8");
  const layout = handlebars.compile(layoutSource);
  
  return layout({ body: innerHtml });
}

/**
 * Builds the acknowledgement email sent to a citizen after they submit a new civil issue.
 */
export function issueSubmittedTemplate({ category, district, exactLocation, postalAreaOrZip, whatHappened, whenItHappened, impactOnPeople, contactNumber }) {
  const html = compileTemplate("issueSubmittedCitizen.hbs", {
    category,
    district,
    exactLocation,
    postalAreaOrZip,
    whatHappened,
    whenItHappened,
    impactOnPeople,
    contactNumber,
  });
  return {
    subject: `Civil Issue Received — LawRoute`,
    html,
  };
}

/**
 * Builds the confirmation email sent to a citizen after they update their civil issue.
 */
export function issueUpdatedCitizenTemplate({ category, district, exactLocation, postalAreaOrZip, whatHappened, whenItHappened, impactOnPeople, contactNumber }) {
  const html = compileTemplate("issueUpdatedCitizen.hbs", {
    category,
    district,
    exactLocation,
    postalAreaOrZip,
    whatHappened,
    whenItHappened,
    impactOnPeople,
    contactNumber,
  });
  return {
    subject: `Your Civil Issue Has Been Updated — LawRoute`,
    html,
  };
}

/**
 * Builds the email sent to the citizen when an authority updates their issue's status.
 */
export function statusUpdateTemplate({
  category,
  district,
  oldStatus,
  newStatus,
  note,
  resolutionSummary,
}) {
  const statusColor = {
    pending: "#f59e0b",
    in_progress: "#3b82f6",
    resolved: "#22c55e",
    rejected: "#ef4444",
  };

  const color = statusColor[newStatus] || "#6b7280";

  const html = compileTemplate("authorityStatusUpdate.hbs", {
    category,
    district,
    oldStatus,
    newStatus,
    note,
    resolutionSummary,
    color,
  });

  return {
    subject: `Your Civil Issue Status Has Been Updated — LawRoute`,
    html,
  };
}
