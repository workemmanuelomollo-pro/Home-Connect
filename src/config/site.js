export const site = {
  name: "Home Service Connect",
  shortName: "HSC",
  tagline: "Verified pros for every home problem — in your estate, on WhatsApp.",

  whatsappTemplate: (provider, form) =>
    `Hi ${provider.name}, I found you on ${site.name}. ` +
    `I need help with ${form.service} in ${form.neighborhood}. ` +
    `Urgency: ${form.urgency}.` +
    (form.description ? ` Details: ${form.description}.` : "") +
    ` Are you available today?`,
};

export const categories = [
  { id: "plumbing",   label: "Plumbing",         icon: "Wrench" },
  { id: "electrical", label: "Electrical",       icon: "Zap" },
  { id: "cleaning",   label: "Cleaning",         icon: "Sparkles" },
  { id: "handyman",   label: "Handyman",         icon: "Hammer" },
  { id: "appliance",  label: "Appliance Repair", icon: "WashingMachine" },
  { id: "ac",         label: "AC & Fridge",      icon: "Snowflake" },
];

export const neighborhoods = [
  "Kilimani",
  "Westlands",
  "Lavington",
  "Karen",
  "CBD",
  "Kileleshwa",
];

export const urgencyOptions = ["Today (High)", "This week", "Flexible"];