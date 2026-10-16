'use strict';
// Schema-aware code templates. Placeholders are written as ⟪1:default⟫, ⟪1|a,b|⟫ and ⟪0⟫
// so literal PHP `$` and `}` don't need escaping by hand; toSnippet() converts them.

function toSnippet(s) {
  return s.replace(/[\\$}]/g, '\\$&').replace(/⟪/g, '${').replace(/⟫/g, '}');
}

function toPreview(s) {
  return s
    .replace(/⟪\d+:([^⟫]*)⟫/g, '$1')
    .replace(/⟪\d+\|([^,|]*)[^⟫]*⟫/g, '$1')
    .replace(/⟪\d+⟫/g, '');
}

function bindType(type) {
  const t = (type || '').toUpperCase();
  if (/^(TINY|SMALL|MEDIUM|BIG)?INT|^INTEGER|^BOOL|^SERIAL|^BIT|^YEAR/.test(t)) return 'i';
  if (/^(DECIMAL|NUMERIC|FLOAT|DOUBLE|REAL|DEC)/.test(t)) return 'd';
  return 's';
}

function ops(style, connName) {
  const C = '$' + connName;
  if (style === 'pdo') {
    return {
      query: sql => `${C}->query(${sql})`,
      fetch: r => `${r}->fetch(PDO::FETCH_ASSOC)`,
      hasRows: r => `${r} && ${r}->rowCount() > 0`,
      run: sql => `${C}->exec(${sql}) !== false`,
      error: `implode(" ", ${C}->errorInfo())`,
      prepare: sql => `$stmt = ${C}->prepare(${sql});`,
      bind: () => null,
      execute: vars => `$stmt->execute([${vars.join(', ')}])`,
      getRow: () => ['$row = $stmt->fetch(PDO::FETCH_ASSOC);'],
      stmtError: 'implode(" ", $stmt->errorInfo())',
      close: null,
      closeConn: `${C} = null;`
    };
  }
  if (style === 'mysqli') {
    return {
      query: sql => `mysqli_query(${C}, ${sql})`,
      fetch: r => `mysqli_fetch_assoc(${r})`,
      hasRows: r => `${r} && mysqli_num_rows(${r}) > 0`,
      run: sql => `mysqli_query(${C}, ${sql})`,
      error: `mysqli_error(${C})`,
      prepare: sql => `$stmt = mysqli_prepare(${C}, ${sql});`,
      bind: (types, vars) => `mysqli_stmt_bind_param($stmt, "${types}", ${vars.join(', ')});`,
      execute: () => 'mysqli_stmt_execute($stmt)',
      getRow: () => ['$result = mysqli_stmt_get_result($stmt);', '$row = mysqli_fetch_assoc($result);'],
      stmtError: 'mysqli_stmt_error($stmt)',
      close: 'mysqli_stmt_close($stmt);',
      closeConn: `mysqli_close(${C});`
    };
  }
  return { // mysqli object-oriented (default — matches `new mysqli(...)`)
    query: sql => `${C}->query(${sql})`,
    fetch: r => `${r}->fetch_assoc()`,
    hasRows: r => `${r} && ${r}->num_rows > 0`,
    run: sql => `${C}->query(${sql}) === TRUE`,
    error: `${C}->error`,
    prepare: sql => `$stmt = ${C}->prepare(${sql});`,
    bind: (types, vars) => `$stmt->bind_param("${types}", ${vars.join(', ')});`,
    execute: () => '$stmt->execute()',
    getRow: () => ['$result = $stmt->get_result();', '$row = $result->fetch_assoc();'],
    stmtError: '$stmt->error',
    close: '$stmt->close();',
    closeConn: `${C}->close();`
  };
}

function connectBody(style, connName, dbs, cfg) {
  const C = '$' + connName;
  const db = dbs.length > 1 ? `⟪1|${dbs.join(',')}|⟫` : `⟪1:${dbs[0] || 'database_name'}⟫`;
  const head = [
    '// Database connection parameters',
    `$servername = "${cfg.host}";`,
    `$username = "${cfg.user}";`,
    `$password = "${cfg.password}";`,
    `$dbname = "${db}";`,
    ''
  ];
  let body;
  if (style === 'pdo') {
    body = [
      'try {',
      `\t${C} = new PDO("mysql:host=$servername;dbname=$dbname;charset=utf8mb4", $username, $password);`,
      `\t${C}->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);`,
      '} catch (PDOException $e) {',
      '\tdie("Connection failed: " . $e->getMessage());',
      '}'
    ];
  } else if (style === 'mysqli') {
    body = [
      '// Create connection',
      `${C} = mysqli_connect($servername, $username, $password, $dbname);`,
      '',
      '// Check connection',
      `if (!${C}) {`,
      '\tdie("Connection failed: " . mysqli_connect_error());',
      '}'
    ];
  } else {
    body = [
      '// Create connection',
      `${C} = new mysqli($servername, $username, $password, $dbname);`,
      '',
      '// Check connection',
      `if (${C}->connect_error) {`,
      `\tdie("Connection failed: " . ${C}->connect_error);`,
      '}'
    ];
  }
  return [...head, ...body, '⟪0⟫'].join('\n');
}

function selectTableBody(o, table, cols) {
  const names = cols.map(c => c.name);
  const lines = [
    `$sql = "SELECT ${names.length ? names.join(', ') : '*'} FROM ${table}⟪1⟫";`,
    `$result = ${o.query('$sql')};`,
    '',
    `if (${o.hasRows('$result')}) {`,
    "\techo \"<table border='1' cellpadding='6'>\";"
  ];
  if (names.length) {
    lines.push(`\techo "<tr>${names.map(n => `<th>${n}</th>`).join('')}</tr>";`);
    lines.push(`\twhile ($row = ${o.fetch('$result')}) {`);
    lines.push('\t\techo "<tr>";');
    for (const n of names) lines.push(`\t\techo "<td>" . $row["${n}"] . "</td>";`);
    lines.push('\t\techo "</tr>";');
  } else {
    lines.push(`\twhile ($row = ${o.fetch('$result')}) {`);
    lines.push('\t\techo "<tr>";');
    lines.push('\t\tforeach ($row as $value) {');
    lines.push('\t\t\techo "<td>" . $value . "</td>";');
    lines.push('\t\t}');
    lines.push('\t\techo "</tr>";');
  }
  lines.push('\t}', '\techo "</table>";', '} else {', '\techo "0 results found.<br>";', '}', '⟪0⟫');
  return lines.join('\n');
}

function preparedBlock(o, sql, vars, types, okMsg) {
  const lines = [`$sql = "${sql}";`, o.prepare('$sql')];
  const b = o.bind(types, vars);
  if (b) lines.push(b);
  lines.push(
    `if (${o.execute(vars)}) {`,
    `\techo "${okMsg}<br>";`,
    '} else {',
    `\techo "Error: " . ${o.stmtError};`,
    '}'
  );
  if (o.close) lines.push(o.close);
  return lines;
}

function inputLines(cols, startTab) {
  return cols.map((c, i) => `$${c.name} = ⟪${startTab + i}:$_POST['${c.name}']⟫;`);
}

function pkOf(cols) {
  return cols.find(c => c.pk) || cols[0];
}

function insertBody(o, table, cols) {
  const ins = cols.filter(c => !c.autoIncrement);
  const vars = ins.map(c => '$' + c.name);
  return [
    ...inputLines(ins, 1),
    '',
    ...preparedBlock(o,
      `INSERT INTO ${table} (${ins.map(c => c.name).join(', ')}) VALUES (${ins.map(() => '?').join(', ')})`,
      vars, ins.map(c => bindType(c.type)).join(''), 'New record inserted successfully.'),
    '⟪0⟫'
  ].join('\n');
}

function updateBody(o, table, cols) {
  const pk = pkOf(cols);
  const set = cols.filter(c => c !== pk && !c.autoIncrement);
  const ordered = [...set, pk];
  return [
    ...inputLines(ordered, 1),
    '',
    ...preparedBlock(o,
      `UPDATE ${table} SET ${set.map(c => `${c.name} = ?`).join(', ')} WHERE ${pk.name} = ?`,
      ordered.map(c => '$' + c.name), ordered.map(c => bindType(c.type)).join(''), 'Record updated successfully.'),
    '⟪0⟫'
  ].join('\n');
}

function deleteBody(o, table, cols) {
  const pk = pkOf(cols);
  return [
    ...inputLines([pk], 1),
    '',
    ...preparedBlock(o, `DELETE FROM ${table} WHERE ${pk.name} = ?`, ['$' + pk.name], bindType(pk.type), 'Record deleted successfully.'),
    '⟪0⟫'
  ].join('\n');
}

function findBody(o, table, cols) {
  const pk = pkOf(cols);
  const lines = [
    ...inputLines([pk], 1),
    '',
    `$sql = "SELECT * FROM ${table} WHERE ${pk.name} = ?";`,
    o.prepare('$sql')
  ];
  const b = o.bind(bindType(pk.type), ['$' + pk.name]);
  if (b) lines.push(b);
  lines.push(o.execute(['$' + pk.name]) + ';', ...o.getRow(), '', 'if ($row) {');
  for (const c of cols) lines.push(`\techo "${c.name}: " . $row["${c.name}"] . "<br>";`);
  lines.push('} else {', '\techo "No record found.<br>";', '}');
  if (o.close) lines.push(o.close);
  lines.push('⟪0⟫');
  return lines.join('\n');
}

function queryBody(o, tables) {
  const t = tables.length ? `⟪2|${tables.join(',')}|⟫` : '⟪2:table_name⟫';
  return [
    `$sql = "⟪1|UPDATE,DELETE FROM,INSERT INTO|⟫ ${t} ⟪3⟫";`,
    `if (${o.run('$sql')}) {`,
    '\techo "Query executed successfully.<br>";',
    '} else {',
    `\techo "Error: " . ${o.error};`,
    '}',
    '⟪0⟫'
  ].join('\n');
}

function genericSelectBody(o, tables) {
  const t = tables.length ? `⟪2|${tables.join(',')}|⟫` : '⟪2:table_name⟫';
  return [
    `$sql = "SELECT ⟪1:*⟫ FROM ${t}⟪3⟫";`,
    `$result = ${o.query('$sql')};`,
    '',
    `if (${o.hasRows('$result')}) {`,
    `\twhile ($row = ${o.fetch('$result')}) {`,
    '\t\t⟪0⟫',
    '\t}',
    '} else {',
    '\techo "0 results found.<br>";',
    '}'
  ].join('\n');
}

/**
 * Build all templates for the given style/connection/schema.
 * Returns [{ label, detail, body (with markers) }]
 */
function buildTemplates(style, connName, schema, cfg) {
  const o = ops(style, connName);
  const tables = [...schema.tables.values()];
  const tableNames = tables.map(t => t.name);
  const out = [
    { label: 'dbconnect', detail: `Connect to MySQL (${style})`, body: connectBody(style, connName, schema.databases, cfg) },
    { label: 'dbselect', detail: 'SELECT query + fetch loop', body: genericSelectBody(o, tableNames) },
    { label: 'dbquery', detail: 'Run UPDATE / DELETE / INSERT and check result', body: queryBody(o, tableNames) },
    { label: 'dbclose', detail: 'Close the connection', body: o.closeConn }
  ];
  for (const t of tables) {
    const cols = t.columns;
    out.push({ label: `dbselect:${t.name}`, detail: `SELECT ${t.name} → HTML table`, body: selectTableBody(o, t.name, cols) });
    if (!cols.length) continue;
    out.push(
      { label: `dbinsert:${t.name}`, detail: `INSERT into ${t.name} (prepared)`, body: insertBody(o, t.name, cols) },
      { label: `dbupdate:${t.name}`, detail: `UPDATE ${t.name} by ${pkOf(cols).name} (prepared)`, body: updateBody(o, t.name, cols) },
      { label: `dbdelete:${t.name}`, detail: `DELETE from ${t.name} by ${pkOf(cols).name} (prepared)`, body: deleteBody(o, t.name, cols) },
      { label: `dbfind:${t.name}`, detail: `Fetch one ${t.name} row by ${pkOf(cols).name}`, body: findBody(o, t.name, cols) }
    );
  }
  return out;
}

module.exports = { buildTemplates, toSnippet, toPreview, bindType };
