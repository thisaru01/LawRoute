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
  const templatePath = path.join(__dirname, "templates", "password", fileName);
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

export function passwordResetTemplate({ name, resetUrl }) {
  const html = compileTemplate("passwordReset.hbs", { name, resetUrl });

  return {
    subject: `LawRoute Password Reset`,
    html,
  };
}

export default {};
