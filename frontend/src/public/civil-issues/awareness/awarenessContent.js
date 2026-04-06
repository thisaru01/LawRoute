import { CIVIL_ISSUE_CATEGORIES } from "@/constants/civilIssueConstants.js";

export const CIVIL_ISSUE_AWARENESS_CONTENT = {
  land: {
    categoryTitle: "Land & Property",
    intro:
      "Guidance for common land disputes, ownership documentation, and boundary issues.",
    whenToChoose: [
      "Boundary encroachment or illegal occupation",
      "Land deed or title verification disputes",
      "Delays or unfair handling by local land-related offices",
    ],
    reportChecklist: [
      "District and exact location of the property",
      "Short summary of what happened and when",
      "Any deed/survey details you can share",
      "Photos or supporting documents (if available)",
    ],
    faqs: [
      {
        question: "When should I report under Land & Property in this app?",
        answer:
          "Choose this category when the issue is directly related to land ownership, boundaries, or property administration. Add the location clearly and include any deed/survey references to help routing.",
      },
      {
        question: "What evidence is most useful for faster review?",
        answer:
          "Upload clear photos, survey sketches, and relevant document excerpts if available. Even if you do not have full documents, provide key identifiers (plot/lot details and nearby landmarks).",
      },
    ],
    escalation:
      "If your issue remains unchanged for several days, update it with any new evidence and continue tracking status in the app.",
  },
  matrimonial_family: {
    categoryTitle: "Matrimonial & Family",
    intro:
      "Support for marriage, divorce, maintenance, and child custody matters.",
    whenToChoose: [
      "Maintenance-related concerns",
      "Family dispute affecting legal/civil rights",
      "Custody or guardianship-related grievance",
    ],
    reportChecklist: [
      "Basic context without sensitive personal details",
      "Timeline of incidents (dates are important)",
      "District and location relevant to the dispute",
      "Supporting documents where safe and appropriate",
    ],
    faqs: [
      {
        question: "Should I include sensitive personal details in my report?",
        answer:
          "Share only information required to understand and route the grievance. Avoid unnecessary personal identifiers in public-facing details and use attachments carefully.",
      },
      {
        question: "How can I make a matrimonial/family report clearer?",
        answer:
          "Use a short timeline: what happened, when it happened, who is affected, and what outcome you are seeking. Clear chronology helps faster review.",
      },
    ],
    escalation:
      "For urgent personal safety concerns, contact emergency services immediately before relying on app-based follow-up.",
  },
  labour_industrial: {
    categoryTitle: "Labour & Industrial",
    intro:
      "Resources for workplace disputes, wrongful termination, and EPF/ETF claims.",
    whenToChoose: [
      "Workplace rights or contract-related disputes",
      "Salary/benefit process complaints",
      "Termination or disciplinary grievance concerns",
    ],
    reportChecklist: [
      "Employer/organization context (without defamation)",
      "Employment timeline and key dates",
      "Relevant letters/notices (if available)",
      "Impact on livelihood and requested resolution",
    ],
    faqs: [
      {
        question: "What should I include for a labour-related report?",
        answer:
          "Include your role, the issue summary, key dates, and any documented communication. This helps the authority understand whether the matter is procedural, contractual, or rights-related.",
      },
      {
        question: "Can I submit even if I do not have all documents?",
        answer:
          "Yes. Submit with available facts first, then update your issue later with attachments or additional evidence.",
      },
    ],
    escalation:
      "If unresolved, keep the issue updated with new evidence and request a formal progress update through the in-app flow.",
  },
  digital_emerging_rights: {
    categoryTitle: "Digital & Emerging Rights",
    intro:
      "Addressing online harassment, data privacy, and electronic fraud.",
    whenToChoose: [
      "Online harassment or impersonation",
      "Privacy/data misuse concerns",
      "Digital fraud or harmful online content impact",
    ],
    reportChecklist: [
      "Platform/service where incident occurred",
      "URLs/usernames/post IDs if available",
      "Screenshot evidence with timestamps",
      "Clear impact description",
    ],
    faqs: [
      {
        question: "What is the most important evidence for a digital complaint?",
        answer:
          "Screenshots with visible timestamps, account/profile identifiers, links, and message references are the most useful for verification and routing.",
      },
      {
        question: "Should I delete content before reporting?",
        answer:
          "Preserve evidence first (screenshots/links/report IDs), then follow platform safety steps. Evidence quality improves the review process.",
      },
    ],
    escalation:
      "If there is immediate risk of financial or personal harm, use official emergency/cybercrime channels first and then keep this issue updated.",
  },
  police: {
    categoryTitle: "Police & Security Accountability",
    intro:
      "Guidance on dealing with police misconduct, illegal detention, and complaint handling issues.",
    whenToChoose: [
      "Complaint not recorded or acted upon",
      "Alleged misconduct in handling a civil complaint",
      "Unreasonable delay in police follow-up",
    ],
    reportChecklist: [
      "Station/office details if known",
      "Date and summary of interaction",
      "Reference numbers (if any)",
      "Any witness or document support",
    ],
    faqs: [
      {
        question: "What if my complaint was not properly recorded?",
        answer:
          "Submit the timeline and station details in your report, including any names/reference numbers you have. Clear factual details help route accountability review.",
      },
      {
        question: "How can I avoid delays in review?",
        answer:
          "Use precise dates, attach any written acknowledgements, and update the report when new events occur rather than creating duplicate issues.",
      },
    ],
    escalation:
      "For serious rights concerns, use the app record plus relevant official complaint channels in parallel.",
  },
  harassment: {
    categoryTitle: "Gender, Child & Social Protection",
    intro:
      "Protecting vulnerable groups from domestic violence and abuse.",
    whenToChoose: [
      "Domestic or community harassment concerns",
      "Child safety/protection grievances",
      "Gender-based harm or intimidation",
    ],
    reportChecklist: [
      "Safe summary of incident (avoid exposing victim identity publicly)",
      "When and where incident happened",
      "Any immediate safety risks",
      "Attachments only if safe and necessary",
    ],
    faqs: [
      {
        question: "How do I report safely for a vulnerable person?",
        answer:
          "Share only necessary details, avoid exposing private identifiers in public fields, and focus on incident facts, location, and immediate risk level.",
      },
      {
        question: "What should I do if there is immediate danger?",
        answer:
          "Contact emergency services first. Use the app report to create a documented trail and follow-up path once immediate safety is addressed.",
      },
    ],
    escalation:
      "For urgent safety threats, prioritize emergency intervention and then continue updates through the issue workflow.",
  },
  public_services: {
    categoryTitle: "Administrative Injustice",
    intro:
      "Remedies for delays or unfair treatment by government departments.",
    whenToChoose: [
      "Service delay beyond reasonable time",
      "Inconsistent or unfair administrative decisions",
      "Lack of response to documented requests",
    ],
    reportChecklist: [
      "Office/department name",
      "Application/request reference numbers",
      "Submission and follow-up dates",
      "Clear description of expected service outcome",
    ],
    faqs: [
      {
        question: "How can I report a delayed government service effectively?",
        answer:
          "Provide your request reference number, submission date, follow-up attempts, and current status. Structured details improve tracking and escalation.",
      },
      {
        question: "Should I submit again if there is no response?",
        answer:
          "Update the existing issue with new follow-up evidence first. This keeps one clear case history and avoids fragmented review.",
      },
    ],
    escalation:
      "If repeated non-response continues, add follow-up proof and request review escalation through the assigned workflow.",
  },
  other: {
    categoryTitle: "Other Civil Matters",
    intro:
      "General inquiries regarding civil rights and legal procedures.",
    whenToChoose: [
      "Issue does not clearly fit any available category",
      "Cross-cutting civil matter requiring manual triage",
    ],
    reportChecklist: [
      "One-line summary of the grievance type",
      "Why other categories do not apply",
      "District, location, and date context",
      "Any evidence that supports triage",
    ],
    faqs: [
      {
        question: "When should I choose Other?",
        answer:
          "Choose Other only if your issue does not fit Land, Family, Labour, Digital, Police, Social Protection, or Administrative categories. Add a clear explanation to help correct routing.",
      },
      {
        question: "Can my issue be reclassified later?",
        answer:
          "Yes. Provide clear details and attachments; the reviewing authority can route or reclassify as needed.",
      },
    ],
    escalation:
      "Use updates to provide additional context if the first routing outcome is not suitable.",
  },
};

export const CIVIL_ISSUE_AWARENESS_DISCLAIMER = {
  title: "Important Notice",
  text: "This awareness content is for general guidance within the reporting workflow and does not constitute legal advice. For urgent threats or emergencies, contact official emergency services immediately.",
};

export const CIVIL_ISSUE_CATEGORY_KEYS = CIVIL_ISSUE_CATEGORIES.map((item) => item.value);

export const getAwarenessByCategory = (category) => CIVIL_ISSUE_AWARENESS_CONTENT[category] || null;
