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

const heading: Field = { name: "heading", label: "Heading", type: "text" };

export const SECTION_DEFS: SectionDef[] = [
  {
    type: "heroMedia",
    title: "Hero",
    description: "Opening screen: headline and buttons beside a frame of community photos, over a soft moving background",
    icon: "PanelTop",
    fields: [
      { name: "title", label: "Headline", type: "textarea", rows: 2, help: "Keep it short: seven words or fewer reads best" },
      { name: "subtitle", label: "Supporting sentence", type: "textarea", rows: 3 },
      { name: "primary", label: "Main button", type: "link" },
      { name: "secondary", label: "Reporting button", type: "link" },
      { name: "images", label: "Photos (cross-fade)", type: "list", itemLabel: "caption", of: [{ name: "image", label: "Photo", type: "image" }, { name: "caption", label: "Caption", type: "text" }] },
    ],
    defaults: { title: "", subtitle: "", primary: { label: "About us", href: "/about" }, secondary: { label: "Report abuse safely", href: "/report" }, images: [] },
  },
  {
    type: "story",
    title: "Story (cinematic scroll)",
    description: "Full-screen scenes that play as the visitor scrolls: a slow camera move on each photo, a subtitle line, and weather (rain, embers or rising seeds)",
    icon: "Clapperboard",
    fields: [
      { name: "scenes", label: "Scenes", type: "list", itemLabel: "line", of: [
        { name: "image", label: "Photo", type: "image" },
        { name: "line", label: "On-screen line", type: "text", help: "Short and in the present tense, like a film subtitle" },
        { name: "sub", label: "Supporting sentence", type: "textarea", rows: 2 },
        { name: "note", label: "Source or caption", type: "text" },
        { name: "weather", label: "Weather", type: "select", options: [{ value: "none", label: "None" }, { value: "rain", label: "Rain" }, { value: "embers", label: "Embers (heat, drought)" }, { value: "seeds", label: "Rising seeds (growth)" }] },
      ] },
      { name: "endingLine", label: "Closing line", type: "text" },
      { name: "primary", label: "Closing button", type: "link" },
      { name: "secondary", label: "Second closing button", type: "link" },
    ],
    defaults: { scenes: [], endingLine: "", primary: { label: "", href: "" }, secondary: { label: "", href: "" } },
  },
  {
    type: "photoPair",
    title: "Photo pair",
    description: "Two arch-framed photos side by side, offset, with a short text under the second",
    icon: "Images",
    fields: [
      { name: "heading", label: "Heading", type: "text" },
      { name: "imageA", label: "Large photo", type: "image" },
      { name: "imageB", label: "Second photo", type: "image" },
      { name: "body", label: "Text", type: "markdown" },
      { name: "link", label: "Link", type: "link" },
    ],
    defaults: { heading: "", imageA: "", imageB: "", body: "", link: { label: "", href: "" } },
  },
  {
    type: "involve",
    title: "Get involved",
    description: "Women planting an acacia beside a short invitation and two buttons",
    icon: "Sprout",
    fields: [{ name: "heading", label: "Heading", type: "text" }, { name: "body", label: "Text", type: "textarea" }, { name: "primary", label: "Main button", type: "link" }, { name: "secondary", label: "Second button", type: "link" }],
    defaults: { heading: "", body: "", primary: { label: "", href: "" }, secondary: { label: "", href: "" } },
  },
  {
    type: "county",
    title: "Your county (interactive)",
    description: "Visitors pick their county and get the actions they can take from there, with forms filled in",
    icon: "MapPin",
    fields: [{ name: "heading", label: "Heading", type: "text" }, { name: "intro", label: "Intro", type: "textarea" }],
    defaults: { heading: "Your county. Your next step.", intro: "" },
  },
  {
    type: "bento",
    title: "What we do (interactive)",
    description: "Cards for each area of work, each with its own interactive drawing: dove flock, scales of justice, grass in the wind, or a photo",
    icon: "LayoutGrid",
    fields: [
      { name: "heading", label: "Heading", type: "text" },
      { name: "intro", label: "Intro", type: "textarea" },
      { name: "items", label: "Cards", type: "list", itemLabel: "title", of: [
        { name: "title", label: "Title", type: "text" },
        { name: "body", label: "Text", type: "textarea" },
        { name: "motif", label: "Drawing", type: "select", options: [{ value: "peace", label: "Doves (peace)" }, { value: "justice", label: "Scales (justice)" }, { value: "climate", label: "Grass and wind (climate)" }, { value: "photo", label: "Photo" }] },
        { name: "image", label: "Photo (for the photo card)", type: "image" },
        { name: "tags", label: "Tags (comma separated)", type: "text" },
        { name: "href", label: "Link", type: "text" },
      ] },
    ],
    defaults: { heading: "What we do", intro: "", items: [] },
  },
  {
    type: "impact",
    title: "Why it matters (island)",
    description: "An illustrated island of Kajiado with facts pinned to the places they happen",
    icon: "BarChart3",
    fields: [
      { name: "heading", label: "Heading", type: "text" },
      { name: "intro", label: "Intro", type: "textarea" },
      { name: "items", label: "Facts (up to four)", type: "list", itemLabel: "label", of: [
        { name: "value", label: "Figure", type: "text" },
        { name: "label", label: "What it measures", type: "text" },
        { name: "place", label: "Pin it to", type: "select", options: [{ value: "women", label: "The women" }, { value: "home", label: "The homestead" }, { value: "water", label: "The water pan" }, { value: "turbine", label: "The wind turbine" }, { value: "mountain", label: "Kilimanjaro" }, { value: "acacia", label: "The acacia" }] },
        { name: "source", label: "Source", type: "text", help: "Always name where the figure comes from" },
      ] },
      { name: "source", label: "Default source", type: "text", help: "Used for facts without their own source" },
    ],
    defaults: { heading: "", intro: "", items: [], source: "" },
  },
  {
    type: "team",
    title: "People",
    description: "Leadership, board or secretariat with photo, role and a short bio",
    icon: "Users",
    fields: [
      { name: "heading", label: "Heading", type: "text" },
      { name: "intro", label: "Intro", type: "textarea" },
      { name: "items", label: "People", type: "list", itemLabel: "name", of: [{ name: "name", label: "Name", type: "text" }, { name: "role", label: "Role", type: "text" }, { name: "photo", label: "Photo", type: "image" }, { name: "bio", label: "Short bio", type: "textarea" }] },
    ],
    defaults: { heading: "Our people", intro: "", items: [] },
  },
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
    fields: [{ name: "title", label: "Title", type: "textarea", rows: 2 }, { name: "intro", label: "Intro", type: "textarea", rows: 3 }, { name: "image", label: "Image", type: "image" }],
    defaults: { title: "Page title.", intro: "", image: "/images/about.jpeg" },
  },
  {
    type: "statement",
    title: "Statement",
    description: "A large sentence that reveals word by word as you scroll",
    icon: "Quote",
    fields: [{ name: "text", label: "Statement", type: "textarea", rows: 4 }, { name: "body", label: "Supporting text", type: "markdown" }, { name: "link", label: "Link", type: "link" }],
    defaults: { text: "We envision a secure and sustainable future for all.", body: "", link: { label: "", href: "" } },
  },
  {
    type: "pillars",
    title: "Pillars / cards",
    description: "Numbered cards with images that lift on hover",
    icon: "LayoutGrid",
    fields: [
      heading, { name: "intro", label: "Intro", type: "textarea" },
      { name: "items", label: "Cards", type: "list", itemLabel: "title", of: [{ name: "title", label: "Title", type: "text" }, { name: "body", label: "Text", type: "textarea" }, { name: "image", label: "Image", type: "image" }, { name: "href", label: "Link", type: "text" }] },
    ],
    defaults: { heading: "Our pillars", intro: "", items: [] },
  },
  {
    type: "parallaxBanner",
    title: "Parallax banner",
    description: "Full-bleed image moving slower than the page, with text over it",
    icon: "Image",
    fields: [{ name: "image", label: "Image", type: "image" }, heading, { name: "body", label: "Text", type: "textarea" }, { name: "cta", label: "Button", type: "link" }],
    defaults: { image: "/images/maasai-women.jpg", heading: "We have to step up as women and take the lead.", body: "", cta: { label: "Join our community", href: "/membership" } },
  },
  {
    type: "stats",
    title: "Numbers",
    description: "A band of figures that count up when seen",
    icon: "BarChart3",
    fields: [heading, { name: "items", label: "Figures", type: "list", itemLabel: "label", of: [{ name: "value", label: "Value", type: "text", help: "e.g. 1,200+ or 47" }, { name: "label", label: "Label", type: "text" }, { name: "note", label: "Note", type: "text" }] }],
    defaults: { heading: "", items: [] },
  },
  {
    type: "gallery",
    title: "Horizontal gallery",
    description: "Pinned section that scrolls sideways through images",
    icon: "GalleryHorizontal",
    fields: [heading, { name: "items", label: "Images", type: "list", itemLabel: "caption", of: [{ name: "image", label: "Image", type: "image" }, { name: "caption", label: "Caption", type: "text" }, { name: "place", label: "Place / date", type: "text" }] }],
    defaults: { heading: "From the grassroots", items: [] },
  },
  {
    type: "split",
    title: "Image and text",
    description: "Two columns: a parallax image beside rich text",
    icon: "Columns2",
    fields: [heading, { name: "body", label: "Text", type: "markdown" }, { name: "image", label: "Image", type: "image" }, { name: "cta", label: "Button", type: "link" }, { name: "reverse", label: "Image on the right", type: "boolean" }],
    defaults: { heading: "", body: "", image: "/images/about.jpeg", cta: { label: "", href: "" }, reverse: false },
  },
  {
    type: "values",
    title: "Numbered list",
    description: "Values, objectives or steps in a numbered index",
    icon: "ListOrdered",
    fields: [heading, { name: "items", label: "Items", type: "list", itemLabel: "title", of: [{ name: "title", label: "Title", type: "text" }, { name: "body", label: "Text", type: "textarea" }] }],
    defaults: { heading: "Our values", items: [] },
  },
  {
    type: "richText",
    title: "Rich text",
    description: "Headings, paragraphs, lists and links",
    icon: "Type",
    fields: [heading, { name: "body", label: "Body", type: "markdown" }, { name: "narrow", label: "Narrow column", type: "boolean" }],
    defaults: { heading: "", body: "", narrow: true },
  },
  {
    type: "timeline",
    title: "Timeline",
    description: "Dated milestones along a line",
    icon: "Milestone",
    fields: [heading, { name: "items", label: "Milestones", type: "list", itemLabel: "title", of: [{ name: "date", label: "Date", type: "text" }, { name: "title", label: "Title", type: "text" }, { name: "body", label: "Text", type: "textarea" }] }],
    defaults: { heading: "Milestones", items: [] },
  },
  {
    type: "tiers",
    title: "Membership tiers",
    description: "Pricing-style cards",
    icon: "BadgeCheck",
    fields: [heading, { name: "intro", label: "Intro", type: "textarea" }, { name: "items", label: "Tiers", type: "list", itemLabel: "name", of: [{ name: "name", label: "Name", type: "text" }, { name: "price", label: "Price", type: "text" }, { name: "note", label: "Note", type: "text" }, { name: "features", label: "Features (one per line)", type: "textarea" }, { name: "cta", label: "Button", type: "link" }, { name: "featured", label: "Highlight", type: "boolean" }] }],
    defaults: { heading: "Membership", intro: "", items: [] },
  },
  {
    type: "partners",
    title: "Partners",
    description: "A slow marquee of partner logos",
    icon: "Handshake",
    fields: [heading, { name: "items", label: "Partners", type: "list", itemLabel: "name", of: [{ name: "name", label: "Name", type: "text" }, { name: "logo", label: "Logo", type: "image" }, { name: "href", label: "Website", type: "text" }] }],
    defaults: { heading: "In partnership with", items: [] },
  },
  {
    type: "posts",
    title: "Latest posts",
    description: "Articles, press releases or events from the Posts collection",
    icon: "Newspaper",
    fields: [heading, { name: "kind", label: "Show", type: "select", options: [{ value: "all", label: "Everything" }, { value: "article", label: "Articles" }, { value: "press", label: "Press releases" }, { value: "event", label: "Events" }] }, { name: "limit", label: "How many", type: "number" }],
    defaults: { heading: "Latest from WOPCAA", kind: "all", limit: 3 },
  },
  {
    type: "faq",
    title: "Questions",
    description: "Expandable questions and answers",
    icon: "HelpCircle",
    fields: [heading, { name: "items", label: "Questions", type: "list", itemLabel: "q", of: [{ name: "q", label: "Question", type: "text" }, { name: "a", label: "Answer", type: "textarea" }] }],
    defaults: { heading: "Questions", items: [] },
  },
  {
    type: "reportCta",
    title: "Safe reporting band",
    description: "Invites people to report abuse, with hotline numbers from Settings",
    icon: "ShieldCheck",
    fields: [heading, { name: "body", label: "Text", type: "textarea" }, { name: "showHotlines", label: "Show hotlines", type: "boolean" }],
    defaults: { heading: "You are not alone. Tell us what happened.", body: "", showHotlines: true },
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
    fields: [heading, { name: "intro", label: "Intro", type: "textarea" }],
    defaults: { heading: "Get in touch", intro: "" },
  },
  {
    type: "form",
    title: "Membership form",
    description: "Application form that lands in the admin enquiries inbox",
    icon: "ClipboardList",
    fields: [heading, { name: "intro", label: "Intro", type: "textarea" }],
    defaults: { heading: "Apply for membership", intro: "" },
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
