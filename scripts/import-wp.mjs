// One-off: brings the full article text from the old WordPress site (wp-json export in
// db/seed/wp/posts.json) into Markdown, copies in-body images into public/images/articles,
// and updates both db/seed/posts.json and the posts table.
// Usage: node --env-file=.env.local scripts/import-wp.mjs
import TurndownService from "turndown";
import { neon } from "@neondatabase/serverless";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, basename } from "node:path";

const root = join(import.meta.dirname, "..");
const wp = JSON.parse(readFileSync(join(root, "db/seed/wp/posts.json"), "utf8").replace(/^﻿/, ""));
const seedFile = join(root, "db/seed/posts.json");
const seed = JSON.parse(readFileSync(seedFile, "utf8"));
const sql = neon(process.env.DATABASE_URL);
const imgDir = join(root, "public/images/articles");
mkdirSync(imgDir, { recursive: true });

const MAP = {
  "flooding-in-eastafrica": "flooding-and-climate-change-in-east-africa",
  "voices-of-resilience": "voices-of-resilience-maasai-women-cop-mashinani",
  "climate-resilience-and-sustainable-peace-empowering-women": "advancing-climate-resilience-and-sustainable-peace",
  "empowering-women-for-climate-resilience": "empowering-women-for-climate-resilience",
  "strategic-planning-for-a-sustainable-future": "strategic-planning-for-a-sustainable-future",
  "strategies-for-peaceful-conflict-resolution": "promoting-non-violence",
  "climate-resilience-and-sustainable-agriculture": "climate-resilience-and-sustainable-agriculture",
  "role-of-women-in-climate-action": "the-role-of-women-in-climate-action",
};

const td = new TurndownService({ headingStyle: "atx", bulletListMarker: "-", emDelimiter: "*" });
td.remove(["script", "style", "noscript", "iframe", "form"]);
// Elementor wraps everything in divs; headings are sometimes bold paragraphs. Keep it plain.
td.addRule("figure", { filter: "figure", replacement: (c) => `\n\n${c.trim()}\n\n` });

async function localise(md) {
  const urls = [...md.matchAll(/!\[[^\]]*\]\((https?:\/\/wopcaa\.org\/[^)\s]+)\)/g)].map((m) => m[1]);
  for (const url of new Set(urls)) {
    const clean = url.split("?")[0];
    const file = basename(clean).replace(/-\d+x\d+(?=\.\w+$)/, "");
    const out = join(imgDir, file);
    if (!existsSync(out)) {
      try {
        const res = await fetch(clean.replace(/-\d+x\d+(?=\.\w+$)/, ""));
        const r2 = res.ok ? res : await fetch(clean);
        if (!r2.ok) throw new Error(String(r2.status));
        writeFileSync(out, Buffer.from(await r2.arrayBuffer()));
      } catch (e) {
        console.warn("image failed", url, e.message);
        continue;
      }
    }
    md = md.split(url).join(`/images/articles/${file}`);
  }
  return md;
}

for (const p of wp) {
  const slug = MAP[p.slug];
  if (!slug) continue;
  let md = td.turndown(p.content.rendered)
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\s*\\?-\s*$/gm, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  md = await localise(md);
  const entry = seed.find((s) => s.slug === slug);
  if (entry) entry.body = md;
  await sql`update posts set body = ${md}, updated_at = now() where slug = ${slug}`;
  console.log(slug, md.length, "chars");
}
writeFileSync(seedFile, JSON.stringify(seed, null, 2) + "\n");
