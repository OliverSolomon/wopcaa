/**
 * The content model, in one place. The studio builds its forms from these
 * definitions and the public site renders sections by `type`, so adding a
 * section means adding an entry here and a component in components/sections.
 */

export type Field =
  | { name: string; label: string; type: "text"; placeholder?: string; help?: string }
  | { name: string; label: string; type: "textarea"; rows?: number; help?: string }
  | { name: string; label: string; type: "markdown"; help?: string }
  | { name: string; label: string; type: "image"; help?: string }
  | { name: string; label: string; type: "link"; help?: string }
  | { name: string; label: string; type: "boolean"; help?: string }
  | { name: string; label: string; type: "number"; help?: string }
  | { name: string; label: string; type: "select"; options: { value: string; label: string }[]; help?: string }
  | { name: string; label: string; type: "list"; of: Field[]; itemLabel?: string; help?: string }
  | { name: string; label: string; type: "object"; of: Field[]; help?: string };

export interface Link { label: string; href: string }

export interface SectionDef {
  type: string;
  title: string;
  description: string;
  icon: string; // lucide icon name, resolved in the studio
  fields: Field[];
  defaults: Record<string, unknown>;
}

export interface Section {
  _key: string;
  type: string;
  hidden?: boolean;
  [field: string]: unknown;
}

const kicker: Field = { name: "kicker", label: "Kicker", type: "text", help: "Small label above the heading, e.g. 02 / Our work" };
const heading: Field = { name: "heading", label: "Heading", type: "text" };

export const SECTION_DEFS: SectionDef[] = [
  {
    type: "hero3d",
    title: "Hero · 3D",
    description: "Full-screen opening with the interactive 3D globe",
    icon: "Orbit",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Title", type: "textarea", rows: 2, help: "Wrap a word in *asterisks* to set it in italic" },
      { name: "subtitle", label: "Subtitle", type: "textarea", rows: 3 },
      { name: "primary", label: "Primary button", type: "link" },
      { name: "secondary", label: "Secondary button", type: "link" },
      { name: "variant", label: "3D scene", type: "select", options: [{ value: "globe", label: "Globe of seeds" }, { value: "field", label: "Flowing field" }] },
    ],
    defaults: { eyebrow: "Women · Peace · Climate · Justice", title: "Empowering women for a *greener*, peaceful tomorrow.", subtitle: "", primary: { label: "Learn more", href: "/about" }, secondary: { label: "Report abuse safely", href: "/report" }, variant: "globe" },
  },
  {
    type: "pageHeader",
    title: "Page header",
    description: "Title block with a parallax image, for inner pages",
    icon: "PanelTop",
    fields: [kicker, { name: "title", label: "Title", type: "textarea", rows: 2 }, { name: "intro", label: "Intro", type: "textarea", rows: 3 }, { name: "image", label: "Image", type: "image" }],
    defaults: { kicker: "", title: "Page title.", intro: "", image: "/images/about.jpeg" },
  },
  {
    type: "statement",
    title: "Statement",
    description: "A large sentence that reveals word by word as you scroll",
    icon: "Quote",
    fields: [kicker, { name: "text", label: "Statement", type: "textarea", rows: 4 }, { name: "body", label: "Supporting text", type: "markdown" }, { name: "link", label: "Link", type: "link" }],
    defaults: { kicker: "01 / Who we are", text: "We envision a secure and sustainable future for all.", body: "", link: { label: "", href: "" } },
  },
  {
    type: "pillars",
    title: "Pillars / cards",
    description: "Numbered cards with images that lift on hover",
    icon: "LayoutGrid",
    fields: [
      kicker, heading, { name: "intro", label: "Intro", type: "textarea" },
      { name: "items", label: "Cards", type: "list", itemLabel: "title", of: [{ name: "title", label: "Title", type: "text" }, { name: "body", label: "Text", type: "textarea" }, { name: "image", label: "Image", type: "image" }, { name: "href", label: "Link", type: "text" }] },
    ],
    defaults: { kicker: "02 / What we do", heading: "Our pillars", intro: "", items: [] },
  },
  {
    type: "parallaxBanner",
    title: "Parallax banner",
    description: "Full-bleed image moving slower than the page, with text over it",
    icon: "Image",
    fields: [{ name: "image", label: "Image", type: "image" }, kicker, heading, { name: "body", label: "Text", type: "textarea" }, { name: "cta", label: "Button", type: "link" }],
    defaults: { image: "/images/maasai-women.jpg", kicker: "", heading: "We have to step up as women and take the lead.", body: "", cta: { label: "Join our community", href: "/membership" } },
  },
  {
    type: "stats",
    title: "Numbers",
    description: "A band of figures that count up when seen",
    icon: "BarChart3",
    fields: [kicker, heading, { name: "items", label: "Figures", type: "list", itemLabel: "label", of: [{ name: "value", label: "Value", type: "text", help: "e.g. 1,200+ or 47" }, { name: "label", label: "Label", type: "text" }, { name: "note", label: "Note", type: "text" }] }],
    defaults: { kicker: "", heading: "", items: [] },
  },
  {
    type: "gallery",
    title: "Horizontal gallery",
    description: "Pinned section that scrolls sideways through images",
    icon: "GalleryHorizontal",
    fields: [kicker, heading, { name: "items", label: "Images", type: "list", itemLabel: "caption", of: [{ name: "image", label: "Image", type: "image" }, { name: "caption", label: "Caption", type: "text" }, { name: "place", label: "Place / date", type: "text" }] }],
    defaults: { kicker: "Field notes", heading: "From the grassroots", items: [] },
  },
  {
    type: "split",
    title: "Image and text",
    description: "Two columns: a parallax image beside rich text",
    icon: "Columns2",
    fields: [kicker, heading, { name: "body", label: "Text", type: "markdown" }, { name: "image", label: "Image", type: "image" }, { name: "cta", label: "Button", type: "link" }, { name: "reverse", label: "Image on the right", type: "boolean" }],
    defaults: { kicker: "", heading: "", body: "", image: "/images/about.jpeg", cta: { label: "", href: "" }, reverse: false },
  },
  {
    type: "values",
    title: "Numbered list",
    description: "Values, objectives or steps in a numbered index",
    icon: "ListOrdered",
    fields: [kicker, heading, { name: "items", label: "Items", type: "list", itemLabel: "title", of: [{ name: "title", label: "Title", type: "text" }, { name: "body", label: "Text", type: "textarea" }] }],
    defaults: { kicker: "", heading: "Our values", items: [] },
  },
  {
    type: "richText",
    title: "Rich text",
    description: "Headings, paragraphs, lists and links",
    icon: "Type",
    fields: [kicker, heading, { name: "body", label: "Body", type: "markdown" }, { name: "narrow", label: "Narrow column", type: "boolean" }],
    defaults: { kicker: "", heading: "", body: "", narrow: true },
  },
  {
    type: "timeline",
    title: "Timeline",
    description: "Dated milestones along a line",
    icon: "Milestone",
    fields: [kicker, heading, { name: "items", label: "Milestones", type: "list", itemLabel: "title", of: [{ name: "date", label: "Date", type: "text" }, { name: "title", label: "Title", type: "text" }, { name: "body", label: "Text", type: "textarea" }] }],
    defaults: { kicker: "", heading: "Milestones", items: [] },
  },
  {
    type: "tiers",
    title: "Membership tiers",
    description: "Pricing-style cards",
    icon: "BadgeCheck",
    fields: [kicker, heading, { name: "intro", label: "Intro", type: "textarea" }, { name: "items", label: "Tiers", type: "list", itemLabel: "name", of: [{ name: "name", label: "Name", type: "text" }, { name: "price", label: "Price", type: "text" }, { name: "note", label: "Note", type: "text" }, { name: "features", label: "Features (one per line)", type: "textarea" }, { name: "cta", label: "Button", type: "link" }, { name: "featured", label: "Highlight", type: "boolean" }] }],
    defaults: { kicker: "", heading: "Membership", intro: "", items: [] },
  },
  {
    type: "partners",
    title: "Partners",
    description: "A slow marquee of partner logos",
    icon: "Handshake",
    fields: [kicker, heading, { name: "items", label: "Partners", type: "list", itemLabel: "name", of: [{ name: "name", label: "Name", type: "text" }, { name: "logo", label: "Logo", type: "image" }, { name: "href", label: "Website", type: "text" }] }],
    defaults: { kicker: "", heading: "In partnership with", items: [] },
  },
  {
    type: "posts",
    title: "Latest posts",
    description: "Articles, press releases or events from the Posts collection",
    icon: "Newspaper",
    fields: [kicker, heading, { name: "kind", label: "Show", type: "select", options: [{ value: "all", label: "Everything" }, { value: "article", label: "Articles" }, { value: "press", label: "Press releases" }, { value: "event", label: "Events" }] }, { name: "limit", label: "How many", type: "number" }],
    defaults: { kicker: "", heading: "Latest from WOPCAA", kind: "all", limit: 3 },
  },
  {
    type: "faq",
    title: "Questions",
    description: "Expandable questions and answers",
    icon: "HelpCircle",
    fields: [kicker, heading, { name: "items", label: "Questions", type: "list", itemLabel: "q", of: [{ name: "q", label: "Question", type: "text" }, { name: "a", label: "Answer", type: "textarea" }] }],
    defaults: { kicker: "", heading: "Questions", items: [] },
  },
  {
    type: "reportCta",
    title: "Safe reporting band",
    description: "Invites people to report abuse, with hotline numbers from Settings",
    icon: "ShieldCheck",
    fields: [kicker, heading, { name: "body", label: "Text", type: "textarea" }, { name: "showHotlines", label: "Show hotlines", type: "boolean" }],
    defaults: { kicker: "Safe · Confidential · Anonymous if you choose", heading: "You are not alone. Tell us what happened.", body: "", showHotlines: true },
  },
  {
    type: "cta",
    title: "Call to action",
    description: "A calm closing band with one or two buttons",
    icon: "MousePointerClick",
    fields: [heading, { name: "body", label: "Text", type: "textarea" }, { name: "primary", label: "Primary button", type: "link" }, { name: "secondary", label: "Secondary button", type: "link" }, { name: "tone", label: "Tone", type: "select", options: [{ value: "forest", label: "Forest" }, { value: "sand", label: "Sand" }, { value: "ochre", label: "Ochre" }] }],
    defaults: { heading: "", body: "", primary: { label: "", href: "" }, secondary: { label: "", href: "" }, tone: "forest" },
  },
  {
    type: "contact",
    title: "Contact",
    description: "Contact details from Settings beside a message form",
    icon: "Mail",
    fields: [kicker, heading, { name: "intro", label: "Intro", type: "textarea" }],
    defaults: { kicker: "", heading: "Get in touch", intro: "" },
  },
  {
    type: "form",
    title: "Membership form",
    description: "Application form that lands in the admin enquiries inbox",
    icon: "ClipboardList",
    fields: [kicker, heading, { name: "intro", label: "Intro", type: "textarea" }],
    defaults: { kicker: "", heading: "Apply for membership", intro: "" },
  },
];

export const sectionDef = (type: string) => SECTION_DEFS.find((d) => d.type === type);

export function newSection(type: string): Section {
  const def = sectionDef(type);
  return { _key: Math.random().toString(36).slice(2, 10), type, ...structuredClone(def?.defaults ?? {}) };
}

/* ───────────── Site settings ───────────── */

export interface NavItem { label: string; href: string; children?: NavItem[] }

export interface SiteSettings {
  name: string;
  shortName: string;
  tagline: string;
  logo: string;
  seoDescription: string;
  email: string;
  phone: string;
  address: string;
  socials: { label: string; href: string }[];
  nav: NavItem[];
  footerBlurb: string;
  hotlines: { label: string; number: string }[];
  announcement: { enabled: boolean; text: string; href: string };
  donateUrl: string;
}

export const SETTINGS_FIELDS: { group: string; fields: Field[] }[] = [
  {
    group: "Identity",
    fields: [
      { name: "name", label: "Organisation name", type: "text" },
      { name: "shortName", label: "Short name", type: "text" },
      { name: "tagline", label: "Tagline", type: "text" },
      { name: "logo", label: "Logo", type: "image" },
      { name: "seoDescription", label: "Default search description", type: "textarea" },
    ],
  },
  {
    group: "Navigation",
    fields: [
      {
        name: "nav", label: "Main menu", type: "list", itemLabel: "label",
        of: [
          { name: "label", label: "Label", type: "text" },
          { name: "href", label: "Link", type: "text" },
          { name: "children", label: "Dropdown links", type: "list", itemLabel: "label", of: [{ name: "label", label: "Label", type: "text" }, { name: "href", label: "Link", type: "text" }] },
        ],
      },
      { name: "announcement", label: "Announcement bar", type: "object", of: [{ name: "enabled", label: "Show the bar", type: "boolean" }, { name: "text", label: "Text", type: "text" }, { name: "href", label: "Link", type: "text" }] },
    ],
  },
  {
    group: "Contact",
    fields: [
      { name: "email", label: "Email", type: "text" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "address", label: "Address", type: "textarea" },
      { name: "socials", label: "Social links", type: "list", itemLabel: "label", of: [{ name: "label", label: "Network", type: "text" }, { name: "href", label: "URL", type: "text" }] },
      { name: "donateUrl", label: "Donate link", type: "text" },
    ],
  },
  {
    group: "Safety",
    fields: [
      { name: "hotlines", label: "Help lines shown on report pages", type: "list", itemLabel: "label", of: [{ name: "label", label: "Name", type: "text" }, { name: "number", label: "Number", type: "text" }] },
    ],
  },
  {
    group: "Footer",
    fields: [{ name: "footerBlurb", label: "Footer text", type: "textarea" }],
  },
];

export const DEFAULT_SETTINGS: SiteSettings = {
  name: "Women Peace Climate Resilience and Justice Association",
  shortName: "WOPCAA",
  tagline: "Empowering women for a greener, peaceful tomorrow",
  logo: "/images/logo.png",
  seoDescription: "WOPCAA empowers women to lead peacebuilding, climate action and justice across Africa.",
  email: "info@wopcaa.org",
  phone: "0705 542 834",
  address: "Isinya, Kajiado County, Kenya",
  socials: [],
  nav: [],
  footerBlurb: "",
  hotlines: [],
  announcement: { enabled: false, text: "", href: "" },
  donateUrl: "",
};
