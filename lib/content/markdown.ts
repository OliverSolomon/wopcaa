import { Marked, type Tokens } from "marked";

/**
 * Markdown from the studio. Raw HTML is escaped rather than passed through, and
 * links are limited to http(s), mailto, tel and site-relative paths, so content
 * cannot inject script even if an editor account is misused.
 */
const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const safeHref = (href: string) => (/^(https?:|mailto:|tel:|\/|#)/i.test(href.trim()) ? href.trim() : "#");

const md = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    html(token: Tokens.HTML | Tokens.Tag) {
      return escape(token.text);
    },
    link(this: { parser: { parseInline: (t: Tokens.Generic[]) => string } }, token: Tokens.Link) {
      const href = safeHref(token.href);
      const external = /^https?:/i.test(href);
      const text = this.parser.parseInline(token.tokens);
      return `<a href="${escape(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${text}</a>`;
    },
    image(token: Tokens.Image) {
      return `<img src="${escape(safeHref(token.href))}" alt="${escape(token.text)}" loading="lazy" />`;
    },
  },
});

export const renderMarkdown = (src: string | null | undefined) => (src ? (md.parse(src, { async: false }) as string) : "");

/** *word* → <em>word</em> for display titles; everything else escaped. */
export const emphasise = (s: string | null | undefined) => escape(s ?? "").replace(/\*([^*]+)\*/g, "<em>$1</em>");
