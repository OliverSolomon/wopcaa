// Seeds settings, pages, media and posts with WOPCAA's content. Safe to re-run:
// existing pages and posts (matched by slug) are left alone unless --force is passed.
// Usage: node --env-file=.env.local scripts/seed.mjs [--force]
import { neon } from "@neondatabase/serverless";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const sql = neon(process.env.DATABASE_URL);
const force = process.argv.includes("--force");
const k = () => Math.random().toString(36).slice(2, 10);
const root = join(import.meta.dirname, "..");

const settings = {
  name: "Women Peace Climate Resilience and Justice Association",
  shortName: "WOPCAA",
  tagline: "Empowering women for a greener, peaceful tomorrow",
  logo: "/images/logo.png",
  seoDescription: "WOPCAA empowers women to lead peacebuilding, climate action and justice across Africa, from the grassroots up.",
  email: "info@wopcaa.org",
  phone: "0705 542 834",
  address: "Isinya, Kajiado County\nKenya",
  donateUrl: "",
  footerBlurb: "Women Peace Climate Resilience and Justice Association: harnessing the collective expertise of women to catalyse innovative climate action.",
  announcement: { enabled: false, text: "", href: "" },
  socials: [
    { label: "LinkedIn", href: "https://www.linkedin.com/company/wopcaa" },
    { label: "Facebook", href: "https://www.facebook.com/wopcaa" },
    { label: "X (Twitter)", href: "https://twitter.com/wopcaa" },
    { label: "Instagram", href: "https://instagram.com/wopcaa" },
  ],
  hotlines: [
    { label: "National GBV helpline (free, 24h)", number: "1195" },
    { label: "Childline Kenya (free, 24h)", number: "116" },
    { label: "Police emergency", number: "999" },
  ],
  nav: [
    { label: "Who we are", href: "/about", children: [{ label: "About us", href: "/about" }, { label: "Our people", href: "/our-people" }, { label: "Membership", href: "/membership" }] },
    { label: "Our work", href: "/cop-mashinani", children: [{ label: "COP Mashinani", href: "/cop-mashinani" }, { label: "Safe reporting", href: "/report" }, { label: "Follow up on a report", href: "/track" }] },
    { label: "Media centre", href: "/news", children: [{ label: "News and articles", href: "/news" }, { label: "Press releases", href: "/news?kind=press" }, { label: "Events", href: "/news?kind=event" }] },
    { label: "Contact", href: "/contact" },
  ],
};

const partners = [
  { name: "PAAJELA", logo: "/images/partners/paajela.svg", href: "" },
  { name: "COVAW", logo: "/images/partners/covaw.svg", href: "https://covaw.or.ke" },
  { name: "CFLA", logo: "/images/partners/cfla.png", href: "" },
  { name: "CGW", logo: "/images/partners/cgw.svg", href: "" },
  { name: "FEMNET", logo: "/images/partners/femnet.png", href: "https://femnet.org" },
];

const S = (type, fields) => ({ _key: k(), type, ...fields });

const pages = [
  {
    slug: "home", title: "Home", seo: settings.seoDescription,
    sections: [
      S("heroMedia", {
        title: "Empowering women for a greener, peaceful tomorrow.",
        subtitle: "Women leading peace, climate action and justice, starting in Kajiado.",
        primary: { label: "About our work", href: "/about" }, secondary: { label: "Report abuse safely", href: "/report" },
        images: [
          { image: "/images/cop28.jpeg", caption: "COP28 Mashinani, Isinya" },
          { image: "/images/maasai-women.jpg", caption: "Women leaders, Kajiado" },
          { image: "/images/table-banking.jpg", caption: "A table banking circle" },
          { image: "/images/voices.jpeg", caption: "Recording women's stories, 2024" },
        ],
      }),
      S("story", {
        scenes: [
          { image: "/images/maasai-women.jpg", line: "This is Kajiado.", sub: "Open pasture, scarce water, and women who hold their communities together.", weather: "seeds" },
          { image: "/images/articles/Kenya-Floods.png", line: "The rains failed. Then they came all at once.", sub: "In 2024 floods across Kenya killed more than 200 people and displaced more than 20,000 families.", note: "Kenya Disaster Response Unit, cited in our article on flooding in East Africa", weather: "rain" },
          { image: "/images/voices.jpeg", line: "Women carry it first.", sub: "Water, food, land and safety: when the climate breaks, the weight lands on women and girls, and violence often follows.", weather: "embers" },
          { image: "/images/cop28.jpeg", line: "So they lead.", sub: "At COP Mashinani in Isinya, Maasai women set the agenda for climate action in their own words.", weather: "seeds" },
        ],
        endingLine: "A greener, peaceful tomorrow. Ready when you are.",
        primary: { label: "Join us", href: "/membership" }, secondary: { label: "Report abuse safely", href: "/report" },
      }),
      S("bento", {
        heading: "What we do",
        intro: "Our emblem holds a globe, a dove and the scales of justice. Our work holds all three together, because for women on the frontline they were never separate.",
        items: [
          { title: "Climate resilience", body: "We raise awareness and support adaptation that communities lead themselves: water, livelihoods and land.", motif: "climate", tags: "Adaptation, Awareness, Livelihoods", href: "/cop-mashinani" },
          { title: "Peacebuilding", body: "Through dialogue, mediation and community projects, we resolve conflicts made worse by climate change.", motif: "peace", tags: "Dialogue, Mediation", href: "/about" },
          { title: "Social justice", body: "Policy engagement, partnerships and a safe way to report abuse, so that justice reaches every woman.", motif: "justice", tags: "Policy, Safe reporting", href: "/report" },
          { title: "COP Mashinani", body: "Our grassroots climate conference brings the global conversation to the women it affects most.", motif: "photo", image: "/images/cop-2.jpeg", href: "/cop-mashinani" },
        ],
      }),
      S("impact", {
        heading: "Why this work matters",
        intro: "In the places we work, violence against women and the climate crisis feed each other. These are the national figures we start from.",
        items: [
          { value: "34%", label: "of women aged 15 to 49 have experienced physical violence since age 15" },
          { value: "13%", label: "of women aged 15 to 49 have experienced sexual violence" },
          { value: "15%", label: "of women aged 15 to 49 have undergone female genital mutilation" },
        ],
        source: "Kenya Demographic and Health Survey 2022, Kenya National Bureau of Statistics",
      }),
      S("gallery", {
        heading: "From the grassroots",
        items: [
          { image: "/images/cop28.jpeg", caption: "COP28 Mashinani", place: "Isinya, November 2023" },
          { image: "/images/table-banking.jpg", caption: "Table banking circle", place: "Kajiado" },
          { image: "/images/voices.jpeg", caption: "Voices of resilience", place: "Maasai women, 2024" },
          { image: "/images/cop-1.jpeg", caption: "Community dialogue", place: "Kajiado" },
          { image: "/images/cop-2.jpeg", caption: "Localising climate solutions", place: "COP Mashinani" },
        ],
      }),
      S("reportCta", {
        heading: "You are not alone. Tell us what happened.",
        body: "If you have experienced violence or abuse, including violence linked to land, water or conflict, our case team will listen and connect you to support. You can report without giving your name.",
        showHotlines: true,
      }),
      S("county", { heading: "Your county. Your next step.", intro: "Wherever you are in Kenya, there is something you can do today." }),
      S("posts", { heading: "News and articles", kind: "all", limit: 3 }),
      S("partners", { heading: "Working with", items: partners }),
    ],
  },
  {
    slug: "about", title: "About us", seo: "Our vision, mission, story and values: an Africa where women are empowered to lead climate action.",
    sections: [
      S("pageHeader", { title: "An Africa where women lead climate action.", intro: "WOPCAA harnesses the collective expertise of women to catalyse innovative climate actions, and to make sure the people most affected are heard first.", image: "/images/about.jpeg" }),
      S("photoPair", { heading: "Our vision and mission", imageA: "/images/maasai-women.jpg", imageB: "/images/table-banking.jpg", body: "**Our vision.** We envision an Africa where women are empowered to lead climate action.\n\n**Our mission.** Our mission is to harness the collective expertise of women to catalyse innovative climate actions.", link: { label: "Join us", href: "/membership" } }),
      S("statement", {
        text: "We were born from a stark realisation: climate change isn't just a global crisis, it's a gendered one.",
        body: "## The gender and climate lens\n\nWomen carry a disproportionate share of the burden when droughts, floods and conflict over resources strike, yet they are too often absent where decisions are made. We look at every climate question through that lens.\n\n## The expert for the vulnerable model\n\nOur members are professionals and community leaders who put their expertise to work for those most exposed. We call them experts for the vulnerable.",
        link: { label: "", href: "" },
      }),
      S("values", {
        heading: "Strategic interventions",
        items: [
          { title: "Promoting gender-responsive climate action", body: "Making sure climate plans, funds and programmes reach and are shaped by women." },
          { title: "Building community-led resilience", body: "Supporting local adaptation, livelihoods and early warning that communities own." },
          { title: "Advancing knowledge and research", body: "Documenting what works at the grassroots and sharing it widely." },
          { title: "Advocating for inclusive policies", body: "Engaging county and national policy so that justice and equal opportunity prevail." },
          { title: "Organisational capacity building", body: "Strengthening women-led groups to lead, manage and sustain their work." },
        ],
      }),
      { ...S("values", {
        heading: "Our values",
        items: [
          { title: "Empowerment", body: "We build the confidence, skills and voice of women to lead." },
          { title: "Collaboration", body: "We work with communities, partners and government, because no one solves this alone." },
          { title: "Inclusivity", body: "Every woman, in every community, belongs in the conversation." },
          { title: "Sustainability", body: "We choose solutions that protect people and the planet for the long term." },
          { title: "Innovation", body: "We test new ideas and learn from local knowledge." },
          { title: "Justice", body: "We stand for fairness, accountability and an end to violence against women." },
        ],
      }), _key: "values" },
      S("partners", { heading: "In partnership with", items: partners }),
      S("cta", { heading: "Lend your expertise to those who need it most.", body: "Join WOPCAA as an individual or organisation member.", primary: { label: "Membership", href: "/membership" }, secondary: { label: "Contact us", href: "/contact" }, tone: "forest" }),
    ],
  },
  {
    slug: "cop-mashinani", title: "COP Mashinani", seo: "Amplifying grassroots women's voices for climate action in Kenya.",
    sections: [
      S("pageHeader", { title: "Amplifying grassroots women's voices for climate action.", intro: "COP Mashinani is a regional initiative that takes the principles of the global climate conference to a local level. Mashinani means \"at the grassroots\".", image: "/images/table-banking.jpg" }),
      S("values", {
        heading: "What COP Mashinani sets out to do",
        items: [
          { title: "Empowering grassroots voices", body: "Creating a platform where women from local communities speak for themselves on climate." },
          { title: "Localising climate solutions", body: "Turning global commitments into actions that make sense in Kajiado and beyond." },
          { title: "Building resilient communities", body: "Sharing practical approaches to adaptation, livelihoods and peace." },
        ],
      }),
      S("photoPair", { heading: "COP28 Mashinani, 24 November 2023", imageA: "/images/cop28.jpeg", imageB: "/images/cop-1.jpeg", body: "Our first COP Mashinani brought together Maasai women leaders, county officials, partners and young people in Isinya ahead of COP28.\n\nThe conversation ran on three themes:\n\n- Sustainability and localising climate solutions\n- Community collaboration for climate justice\n- Voices of change: empowering women in climate action", link: { label: "Read: Voices of Resilience", href: "/news" } }),
      S("gallery", {
        heading: "Isinya, 2023.",
        items: [
          { image: "/images/cop-1.jpeg", caption: "Opening session", place: "Isinya" },
          { image: "/images/cop-2.jpeg", caption: "Women leaders' panel", place: "Isinya" },
          { image: "/images/voices.jpeg", caption: "Voices of resilience", place: "Kajiado" },
          { image: "/images/table-banking.jpg", caption: "Table banking", place: "Kajiado" },
        ],
      }),
      S("cta", { heading: "Bring COP Mashinani to your county.", body: "We are looking for partners to take the conversation to more communities.", primary: { label: "Partner with us", href: "/contact" }, secondary: { label: "", href: "" }, tone: "ochre" }),
    ],
  },
  {
    slug: "our-people", title: "Our people", seo: "The people who lead WOPCAA.",
    sections: [
      S("pageHeader", { title: "The people behind WOPCAA.", intro: "Professionals and community leaders who put their expertise to work for those most exposed to the climate crisis: experts for the vulnerable.", image: "/images/about.jpeg" }),
      S("team", {
        heading: "Leadership", intro: "",
        items: [
          { name: "Dr. Skitter Wangeci Mbugua", role: "Executive Director", photo: "", bio: "PhD, MBA, CPM, HSC. Leads WOPCAA's strategy and partnerships, and writes on climate resilience, peace and women's leadership." },
        ],
      }),
      S("cta", { heading: "Lend your expertise.", body: "WOPCAA's board and secretariat grow from its members. Join as an individual or organisation.", primary: { label: "Become a member", href: "/membership" }, secondary: { label: "Contact us", href: "/contact" }, tone: "sand" }),
    ],
  },
  {
    slug: "membership", title: "Membership", seo: "Join WOPCAA as an individual or organisation member.",
    sections: [
      S("pageHeader", { title: "Join a community of experts for the vulnerable.", intro: "Members bring their skills to women and communities on the frontline of climate change, and help shape where WOPCAA goes next.", image: "" }),
      S("tiers", {
        heading: "Two ways to join", intro: "Fees support grassroots programmes and the running of the association.",
        items: [
          { name: "Individual", price: "KSh 5,000", note: "Joining fee, then KSh 3,000 a year", features: "Vote at the general meeting\nJoin thematic working groups\nInvitations to trainings and COP Mashinani\nMember directory listing", cta: { label: "Apply now", href: "#apply" }, featured: false },
          { name: "Organisation", price: "KSh 10,000", note: "Joining fee, then KSh 5,000 a year", features: "Everything in Individual\nPartner on joint programmes\nFeature your work in our media centre\nTwo named representatives", cta: { label: "Apply now", href: "#apply" }, featured: true },
        ],
      }),
      S("form", { heading: "Apply for membership", intro: "Tell us a little about yourself or your organisation. Our secretariat will get in touch with the next steps and payment details." }),
      S("faq", {
        heading: "Before you apply",
        items: [
          { q: "Who can join?", a: "Women and men professionals, community leaders and organisations who share our vision of an Africa where women lead climate action." },
          { q: "How do I pay?", a: "Once your application is reviewed, the secretariat will send you payment details." },
          { q: "Can I volunteer instead?", a: "Yes. Send us a message through the contact page and tell us how you would like to help." },
        ],
      }),
    ],
  },
  {
    slug: "contact", title: "Contact", seo: "Get in touch with WOPCAA.",
    sections: [
      S("contact", { heading: "Let's talk.", intro: "For partnerships, media, membership or anything else. If you need to report abuse, please use the safe reporting form instead." }),
      S("reportCta", { heading: "Report abuse safely, anonymously if you choose.", body: "", showHotlines: true }),
    ],
  },
  {
    slug: "privacy", title: "Privacy", seo: "How WOPCAA protects the information you share.",
    sections: [
      S("richText", {
        heading: "How we protect what you share.", narrow: true,
        body: "## Reports\n\nWhat you write in a report, your location details and your contact details are encrypted before they are stored. Only members of the WOPCAA case team can read them, and every time a report is opened it is logged.\n\nYou can report **anonymously**. We do not ask for your name, and we do not store your IP address with the report. You receive a reference and a private key; we keep only a one-way fingerprint of the key, so we cannot recover it for you.\n\n## Sharing\n\nWe share a report with a partner, such as a legal aid clinic or shelter, only if you say we may, and we ask before sharing names.\n\n## Accounts\n\nIf you create an account, we store your email address and the name you choose. You can use a nickname.\n\n## Newsletter and contact forms\n\nWe use your email only to reply or to send the newsletter you signed up for. Write to info@wopcaa.org to be removed.",
      }),
    ],
  },
];

// ── settings
await sql`insert into site_settings(id, data) values ('site', ${JSON.stringify(settings)})
          on conflict (id) do update set data = case when ${force} then excluded.data else site_settings.data end`;
console.log("settings ok");

// ── pages
for (const p of pages) {
  const exists = await sql`select id from pages where slug = ${p.slug}`;
  if (exists.length && !force) { console.log("page exists", p.slug); continue; }
  if (exists.length) await sql`delete from pages where slug = ${p.slug}`;
  const [row] = await sql`insert into pages(slug, title, seo_description, sections, status, published_at, show_in_nav)
    values (${p.slug}, ${p.title}, ${p.seo}, ${JSON.stringify(p.sections)}, 'published', now(), ${p.slug !== "privacy"}) returning id`;
  await sql`insert into page_revisions(page_id, title, seo_description, sections, note) values (${row.id}, ${p.title}, ${p.seo}, ${JSON.stringify(p.sections)}, 'Initial content')`;
  console.log("page", p.slug);
}

// ── media library: the bundled images
const imgDir = join(root, "public", "images");
const files = [...readdirSync(imgDir).filter((f) => /\.(png|jpe?g|svg|webp)$/i.test(f)).map((f) => `/images/${f}`),
  ...readdirSync(join(imgDir, "partners")).map((f) => `/images/partners/${f}`)];
for (const url of files) {
  const has = await sql`select 1 from media where url = ${url}`;
  if (!has.length) await sql`insert into media(url, alt) values (${url}, ${url.split("/").pop().replace(/\.[^.]+$/, "").replace(/[-_]/g, " ")})`;
}
console.log("media", files.length);

// ── posts (from db/seed/posts.json when present)
const postsFile = join(root, "db", "seed", "posts.json");
if (existsSync(postsFile)) {
  const posts = JSON.parse(readFileSync(postsFile, "utf8"));
  for (const p of posts) {
    const exists = await sql`select id from posts where slug = ${p.slug}`;
    if (exists.length && !force) continue;
    if (exists.length) await sql`delete from posts where slug = ${p.slug}`;
    await sql`insert into posts(slug, kind, title, excerpt, body, cover_image, author, category, event_start, event_location, status, published_at)
      values (${p.slug}, ${p.kind}, ${p.title}, ${p.excerpt ?? null}, ${p.body ?? ""}, ${p.cover_image ?? null}, ${p.author ?? null}, ${p.category ?? null},
              ${p.event_start ?? null}, ${p.event_location ?? null}, 'published', ${p.published_at})`;
  }
  console.log("posts", posts.length);
}
