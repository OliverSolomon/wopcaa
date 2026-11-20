/** Shared by the report form (client) and the dashboards (server). No secrets here. */

export const CATEGORIES = [
  { id: "physical", label: "Physical violence", hint: "Beating, pushing, burning, or any harm to the body" },
  { id: "sexual", label: "Sexual violence", hint: "Rape, assault, harassment, or sex without consent" },
  { id: "emotional", label: "Emotional or psychological abuse", hint: "Threats, insults, isolation, control, intimidation" },
  { id: "economic", label: "Economic abuse", hint: "Denied land, property, income, inheritance or resources" },
  { id: "online", label: "Online or tech-facilitated abuse", hint: "Stalking, leaked images, harassment on phone or social media" },
  { id: "harmful_practice", label: "FGM or harmful practices", hint: "Female genital mutilation, widow inheritance, beading" },
  { id: "child_marriage", label: "Child or forced marriage", hint: "Marriage of a girl under 18, or without free consent" },
  { id: "defender", label: "Attack on a woman leader or defender", hint: "Threats or harm because of activism, leadership or advocacy" },
  { id: "conflict", label: "Conflict or climate-related violence", hint: "Violence linked to water, pasture, land, displacement or drought" },
  { id: "other", label: "Something else", hint: "Tell us in your own words" },
] as const;

export const RELATIONS = [
  { id: "partner", label: "Husband, wife or partner" },
  { id: "ex_partner", label: "Former partner" },
  { id: "family", label: "Family member" },
  { id: "community", label: "Neighbour or community member" },
  { id: "employer", label: "Employer or colleague" },
  { id: "authority", label: "Official, police or leader" },
  { id: "stranger", label: "Stranger" },
  { id: "online", label: "Someone online" },
  { id: "unknown", label: "Prefer not to say / don't know" },
] as const;

export const SUPPORT = [
  { id: "medical", label: "Medical care" },
  { id: "legal", label: "Legal advice or representation" },
  { id: "counselling", label: "Counselling" },
  { id: "shelter", label: "A safe place to stay" },
  { id: "police", label: "Help reporting to police" },
  { id: "economic", label: "Economic support" },
  { id: "listen", label: "Just someone to listen" },
] as const;

export const STATUSES = [
  { id: "new", label: "Received", tone: "ochre" },
  { id: "in_review", label: "In review", tone: "blue" },
  { id: "referred", label: "Referred for support", tone: "violet" },
  { id: "resolved", label: "Resolved", tone: "green" },
  { id: "closed", label: "Closed", tone: "stone" },
] as const;

export const URGENCY = [
  { id: "low", label: "Low" },
  { id: "normal", label: "Normal" },
  { id: "high", label: "High" },
  { id: "critical", label: "Critical — in danger now" },
] as const;

export const COUNTIES = [
  "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu", "Garissa", "Homa Bay", "Isiolo", "Kajiado",
  "Kakamega", "Kericho", "Kiambu", "Kilifi", "Kirinyaga", "Kisii", "Kisumu", "Kitui", "Kwale", "Laikipia",
  "Lamu", "Machakos", "Makueni", "Mandera", "Marsabit", "Meru", "Migori", "Mombasa", "Murang'a", "Nairobi",
  "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua", "Nyeri", "Samburu", "Siaya", "Taita-Taveta", "Tana River",
  "Tharaka-Nithi", "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot", "Outside Kenya",
];

const lookup = <T extends readonly { id: string; label: string }[]>(list: T) => (id: string | null | undefined) =>
  list.find((x) => x.id === id)?.label ?? id ?? "—";

export const categoryLabel = lookup(CATEGORIES);
export const relationLabel = lookup(RELATIONS);
export const supportLabel = lookup(SUPPORT);
export const statusLabel = lookup(STATUSES);
export const urgencyLabel = lookup(URGENCY);
export const statusTone = (id: string) => STATUSES.find((s) => s.id === id)?.tone ?? "stone";

export type StatusId = (typeof STATUSES)[number]["id"];
