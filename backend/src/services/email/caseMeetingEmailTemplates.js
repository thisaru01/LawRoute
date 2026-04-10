import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import handlebars from "handlebars";

// __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

handlebars.registerHelper("currentYear", function () {
  return new Date().getFullYear();
});

function compileTemplate(fileName, data) {
  const templatePath = path.join(__dirname, "templates", "cases", fileName);
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

export function caseMeetingScheduledCitizenTemplate({
  citizenName,
  lawyerName,
  date,
  time,
  method,
  location,
  loginUrl,
}) {
  const html = compileTemplate("caseMeetingScheduledCitizen.hbs", {
    citizenName,
    lawyerName,
    date,
    time,
    method,
    location,
    loginUrl,
  });

  return {
    subject: "New Case Meeting Scheduled — LawRoute",
    html,
  };
}

export function caseMeetingUpdatedCitizenTemplate({
  citizenName,
  lawyerName,
  date,
  time,
  method,
  location,
  loginUrl,
}) {
  const html = compileTemplate("caseMeetingUpdatedCitizen.hbs", {
    citizenName,
    lawyerName,
    date,
    time,
    method,
    location,
    loginUrl,
  });

  return {
    subject: "Case Meeting Updated — LawRoute",
    html,
  };
}

export function caseMeetingCancelledCitizenTemplate({
  citizenName,
  lawyerName,
  date,
  time,
  method,
  location,
  loginUrl,
}) {
  const html = compileTemplate("caseMeetingCancelledCitizen.hbs", {
    citizenName,
    lawyerName,
    date,
    time,
    method,
    location,
    loginUrl,
  });

  return {
    subject: "Case Meeting Cancelled — LawRoute",
    html,
  };
}

export default {};
