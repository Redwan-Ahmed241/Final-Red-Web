'use strict';
// Run with: node test/parse.test.js
const assert = require('assert');
const P = require('../src/sqlparse');

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  ok  ' + name); }
  catch (e) { console.error('  FAIL ' + name + '\n       ' + e.message); process.exitCode = 1; }
}

const schemaSql = `
CREATE DATABASE IF NOT EXISTS uiutech_final;
USE uiutech_final;
CREATE TABLE IF NOT EXISTS employee_final (
    EmployeeID INT PRIMARY KEY AUTO_INCREMENT,
    EmployeeName VARCHAR(100),
    DepartmentID INT,
    Salary DECIMAL(10, 2),
    PerformanceRating VARCHAR(5)
);
CREATE TABLE \`dept\` (
  \`id\` int(11) NOT NULL,
  \`name\` varchar(50) DEFAULT 'x, y',
  PRIMARY KEY (\`id\`),
  KEY \`idx_name\` (\`name\`)
);`;

const schema = P.mergeSchemas([P.parseSchemaText(schemaSql), P.parseSchemaText(
  `<?php $conn->query("INSERT INTO orders (order_id, customer, total) VALUES (1,'a',3)");`)]);

test('parses CREATE TABLE columns, types, pk, auto-increment', () => {
  const cols = P.columnsOf(schema, 'employee_final');
  assert.deepStrictEqual(cols.map(c => c.name), ['EmployeeID', 'EmployeeName', 'DepartmentID', 'Salary', 'PerformanceRating']);
  assert.strictEqual(cols[0].pk, true);
  assert.strictEqual(cols[0].autoIncrement, true);
  assert.strictEqual(cols[3].type, 'DECIMAL(10, 2)');
});

test('table-level PRIMARY KEY and KEY lines', () => {
  const cols = P.columnsOf(schema, 'dept');
  assert.deepStrictEqual(cols.map(c => c.name), ['id', 'name']);
  assert.strictEqual(cols[0].pk, true);
});

test('databases detected', () => assert.deepStrictEqual(schema.databases, ['uiutech_final']));

test('inferred columns from INSERT in PHP', () =>
  assert.deepStrictEqual(P.columnsOf(schema, 'orders').map(c => c.name), ['order_id', 'customer', 'total']));

test('select keys: aliases, functions, star, qualified', () => {
  const keys = P.selectKeys(
    'SELECT DISTINCT e.EmployeeName, COUNT(*) AS TotalCount, AVG(Salary) avg_sal, d.*, MAX(Salary) FROM employee_final e JOIN dept d ON d.id = e.DepartmentID',
    schema).map(k => k.key);
  assert.deepStrictEqual(keys, ['EmployeeName', 'TotalCount', 'avg_sal', 'id', 'name', 'MAX(Salary)']);
});

test('select * expands from schema', () =>
  assert.deepStrictEqual(P.selectKeys('SELECT * FROM employee_final WHERE Salary > 4', schema).length, 5));

test('sql context: tables after FROM/JOIN, qualified columns', () => {
  assert.strictEqual(P.sqlCompletionContext('SELECT * FROM emp').kind, 'table');
  assert.strictEqual(P.sqlCompletionContext('SELECT * FROM a e JOIN ').kind, 'table');
  assert.strictEqual(P.sqlCompletionContext('SELECT * FROM a WHERE Sal').kind, 'column');
  assert.deepStrictEqual(P.sqlCompletionContext('SELECT e.Emp'), { kind: 'qualified', qualifier: 'e' });
});

const php = `<?php
// $row = "SELECT nope FROM x"; (comment must be ignored)
$conn = new mysqli($servername, $username, $password, $dbname);
$sql1 = "SELECT PerformanceRating, COUNT(*) AS TotalCount
         FROM employee_final
         GROUP BY PerformanceRating";
$result1 = $conn->query($sql1);
while ($row = $result1->fetch_assoc()) {
    echo $row["CURSOR1"];
}
$stmt = $conn->prepare("SELECT EmployeeID, Salary FROM employee_final WHERE EmployeeID = ?");
$stmt->execute();
$res = $stmt->get_result();
$rows = $res->fetch_all(MYSQLI_ASSOC);
foreach ($rows as $i => $r) {
    echo $r['CURSOR2'];
}
$sql = "SELECT EmployeeName";
$sql .= " FROM employee_final";
$q = mysqli_query($conn, $sql);
while ($o = mysqli_fetch_object($q)) { echo $o->CURSOR3; }
?>
<p><?= $x ?></p>
`;
const mask = P.buildMask(php);
const at = s => php.indexOf(s);

test('stringAt detects cursor inside $row["..."]', () => {
  const s = P.stringAt(php, mask, at('CURSOR1'));
  assert.ok(s);
  assert.ok(/\$row\[$/.test(php.slice(s.openerStart - 5, s.openerStart)));
});

test('stringAt is null in code / comments / html', () => {
  assert.strictEqual(P.stringAt(php, mask, at('$result1 =')), null);
  assert.strictEqual(P.stringAt(php, mask, at('<p>') + 1), null);
});

test('resolve while($row = $result->fetch_assoc()) via $sql variable', () => {
  const r = P.resolveVar(php, mask, 'row', at('CURSOR1'));
  assert.deepStrictEqual(P.selectKeys(r.sql, schema).map(k => k.key), ['PerformanceRating', 'TotalCount']);
});

test('resolve foreach over fetch_all of a prepared statement', () => {
  const r = P.resolveVar(php, mask, 'r', at('CURSOR2'));
  assert.deepStrictEqual(P.selectKeys(r.sql, schema).map(k => k.key), ['EmployeeID', 'Salary']);
});

test('resolve .= concatenated SQL and fetch_object', () => {
  const r = P.resolveVar(php, mask, 'o', at('CURSOR3'));
  assert.deepStrictEqual(P.selectKeys(r.sql, schema).map(k => k.key), ['EmployeeName']);
  assert.ok(/fetch_object/.test(r.chain));
});

test('connection var does not resolve to SQL', () =>
  assert.strictEqual(P.resolveVar(php, mask, 'conn', php.length), null));

test('form field names', () =>
  assert.deepStrictEqual(P.formFieldNames('<input type="text" name="attendees"><select name=\'dept[]\'>'), ['attendees', 'dept']));

// Real exam files from the parent repo, if present
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', '..');
const real = path.join(root, 'Trimester_251', 'Q3_PHP_MySQL');
if (fs.existsSync(real)) {
  test('real exam: Trimester_251 schema + solution.php', () => {
    const s = P.mergeSchemas([P.parseSchemaText(fs.readFileSync(path.join(real, 'db_setup.sql'), 'utf8'))]);
    const src = fs.readFileSync(path.join(real, 'solution.php'), 'utf8');
    const m = P.buildMask(src);
    const idx = src.indexOf('$row["PerformanceRating"]') + 6;
    const r = P.resolveVar(src, m, 'row', idx);
    assert.ok(r, 'resolved');
    const keys = P.selectKeys(r.sql, s).map(k => k.key);
    assert.ok(keys.includes('PerformanceRating') && keys.includes('TotalCount'), keys.join(','));
  });
}

console.log(`\n${passed} passed${process.exitCode ? ', some FAILED' : ''}`);
