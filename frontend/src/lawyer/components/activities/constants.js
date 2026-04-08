export const POST_TYPES = [
  { value: "legal_awareness", label: "Legal awareness" },
  { value: "achievement_announcement", label: "Achievement announcement" },
  { value: "event_participation", label: "Event participation" },
  { value: "legal_advice_article", label: "Legal advice article" },
  { value: "social_justice_work", label: "Social justice work" },
];

export const VISIBILITY_OPTIONS = [
  { value: "public", label: "Public" },
  { value: "followers", label: "Followers only" },
  { value: "private", label: "Private" },
];

export const postTypeLabels = Object.fromEntries(
  POST_TYPES.map((item) => [item.value, item.label]),
);

export const visibilityLabels = Object.fromEntries(
  VISIBILITY_OPTIONS.map((item) => [item.value, item.label]),
);
