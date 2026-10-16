'use strict';
// Pure parsing helpers (no `vscode` dependency) so they can be unit-tested with plain Node.

// ---------------------------------------------------------------------------
// PHP lexical mask: one byte per character telling what kind of text it is.
// ---------------------------------------------------------------------------
const HTML = 0, CODE = 1, STR = 2, COMMENT = 3, OPEN = 4, CLOSE = 5;
const M_HTML = 0, M_CODE = 1, M_LINE = 2, M_BLOCK = 3, M_STR = 4, M_HEREDOC = 5;

function buildMask(text) {
  const n = text.length;
  const mask = new Uint8Array(n);
  let mode = /<\?(?:php|=)/i.test(text) ? M_HTML : M_CODE;
  let quote = '', hid = '';
  let i = 0;
  while (i < n) {
    const c = text[i], d = text[i + 1];
    if (mode === M_HTML) {
      if (c === '<' && d === '?') {
        const len = text.substr(i, 5).toLowerCase() === '<?php' ? 5 : (text[i + 2] === '=' ? 3 : 2);
        mask.fill(CODE, i, i + len); i += len; mode = M_CODE; continue;
      }
      mask[i++] = HTML; continue;
    }
    if (mode === M_CODE) {
      if (c === '?' && d === '>') { mask.fill(CODE, i, i + 2); i += 2; mode = M_HTML; continue; }
      if ((c === '/' && d === '/') || (c === '#' && d !== '[')) { mask[i++] = COMMENT; mode = M_LINE; continue; }
      if (c === '/' && d === '*') { mask.fill(COMMENT, i, i + 2); i += 2; mode = M_BLOCK; continue; }
      if (c === "'" || c === '"' || c === '`') { quote = c; mask[i++] = OPEN; mode = M_STR; continue; }
      if (c === '<' && text.startsWith('<<<', i)) {
        const hm = /^<<<[ \t]*(["']?)([A-Za-z_]\w*)\1\r?\n/.exec(text.substr(i, 120));
        if (hm) { mask.fill(OPEN, i, i + hm[0].length); i += hm[0].length; hid = hm[2]; mode = M_HEREDOC; continue; }
      }
      mask[i++] = CODE; continue;
    }
    if (mode === M_LINE) {
      if (c === '\n') { mask[i++] = CODE; mode = M_CODE; continue; }
      if (c === '?' && d === '>') { mask.fill(CODE, i, i + 2); i += 2; mode = M_HTML; continue; }
      mask[i++] = COMMENT; continue;
    }
    if (mode === M_BLOCK) {
      if (c === '*' && d === '/') { mask.fill(COMMENT, i, i + 2); i += 2; mode = M_CODE; continue; }
      mask[i++] = COMMENT; continue;
    }
    if (mode === M_STR) {
      if (c === '\\') { mask.fill(STR, i, Math.min(n, i + 2)); i += 2; continue; }
      if (c === quote) { mask[i++] = CLOSE; mode = M_CODE; continue; }
      mask[i++] = STR; continue;
    }
    // heredoc / nowdoc
    if (c === '\n') {
      const hm = new RegExp('^[ \\t]*' + hid + '\\b').exec(text.substr(i + 1, hid.length + 60));
      if (hm) {
        mask[i] = STR;
        mask.fill(CLOSE, i + 1, i + 1 + hm[0].length);
        i += 1 + hm[0].length; mode = M_CODE; continue;
      }
    }
    mask[i++] = STR;
  }
  return mask;
}

/** If `offset` (cursor) is inside a PHP string literal, describe that literal. */
function stringAt(text, mask, offset) {
  if (offset <= 0 || offset > text.length) return null;
  const m = mask[offset - 1];
  if (m !== STR && m !== OPEN) return null;
  let start = offset;
  while (start > 0 && mask[start - 1] === STR) start--;
  let end = offset;
  while (end < text.length && mask[end] === STR) end++;
  let openerStart = start - 1;
  while (openerStart > 0 && mask[openerStart - 1] === OPEN) openerStart--;
  return { start, end, openerStart, quote: text[start - 1] };
}

// ---------------------------------------------------------------------------
// Generic SQL text helpers
// ---------------------------------------------------------------------------
const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'IS NULL', 'IS NOT NULL', 'LIKE', 'BETWEEN',
  'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN',
  'JOIN', 'ON', 'AS', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'ASC', 'DESC', 'DISTINCT',
  'COUNT(*)', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ROUND', 'CONCAT', 'UPPER', 'LOWER', 'NOW()',
  'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'UNION', 'EXISTS', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE',
  'PRIMARY KEY', 'AUTO_INCREMENT', 'INT', 'VARCHAR', 'DECIMAL', 'DATE', 'TEXT', 'NULL', 'DEFAULT',
  'TRUNCATE TABLE', 'IFNULL', 'COALESCE'
];

const STOP = new Set([
  'WHERE', 'ON', 'USING', 'SET', 'VALUES', 'VALUE', 'SELECT', 'INNER', 'LEFT', 'RIGHT', 'JOIN', 'CROSS',
  'NATURAL', 'FULL', 'OUTER', 'GROUP', 'ORDER', 'LIMIT', 'HAVING', 'UNION', 'AS', 'IF', 'WINDOW', 'FOR',
  'LOCK', 'PARTITION', 'DEFAULT', 'STRAIGHT_JOIN', 'INTO', 'FROM', 'AND', 'OR', 'END', 'ASC', 'DESC',
  'OFFSET', 'NOT', 'NULL', 'IS', 'LIKE', 'IN', 'BETWEEN', 'THEN', 'ELSE', 'WHEN'
]);

function stripSqlComments(sql) {
  return sql.replace(/--[^\n]*|(^|\s)#[^\n]*|\/\*[\s\S]*?\*\//g, ' ');
}

function cleanIdent(s) {
  return s.trim().replace(/[`"\[\]]/g, '').replace(/^\w+\./, '');
}

function matchParen(s, open) {
  let depth = 0, q = null;
  for (let i = open; i < s.length; i++) {
    const ch = s[i];
    if (q) { if (ch === '\\') i++; else if (ch === q) q = null; continue; }
    if (ch === "'" || ch === '"' || ch === '`') { q = ch; continue; }
    if (ch === '(') depth++;
    else if (ch === ')' && --depth === 0) return i;
  }
  return -1;
}

function splitTopLevel(s) {
  const parts = [];
  let depth = 0, cur = '', q = null;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (q) {
      cur += ch;
      if (ch === '\\') cur += s[++i] || '';
      else if (ch === q) q = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') { q = ch; cur += ch; continue; }
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ',' && depth === 0) { parts.push(cur); cur = ''; continue; }
    cur += ch;
  }
  parts.push(cur);
  return parts.map(p => p.trim()).filter(Boolean);
}

function looksLikeSql(s) {
  return /^\s*\(?\s*(SELECT|WITH|SHOW|DESCRIBE|INSERT|UPDATE|DELETE|REPLACE|CALL)\b/i.test(s);
}

function isValidIdent(s) {
  return /^[A-Za-z_][\w$]*$/.test(s) && !STOP.has(s.toUpperCase());
}

// ---------------------------------------------------------------------------
// Schema extraction (from .sql dumps or PHP files containing SQL)
// ---------------------------------------------------------------------------
function getTable(result, name) {
  const key = name.toLowerCase();
  let t = result.tables.get(key);
  if (!t) { t = { name, defined: new Map(), inferred: new Map() }; result.tables.set(key, t); }
  return t;
}

function addCol(map, name, info) {
  const key = name.toLowerCase();
  if (!map.has(key)) map.set(key, Object.assign({ name }, info));
}

function parseSchemaText(text) {
  const result = { databases: [], tables: new Map() };
  const src = stripSqlComments(text);
  let m;

  const dbs = new Set();
  const dbRe = /\bCREATE\s+(?:DATABASE|SCHEMA)\s+(?:IF\s+NOT\s+EXISTS\s+)?`?(\w+)`?|\bUSE\s+`?(\w+)`?\s*(?:;|$)|\$(?:dbname|db_name|database|dbName|db)\s*=\s*["'](\w+)["']/gim;
  while ((m = dbRe.exec(src))) dbs.add(m[1] || m[2] || m[3]);
  result.databases = [...dbs];

  // CREATE TABLE — authoritative column lists
  const ctRe = /\bCREATE\s+(?:TEMPORARY\s+)?TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:`?\w+`?\.)?`?(\w+)`?\s*\(/gi;
  while ((m = ctRe.exec(src))) {
    const open = ctRe.lastIndex - 1;
    const close = matchParen(src, open);
    if (close < 0) continue;
    const table = getTable(result, m[1]);
    const pkCols = [];
    for (const part of splitTopLevel(src.slice(open + 1, close))) {
      const pk = /^(?:CONSTRAINT\s+\S+\s+)?PRIMARY\s+KEY\s*\(([^)]*)\)/i.exec(part);
      if (pk) { pk[1].split(',').forEach(c => pkCols.push(cleanIdent(c).toLowerCase())); continue; }
      if (/^(?:CONSTRAINT|PRIMARY|KEY|INDEX|UNIQUE|FOREIGN|CHECK|FULLTEXT|SPATIAL)\b/i.test(part)) continue;
      const cm = /^[`"\[]?([A-Za-z_][\w$]*)[`"\]]?\s+([A-Za-z]+(?:\s*\([^)]*\))?(?:\s+UNSIGNED)?)/i.exec(part);
      if (!cm) continue;
      addCol(table.defined, cm[1], {
        type: cm[2].replace(/\s+/g, ' ').toUpperCase(),
        pk: /\bPRIMARY\s+KEY\b/i.test(part),
        autoIncrement: /\b(AUTO_INCREMENT|AUTOINCREMENT|IDENTITY)\b/i.test(part) || /^SERIAL\b/i.test(cm[2])
      });
    }
    for (const c of pkCols) { const col = table.defined.get(c); if (col) col.pk = true; }
    ctRe.lastIndex = close;
  }

  // ALTER TABLE t ADD [COLUMN] c TYPE
  const altRe = /\bALTER\s+TABLE\s+`?(\w+)`?\s+ADD\s+(?:COLUMN\s+)?`?(\w+)`?\s+(\w+(?:\s*\([^)]*\))?)/gi;
  while ((m = altRe.exec(src))) {
    if (/^(CONSTRAINT|PRIMARY|INDEX|KEY|UNIQUE|FOREIGN|FULLTEXT)$/i.test(m[2])) continue;
    addCol(getTable(result, m[1]).defined, m[2], { type: m[3].toUpperCase(), pk: false, autoIncrement: false });
  }

  // Inferred columns, used only for tables that have no CREATE TABLE anywhere.
  const insRe = /\b(?:INSERT|REPLACE)\s+(?:IGNORE\s+)?INTO\s+(?:`?\w+`?\.)?`?(\w+)`?\s*\(([^)]*)\)/gi;
  while ((m = insRe.exec(src))) {
    const t = getTable(result, m[1]);
    for (const c of m[2].split(',')) { const n = cleanIdent(c); if (isValidIdent(n)) addCol(t.inferred, n, {}); }
  }

  const updRe = /\bUPDATE\s+`?(\w+)`?\s+SET\s+([\s\S]*?)(?:\bWHERE\b|;|["']\s*[;.)]|$)/gi;
  while ((m = updRe.exec(src))) {
    const t = getTable(result, m[1]);
    for (const part of splitTopLevel(m[2])) {
      const cm = /^`?(\w+)`?\s*=/.exec(part);
      if (cm && isValidIdent(cm[1])) addCol(t.inferred, cm[1], {});
    }
  }

  const selRe = /\bSELECT\s+((?:(?!\bSELECT\b|;)[\s\S]){1,800}?)\s+FROM\s+`?(\w+)`?/gi;
  while ((m = selRe.exec(src))) {
    const rest = src.slice(selRe.lastIndex, selRe.lastIndex + 300).split(/[;"']/)[0];
    if (/\bJOIN\b|^\s*(?:AS\s+)?\w*\s*,/i.test(rest)) continue;
    const t = getTable(result, m[2]);
    for (const item of splitTopLevel(m[1])) {
      const cm = /^(?:DISTINCT\s+)?(?:`?\w+`?\.)?`?(\w+)`?(?:\s+(?:AS\s+)?\w+)?$/i.exec(item);
      if (cm && isValidIdent(cm[1])) addCol(t.inferred, cm[1], {});
    }
  }

  // Drop phantom tables (e.g. "users" referenced only by an UPDATE with no SET match)
  for (const [k, t] of result.tables) if (!t.defined.size && !t.inferred.size) result.tables.delete(k);
  return result;
}

/** Merge per-file parse results into { databases: string[], tables: Map<lower, {name, columns[]}> } */
function mergeSchemas(parts) {
  const dbs = new Set();
  const acc = new Map();
  for (const p of parts) {
    p.databases.forEach(d => dbs.add(d));
    for (const [key, t] of p.tables) {
      let a = acc.get(key);
      if (!a) { a = { name: t.name, defined: new Map(), inferred: new Map() }; acc.set(key, a); }
      for (const [k, c] of t.defined) if (!a.defined.has(k)) a.defined.set(k, c);
      for (const [k, c] of t.inferred) if (!a.inferred.has(k)) a.inferred.set(k, c);
    }
  }
  const tables = new Map();
  for (const [key, a] of acc) {
    const cols = a.defined.size ? [...a.defined.values()] : [...a.inferred.values()];
    tables.set(key, { name: a.name, inferred: !a.defined.size, columns: cols });
  }
  return { databases: [...dbs].sort(), tables };
}

function columnsOf(schema, table) {
  const t = schema.tables.get(String(table).toLowerCase());
  return t ? t.columns : [];
}

// ---------------------------------------------------------------------------
// SELECT analysis
// ---------------------------------------------------------------------------
function referencedTables(sql) {
  const s = stripSqlComments(sql).replace(/`/g, '');
  const out = [];
  const seen = new Set();
  const add = (t, a) => {
    if (!t) return;
    t = t.replace(/^\w+\./, '');
    if (!isValidIdent(t)) return;
    if (!a || STOP.has(a.toUpperCase())) a = t;
    const key = a.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ table: t, alias: a });
  };
  let m;
  const fromRe = /\bFROM\s+([\s\S]*?)(?=\b(?:WHERE|GROUP|ORDER|HAVING|LIMIT|UNION|JOIN|INNER|LEFT|RIGHT|CROSS|NATURAL|FULL|STRAIGHT_JOIN|ON|SET|WINDOW|FOR|LOCK|INTO)\b|[;)]|$)/gi;
  while ((m = fromRe.exec(s))) {
    for (const part of m[1].split(',')) {
      const pm = /^\s*([\w.]+)(?:\s+(?:AS\s+)?(\w+))?/i.exec(part);
      if (pm) add(pm[1], pm[2]);
    }
  }
  const joinRe = /\b(?:JOIN|UPDATE|INTO|TABLE)\s+(?:IF\s+(?:NOT\s+)?EXISTS\s+)?([\w.]+)(?:\s+(?:AS\s+)?(\w+))?/gi;
  while ((m = joinRe.exec(s))) add(m[1], m[2]);
  return out;
}

function parseSelect(sql) {
  const s = stripSqlComments(sql).replace(/`/g, '');
  const sm = /\bSELECT\b/i.exec(s);
  if (!sm) return null;
  let depth = 0, q = null, fromIdx = -1;
  for (let i = sm.index + 6; i < s.length; i++) {
    const ch = s[i];
    if (q) { if (ch === '\\') i++; else if (ch === q) q = null; continue; }
    if (ch === "'" || ch === '"') { q = ch; continue; }
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (depth === 0 && /f/i.test(ch) && s.substr(i, 4).toUpperCase() === 'FROM' &&
      !/\w/.test(s[i - 1] || '') && !/\w/.test(s[i + 4] || '')) { fromIdx = i; break; }
  }
  const colsText = s.slice(sm.index + 6, fromIdx < 0 ? s.length : fromIdx);
  return { items: splitTopLevel(colsText), tables: fromIdx < 0 ? [] : referencedTables(s.slice(fromIdx)) };
}

/** Keys that mysqli_fetch_assoc / PDO::FETCH_ASSOC will return for this SELECT. */
function selectKeys(sql, schema) {
  const p = parseSelect(sql);
  if (!p) return [];
  const keys = [];
  const seen = new Set();
  const push = (key, detail, table) => {
    if (!key || seen.has(key)) return;
    seen.add(key);
    keys.push({ key, detail, table });
  };
  const tableFor = q => {
    const t = p.tables.find(t => t.alias.toLowerCase() === q.toLowerCase() || t.table.toLowerCase() === q.toLowerCase());
    return t ? t.table : q;
  };
  const describe = (table, col) => {
    const c = columnsOf(schema, table).find(c => c.name.toLowerCase() === col.toLowerCase());
    return c ? `${table}.${c.name}${c.type ? '  ' + c.type : ''}` : (table ? `${table}.${col}` : col);
  };
  const owner = col => {
    const t = p.tables.find(t => columnsOf(schema, t.table).some(c => c.name.toLowerCase() === col.toLowerCase()));
    return t ? t.table : (p.tables[0] && p.tables[0].table);
  };
  const allOf = table => {
    for (const c of columnsOf(schema, table)) push(c.name, describe(table, c.name), table);
  };

  for (let item of p.items) {
    item = item.replace(/^\s*(?:DISTINCT|DISTINCTROW|ALL|SQL_CALC_FOUND_ROWS)\s+/i, '').trim();
    let m;
    if ((m = /^([\s\S]+?)\s+AS\s+['"]?([^'"]+?)['"]?\s*$/i.exec(item))) { push(m[2], 'AS ' + m[1].trim()); continue; }
    if (item === '*') { p.tables.forEach(t => allOf(t.table)); continue; }
    if ((m = /^(\w+)\.\*$/.exec(item))) { allOf(tableFor(m[1])); continue; }
    if ((m = /^(?:(\w+)\.)?(\w+)$/.exec(item))) {
      const t = m[1] ? tableFor(m[1]) : owner(m[2]);
      push(m[2], describe(t, m[2]), t);
      continue;
    }
    if ((m = /^([\s\S]*?[\w)'"])\s+['"]?([A-Za-z_]\w*)['"]?$/.exec(item)) && !STOP.has(m[2].toUpperCase())) {
      push(m[2], 'alias of ' + m[1].trim());
      continue;
    }
    push(item, 'expression');
  }
  return keys;
}

/** What should be suggested at the end of `before` (SQL text up to the cursor)? */
function sqlCompletionContext(before) {
  let m;
  if ((m = /(\w+)\.(\w*)$/.exec(before))) return { kind: 'qualified', qualifier: m[1] };
  if (/\b(?:FROM|JOIN|INTO|UPDATE|TABLE|DESCRIBE|TRUNCATE)\s+(?:[\w.]+(?:\s+(?:AS\s+)?\w+)?\s*,\s*)*\w*$/i.test(before)) {
    return { kind: 'table' };
  }
  return { kind: 'column' };
}

// ---------------------------------------------------------------------------
// Data-flow: which SQL produced the value in $var?
// ---------------------------------------------------------------------------
function rhsEnd(text, mask, start) {
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (mask[i] !== CODE) continue;
    const ch = text[i];
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') { if (depth === 0) return i; depth--; }
    else if ((ch === ';' || ch === ',') && depth === 0) return i;
    else if (ch === '?' && text[i + 1] === '>' && depth === 0) return i;
  }
  return text.length;
}

function findAssignments(text, mask, name) {
  const out = [];
  let m;
  const re = new RegExp('\\$' + name + '\\b\\s*(?:\\[\\s*\\]\\s*)?(\\.?=)(?![=>])', 'g');
  while ((m = re.exec(text))) {
    if (mask[m.index] !== CODE) continue;
    const rhsStart = m.index + m[0].length;
    out.push({ index: m.index, op: m[1], rhsStart, rhsEnd: rhsEnd(text, mask, rhsStart) });
  }
  const fe = /\bforeach\s*\(/gi;
  const asRe = new RegExp('^([\\s\\S]*?)\\bas\\s+(?:&?\\$\\w+\\s*=>\\s*)?&?\\$' + name + '\\b', 'i');
  while ((m = fe.exec(text))) {
    if (mask[m.index] !== CODE) continue;
    const open = m.index + m[0].length - 1;
    const close = rhsEnd(text, mask, open + 1);
    const am = asRe.exec(text.slice(open + 1, close));
    if (am) out.push({ index: m.index, op: '=', rhsStart: open + 1, rhsEnd: open + 1 + am[1].length, foreach: true });
  }
  return out.sort((a, b) => a.index - b.index);
}

function literalsIn(text, mask, a, b) {
  let s = '';
  for (let i = a; i < b; i++) if (mask[i] === STR) s += text[i];
  return s;
}

function varsIn(text, mask, a, b) {
  const out = [];
  const re = /\$(\w+)/g;
  const seg = text.slice(a, b);
  let m;
  while ((m = re.exec(seg))) if (mask[a + m.index] === CODE && !out.includes(m[1])) out.push(m[1]);
  return out;
}

/**
 * Follow assignments backwards from `before` to find the SQL string behind $name.
 * Returns { sql, chain } where chain is the concatenated right-hand sides walked through.
 */
function resolveVar(text, mask, name, before, depth = 0, seen = new Set()) {
  if (depth > 8 || seen.has(name) || name === 'this') return null;
  seen = new Set(seen).add(name);
  const assigns = findAssignments(text, mask, name);
  let baseIdx = -1;
  for (let k = assigns.length - 1; k >= 0; k--) {
    if (assigns[k].index < before && assigns[k].op !== '.=') { baseIdx = k; break; }
  }
  if (baseIdx < 0) baseIdx = assigns.findIndex(a => a.op !== '.=');
  if (baseIdx < 0) return null;
  const base = assigns[baseIdx];
  const parts = [base];
  for (let k = baseIdx + 1; k < assigns.length && assigns[k].index < before; k++) {
    if (assigns[k].op !== '.=') break;
    parts.push(assigns[k]);
  }
  const chain = (base.foreach ? 'foreach ' : '') + parts.map(p => text.slice(p.rhsStart, p.rhsEnd)).join(' ');
  const literal = parts.map(p => literalsIn(text, mask, p.rhsStart, p.rhsEnd)).join(' ');
  if (looksLikeSql(literal)) return { sql: literal, chain };
  for (const v of varsIn(text, mask, base.rhsStart, base.rhsEnd)) {
    if (v === name) continue;
    const r = resolveVar(text, mask, v, base.index, depth + 1, seen);
    if (r) return { sql: r.sql, chain: chain + ' ' + r.chain };
  }
  return null;
}

/** HTML form field names (for $_POST / $_GET key completion). */
function formFieldNames(text) {
  const out = [];
  const re = /<(?:input|select|textarea|button)\b[^>]*?\bname\s*=\s*["']([^"'\s<>]+)["']/gi;
  let m;
  while ((m = re.exec(text))) {
    const n = m[1].replace(/\[\]$/, '');
    if (!out.includes(n)) out.push(n);
  }
  return out;
}

module.exports = {
  CODE, STR, OPEN, CLOSE, SQL_KEYWORDS,
  buildMask, stringAt, looksLikeSql, splitTopLevel,
  parseSchemaText, mergeSchemas, columnsOf,
  referencedTables, parseSelect, selectKeys, sqlCompletionContext,
  resolveVar, formFieldNames
};
