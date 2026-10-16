'use strict';
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const P = require('./sqlparse');
const S = require('./snippets');

// ---------------------------------------------------------------------------
// Schema index: every .sql / .php file in the workspace, parsed offline.
// ---------------------------------------------------------------------------
const files = new Map();      // uri string -> parse result
let merged = null;

function setFile(key, text) {
  try { files.set(key, P.parseSchemaText(text)); } catch (e) { files.delete(key); }
  merged = null;
}

function deleteFile(key) {
  files.delete(key);
  merged = null;
}

function schema() {
  if (!merged) merged = P.mergeSchemas([...files.values()]);
  return merged;
}

function cfg() {
  return vscode.workspace.getConfiguration('phpSqlAutocomplete');
}

async function indexUri(uri) {
  try {
    const stat = await vscode.workspace.fs.stat(uri);
    if (stat.size > 5 * 1024 * 1024) return;
    const buf = await vscode.workspace.fs.readFile(uri);
    setFile(uri.toString(), Buffer.from(buf).toString('utf8'));
  } catch (e) { /* unreadable file: ignore */ }
}

async function scanWorkspace() {
  files.clear();
  merged = null;
  const uris = await vscode.workspace.findFiles(cfg().get('schemaGlob'), cfg().get('excludeGlob'), 5000);
  await Promise.all(uris.map(indexUri));
  for (const doc of vscode.workspace.textDocuments) indexDocument(doc);
}

function isTracked(doc) {
  return doc.languageId === 'php' || doc.languageId === 'sql' || /\.(php|sql)$/i.test(doc.fileName);
}

function indexDocument(doc) {
  if (isTracked(doc) && doc.uri.scheme !== 'output') setFile(doc.uri.toString(), doc.getText());
}

// ---------------------------------------------------------------------------
// Per-document lexical mask cache
// ---------------------------------------------------------------------------
const masks = new Map();
function maskFor(doc, text) {
  const key = doc.uri.toString();
  const hit = masks.get(key);
  if (hit && hit.version === doc.version) return hit.mask;
  const mask = P.buildMask(text);
  masks.set(key, { version: doc.version, mask });
  return mask;
}

// ---------------------------------------------------------------------------
// Completion helpers
// ---------------------------------------------------------------------------
const K = vscode.CompletionItemKind;

function pad(i) { return String(i).padStart(4, '0'); }

function detectStyle(text) {
  const s = cfg().get('style');
  if (s && s !== 'auto') return s;
  if (/new\s+PDO\b|PDO::/.test(text)) return 'pdo';
  if (/\bmysqli_(?:connect|query|fetch_\w+)\s*\(/.test(text)) return 'mysqli';
  return 'mysqli-oop';
}

function detectConn(text) {
  const m = /\$(\w+)\s*=\s*(?:new\s+mysqli\b|mysqli_connect\s*\(|new\s+PDO\b)/i.exec(text);
  return m ? m[1] : 'conn';
}

function preferredQuote(text) {
  const dq = (text.match(/\$\w+\[\s*"/g) || []).length;
  const sq = (text.match(/\$\w+\[\s*'/g) || []).length;
  return dq > sq ? '"' : "'";
}

function formFields(doc, text) {
  const names = P.formFieldNames(text);
  if (doc.uri.scheme !== 'file') return names;
  try {
    const dir = path.dirname(doc.uri.fsPath);
    for (const f of fs.readdirSync(dir)) {
      if (!/\.(html?|php)$/i.test(f)) continue;
      const full = path.join(dir, f);
      if (full === doc.uri.fsPath || fs.statSync(full).size > 1024 * 1024) continue;
      for (const n of P.formFieldNames(fs.readFileSync(full, 'utf8'))) if (!names.includes(n)) names.push(n);
    }
  } catch (e) { /* ignore */ }
  return names;
}

/** Items for $var['...'] / $var[ / $var-> */
function keyItems(doc, text, mask, offset, varName, mode, quote) {
  const items = [];
  const wrap = key => (mode === 'bare' ? quote + key + quote : key);

  if (/^_(POST|GET|REQUEST)$/.test(varName)) {
    if (mode === 'prop') return [];
    formFields(doc, text).forEach((n, i) => {
      const it = new vscode.CompletionItem({ label: n, description: 'form field' }, K.Field);
      it.insertText = wrap(n);
      it.filterText = n;
      it.sortText = pad(i);
      items.push(it);
    });
    return items;
  }

  const r = P.resolveVar(text, mask, varName, offset);
  if (!r) return [];
  if (mode === 'prop' && !/fetch_object|FETCH_OBJ|fetchObject/.test(r.chain)) return [];
  if (mode !== 'prop' && !/fetch|foreach|\[\s*\]|FETCH_/i.test(r.chain)) return [];

  const sql = r.sql.replace(/\s+/g, ' ').trim();
  P.selectKeys(r.sql, schema()).forEach((k, i) => {
    const it = new vscode.CompletionItem({ label: k.key, description: k.detail }, mode === 'prop' ? K.Property : K.Field);
    it.insertText = wrap(k.key);
    it.filterText = k.key;
    it.sortText = pad(i);
    it.preselect = i === 0;
    it.documentation = new vscode.MarkdownString().appendCodeblock(sql.length > 400 ? sql.slice(0, 400) + '…' : sql, 'sql');
    items.push(it);
  });
  return items;
}

function columnItem(table, col, sort) {
  const it = new vscode.CompletionItem({ label: col.name, description: `${table}${col.type ? ' · ' + col.type : ''}` }, K.Field);
  it.detail = `${table}.${col.name}${col.type ? ' ' + col.type : ''}${col.pk ? ' PRIMARY KEY' : ''}`;
  it.sortText = sort;
  return it;
}

function tableItem(t, sort) {
  const it = new vscode.CompletionItem({ label: t.name, description: t.inferred ? 'table (inferred)' : 'table' }, K.Class);
  it.detail = `${t.name} (${t.columns.map(c => c.name).join(', ')})`;
  it.sortText = sort;
  return it;
}

/** Items inside a SQL string literal */
function sqlItems(before, full) {
  const sc = schema();
  const ctx = P.sqlCompletionContext(before);
  const refs = P.referencedTables(full);
  const items = [];

  if (ctx.kind === 'qualified') {
    const ref = refs.find(r => r.alias.toLowerCase() === ctx.qualifier.toLowerCase());
    const table = ref ? ref.table : ctx.qualifier;
    P.columnsOf(sc, table).forEach((c, i) => items.push(columnItem(table, c, '0' + pad(i))));
    return items;
  }

  if (ctx.kind === 'table') {
    [...sc.tables.values()].forEach((t, i) => items.push(tableItem(t, '0' + pad(i))));
    return items;
  }

  const known = refs.filter(r => sc.tables.has(r.table.toLowerCase()));
  if (known.length) {
    let i = 0;
    for (const r of known) for (const c of P.columnsOf(sc, r.table)) items.push(columnItem(r.table, c, '0' + pad(i++)));
  } else {
    let i = 0;
    for (const t of sc.tables.values()) for (const c of t.columns) items.push(columnItem(t.name, c, '1' + pad(i++)));
  }
  [...sc.tables.values()].forEach((t, i) => items.push(tableItem(t, '2' + pad(i))));
  P.SQL_KEYWORDS.forEach((kw, i) => {
    const it = new vscode.CompletionItem(kw, K.Keyword);
    it.sortText = '3' + pad(i);
    items.push(it);
  });
  return items;
}

function snippetItems(text) {
  const style = detectStyle(text);
  const conn = detectConn(text);
  const c = cfg();
  const templates = S.buildTemplates(style, conn, schema(), {
    host: c.get('defaultHost'), user: c.get('defaultUser'), password: c.get('defaultPassword')
  });
  return templates.map((t, i) => {
    const it = new vscode.CompletionItem({ label: t.label, description: t.detail }, K.Snippet);
    it.insertText = new vscode.SnippetString(S.toSnippet(t.body));
    it.documentation = new vscode.MarkdownString().appendCodeblock(S.toPreview(t.body), 'php');
    it.sortText = pad(i);
    return it;
  });
}

function isSqlString(full, codeBefore) {
  if (P.looksLikeSql(full)) return true;
  return /(?:->\s*(?:query|prepare|exec|execute|real_query|multi_query)\s*\(|\bmysqli_(?:query|prepare|real_query|multi_query)\s*\(\s*\$\w+\s*,|\$\w*(?:sql|query|qry)\w*\s*\.?=)\s*$/i.test(codeBefore);
}

const provider = {
  provideCompletionItems(doc, pos) {
    const text = doc.getText();
    const offset = doc.offsetAt(pos);
    const mask = maskFor(doc, text);
    const str = P.stringAt(text, mask, offset);

    if (str) {
      const codeBefore = text.slice(Math.max(0, str.openerStart - 300), str.openerStart);
      const contentBefore = text.slice(str.start, offset);
      const am = /\$(\w+)\s*\[\s*$/.exec(codeBefore);
      if (am && /^[\w()*. ]*$/.test(contentBefore)) {
        return keyItems(doc, text, mask, offset, am[1], 'quoted');
      }
      const full = text.slice(str.start, Math.min(str.end, str.start + 5000));
      if (isSqlString(full, codeBefore)) return sqlItems(contentBefore, full);
      return undefined;
    }

    if (mask[offset - 1] === P.CODE || offset === 0 || mask[offset - 1] === P.CLOSE) {
      const lineBefore = doc.lineAt(pos).text.slice(0, pos.character);
      let m;
      if ((m = /\$(\w+)\s*\[\s*\w*$/.exec(lineBefore))) {
        return keyItems(doc, text, mask, offset, m[1], 'bare', preferredQuote(text));
      }
      if ((m = /\$(\w+)\s*->\s*\w*$/.exec(lineBefore))) {
        return keyItems(doc, text, mask, offset, m[1], 'prop');
      }
      const wr = doc.getWordRangeAtPosition(pos, /\w+/);
      const word = wr ? doc.getText(wr) : '';
      // Ask to be re-queried after "d" so the db* snippets appear only once "db" is typed.
      if (/^d$/i.test(word)) return new vscode.CompletionList([], true);
      if (/^db/i.test(word)) return snippetItems(text);
    }
    return undefined;
  }
};

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------
async function showSchema() {
  const sc = schema();
  const lines = ['# Detected database schema', ''];
  if (sc.databases.length) lines.push(`**Databases:** ${sc.databases.join(', ')}`, '');
  if (!sc.tables.size) lines.push('_No tables found. Add a .sql file with CREATE TABLE statements to the workspace._');
  for (const t of sc.tables.values()) {
    lines.push(`## ${t.name}${t.inferred ? ' _(inferred from queries)_' : ''}`, '');
    lines.push('| Column | Type | Key |', '|---|---|---|');
    for (const c of t.columns) lines.push(`| ${c.name} | ${c.type || ''} | ${c.pk ? 'PK' : ''}${c.autoIncrement ? ' AI' : ''} |`);
    lines.push('');
  }
  const doc = await vscode.workspace.openTextDocument({ language: 'markdown', content: lines.join('\n') });
  await vscode.window.showTextDocument(doc, { preview: true });
}

// ---------------------------------------------------------------------------
// Activation
// ---------------------------------------------------------------------------
function activate(context) {
  const sub = d => context.subscriptions.push(d);

  scanWorkspace();

  sub(vscode.languages.registerCompletionItemProvider(
    [{ language: 'php' }],
    provider,
    '[', "'", '"', '.', '>', ' ', ','
  ));

  const timers = new Map();
  sub(vscode.workspace.onDidChangeTextDocument(e => {
    if (!isTracked(e.document)) return;
    const key = e.document.uri.toString();
    clearTimeout(timers.get(key));
    timers.set(key, setTimeout(() => { timers.delete(key); indexDocument(e.document); }, 400));
  }));
  sub(vscode.workspace.onDidOpenTextDocument(indexDocument));
  sub(vscode.workspace.onDidCloseTextDocument(doc => masks.delete(doc.uri.toString())));

  const watcher = vscode.workspace.createFileSystemWatcher(cfg().get('schemaGlob'));
  sub(watcher);
  sub(watcher.onDidCreate(indexUri));
  sub(watcher.onDidChange(uri => {
    if (!vscode.workspace.textDocuments.some(d => d.uri.toString() === uri.toString() && d.isDirty)) indexUri(uri);
  }));
  sub(watcher.onDidDelete(uri => deleteFile(uri.toString())));

  sub(vscode.commands.registerCommand('phpSqlAutocomplete.rescan', async () => {
    await scanWorkspace();
    const sc = schema();
    vscode.window.showInformationMessage(`PHP SQL: found ${sc.tables.size} table(s) in ${files.size} file(s).`);
  }));
  sub(vscode.commands.registerCommand('phpSqlAutocomplete.showSchema', showSchema));
  sub(vscode.workspace.onDidChangeConfiguration(e => {
    if (e.affectsConfiguration('phpSqlAutocomplete.schemaGlob') || e.affectsConfiguration('phpSqlAutocomplete.excludeGlob')) scanWorkspace();
  }));
}

function deactivate() {}

module.exports = { activate, deactivate };
