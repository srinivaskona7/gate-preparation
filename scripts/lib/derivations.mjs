// memory/chapters/<id>/derivations.md: parsed by check-memory.mjs, rendered by emit-site-data.mjs.
//
//   # <Chapter title>: derivations
//   ## <Section title>
//   <!-- topics: <chapter>.<topic>, <chapter>.<topic> -->
//   **Claim.** …
//   **Proof.** … (or **Derivation.** …)
//
// Math is $…$ inline and $$…$$ display, and a literal dollar is \$. Code is never scanned for math.
import katex from 'katex';
import { marked } from 'marked';

const FENCE = /^ {0,3}(```|~~~)/;
const TOPICS = /^<!--\s*topics:\s*(.*?)\s*-->$/;

export const slugify = (title) =>
  title.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/** Splits the file into its title, an optional intro and the "## " sections. */
export function parseDerivations(markdown) {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const intro = [];
  const sections = [];
  const h1 = [];
  let current = null;
  let inFence = false;
  lines.forEach((line, i) => {
    if (FENCE.test(line)) inFence = !inFence;
    else if (!inFence && /^# /.test(line)) return h1.push({ line: i + 1, text: line.slice(2).trim() });
    else if (!inFence && /^## /.test(line)) {
      current = { title: line.slice(3).trim(), line: i + 1, topics: null, lines: [] };
      return sections.push(current);
    } else if (!inFence && current && current.topics === null && current.lines.every((l) => !l.trim())) {
      const m = TOPICS.exec(line.trim());
      if (m) return (current.topics = m[1].split(',').map((s) => s.trim()).filter(Boolean));
    }
    (current ? current.lines : intro).push(line);
  });
  const firstLine = lines.findIndex((l) => l.trim()) + 1;
  return {
    title: h1[0]?.line === firstLine ? h1[0].text : null,
    extraTitles: h1.filter((h) => h.line !== firstLine),
    intro: intro.join('\n').trim(),
    sections: sections.map(({ title, line, topics, lines: body }) => ({ title, line, topics, body: body.join('\n').trim() })),
  };
}

function splitFences(text) {
  const chunks = [];
  let buf = [];
  let code = false;
  for (const line of text.split('\n')) {
    if (!FENCE.test(line)) {
      buf.push(line);
      continue;
    }
    if (code) buf.push(line);
    chunks.push({ code, value: buf.join('\n') });
    buf = code ? [] : [line];
    code = !code;
  }
  chunks.push({ code, value: buf.join('\n') });
  return chunks;
}

// The index of the delimiter that closes math opened just before `from`, or -1.
function findClose(s, from, display) {
  for (let j = from; j < s.length; j++) {
    if (s[j] === '\\') j++;
    else if (s[j] === '$' && (!display || s[j + 1] === '$')) return j;
  }
  return -1;
}

// Appends text/inline/display tokens for one stretch of prose; returns an error message or null.
function tokenizeProse(s, tokens) {
  let buf = '';
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === '`') {
      const run = /^`+/.exec(s.slice(i))[0];
      const end = s.indexOf(run, i + run.length);
      const stop = end < 0 ? i + run.length : end + run.length;
      buf += s.slice(i, stop);
      i = stop;
    } else if (ch === '\\' && s[i + 1] === '$') {
      buf += '\\$';
      i += 2;
    } else if (ch === '$') {
      const display = s[i + 1] === '$';
      const open = display ? 2 : 1;
      const end = findClose(s, i + open, display);
      if (end < 0) return `unclosed ${display ? '$$' : '$'} math`;
      const value = s.slice(i + open, end).trim();
      if (!value) return 'empty math';
      if (!display && value.includes('\n\n')) return 'inline $ math runs across a blank line';
      if (buf) tokens.push({ kind: 'text', value: buf });
      buf = '';
      tokens.push({ kind: display ? 'display' : 'inline', value });
      i = end + open;
    } else {
      buf += ch;
      i++;
    }
  }
  if (buf) tokens.push({ kind: 'text', value: buf });
  return null;
}

/** Splits markdown into text, inline-math and display-math tokens; code stays inside text tokens. */
export function tokenizeMath(markdown) {
  const tokens = [];
  const chunks = splitFences(markdown);
  for (const [k, chunk] of chunks.entries()) {
    const value = chunk.value + (k < chunks.length - 1 ? '\n' : '');
    if (chunk.code) {
      tokens.push({ kind: 'text', value, code: true });
      continue;
    }
    const error = tokenizeProse(value, tokens);
    if (error) return { tokens, error };
  }
  return { tokens, error: null };
}

/** Markdown with math to HTML. KaTeX runs here, at build time, so pages ship rendered math. */
export function renderMarkdown(markdown) {
  const { tokens, error } = tokenizeMath(markdown);
  if (error) throw new Error(error);
  const math = [];
  const source = tokens
    .map((t) => {
      if (t.kind === 'text') return t.value;
      math.push(t);
      return `KTXMATH${math.length - 1}Z`;
    })
    .join('');
  const html = marked.parse(source, { gfm: true, async: false });
  return html.replace(/KTXMATH(\d+)Z/g, (_, i) =>
    katex.renderToString(math[i].value, { displayMode: math[i].kind === 'display', throwOnError: true, strict: 'ignore' }),
  );
}

/** Searchable plain text: prose only, without markdown punctuation, math or code. */
export function plainText(markdown) {
  return tokenizeMath(markdown)
    .tokens.filter((t) => t.kind === 'text' && !t.code)
    .map((t) => t.value)
    .join(' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/[*_#>|~-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
