// Text and TeX rules shared by check-manifest.mjs (chapter content) and
// check-memory.mjs (derivations, solved PYQs, the paper ledger).
import katex from 'katex';

export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Meta-commentary about the notes leaks into pages unless banned outright.
// ("the source" alone stays legal: networking needs "the source port".)
export const BANNED = /\b(according to the (source|notes|pdf)|the (source|notes) (says|said|states|stated|claims|claimed|mentions|lists|gives|calls|labels)|the pdf|this pdf|in the notes|as per the (notes|source)|lorem ipsum|TODO|TBD|FIXME)\b|\?\?\?|\p{Extended_Pictographic}/iu;

// Claims about how often the exam asks something. The ledger cannot support them, and the
// spec forbids inventing frequency, so prose may not make them.
export const FREQUENCY = /\b((almost|nearly|virtually) (every|each) (paper|year|exam)|(appears?|recurs?|recurring|asked|tested|repeated(ly)?) (almost |nearly )?(every|each) (paper|year|exam)|every (paper|year) (has|asks|brings|carries)|(is|are) (one of )?the most (repeated|frequently asked|frequently tested)|most (repeated|frequently asked) \w+|favou?rite (numeric |numerical )?(question|way|topic|check)|(GATE|exams?|papers?) (regularly|often|repeatedly|keeps?) (asks?|tests?|sets?|repeats?)|regularly (asks?|appears?|tested)|appear in most \w+ (statement )?questions?)\b/i;

// Stock phrases of generated prose (the avoid-ai-writing list). Memory files are held to it.
export const AI_TELLS = /\b(delv(e|es|ed|ing)|leverag(e|es|ed|ing)|utili[sz](e|es|ed|ing|ation)|seamless(ly)?|pivotal|testament to|embark(s|ed|ing)?|tapestry|plethora|myriad|cutting[- ]edge|game[- ]changer|it(?:'|’)?s worth noting|it is worth noting|in conclusion|needless to say|let(?:'|’)s dive|dive into|deep dive|moreover|furthermore|in today(?:'|’)s)\b/iu;

export const isStr = (v, min = 1) => typeof v === 'string' && v.trim().length >= min;
export const isInt = (v) => Number.isInteger(v);
export const isUrl = (v) => typeof v === 'string' && /^https:\/\/[^\s]+$/.test(v);

/** Collects errors; `tells` adds the AI_TELLS ban to every prose check. */
export function createChecker({ tells = false } = {}) {
  const errors = [];
  const fail = (where, msg) => errors.push(`${where}: ${msg}`);

  function checkTex(where, tex, displayMode = true) {
    try {
      katex.renderToString(tex, { throwOnError: true, strict: 'ignore', displayMode });
    } catch (e) {
      fail(where, `TeX does not render: ${e.message.split('\n')[0]}`);
    }
  }

  function checkBanned(where, value) {
    if (BANNED.test(value)) fail(where, `banned phrase "${value.match(BANNED)[0]}"`);
    if (FREQUENCY.test(value)) fail(where, `frequency claim "${value.match(FREQUENCY)[0]}" (the ledger cannot support it)`);
    if (tells && AI_TELLS.test(value)) fail(where, `AI-writing phrase "${value.match(AI_TELLS)[0]}"`);
  }

  // Prose fields may carry inline math as $...$; a literal dollar is written \$.
  function checkText(where, value, { min = 1, max = 600, math = true } = {}) {
    if (!isStr(value, min)) return fail(where, `expected text of at least ${min} chars`);
    if (value.length > max) fail(where, `text is ${value.length} chars, limit ${max}`);
    checkBanned(where, value);
    if (!math) return;
    const segments = value.replace(/\\\$/g, '').split('$');
    if (segments.length % 2 === 0) return fail(where, 'unbalanced $ inline-math delimiters');
    for (let i = 1; i < segments.length; i += 2) checkInline(where, segments[i]);
  }

  function checkInline(where, tex) {
    try {
      katex.renderToString(tex, { throwOnError: true, strict: 'ignore' });
    } catch (e) {
      fail(where, `inline math "$${tex}$" does not render: ${e.message.split('\n')[0]}`);
    }
  }

  function checkList(where, list, min, each) {
    if (!Array.isArray(list)) return fail(where, 'expected an array');
    if (list.length < min) fail(where, `expected at least ${min} entries, got ${list.length}`);
    list.forEach((item, i) => each(item, `${where}[${i}]`));
  }

  return { errors, fail, checkTex, checkInline, checkBanned, checkText, checkList };
}
