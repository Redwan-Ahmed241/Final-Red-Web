# PHP SQL Autocomplete

Offline autocompletion for PHP + MySQL. No database connection and no internet needed: it reads the `CREATE TABLE` statements in your workspace's `.sql` files (and the SQL inside your `.php` files) and works out the rest.

## Features

### `$row['…']` keys from your SELECT
It follows `$row` → `$result` → `$sql` back to the query and suggests exactly the keys that `fetch_assoc()` will return. That includes aliases (`COUNT(*) AS TotalCount`), `*` expanded from the schema, and `t.*`.

```php
$sql = "SELECT EmployeeName, COUNT(*) AS TotalCount FROM employee_final GROUP BY EmployeeName";
$result = $conn->query($sql);
while ($row = $result->fetch_assoc()) {
    echo $row["   // ← suggests EmployeeName, TotalCount
}
```

Works with:
- mysqli OOP, mysqli procedural and PDO
- prepared statements (`get_result()`, `fetch()`)
- `fetch_all()` + `foreach`, `$rows[] = $row`, and SQL built with `.=`
- `$obj->column` after `fetch_object()` / `PDO::FETCH_OBJ`
- `$_POST['…']` / `$_GET['…']` names from the `<input name="…">` fields in the same file or folder

### Table and column names inside SQL strings
- After `FROM` / `JOIN` / `INTO` / `UPDATE` you get table names.
- Elsewhere you get the columns of the tables in that query, plus SQL keywords.
- After `alias.` you get that table's columns.

### Schema-aware snippets (type `db`)
| Prefix | Generates |
|---|---|
| `dbconnect` | Connection boilerplate (database name chosen from your schema) |
| `dbselect` | SELECT + fetch loop |
| `dbselect:<table>` | SELECT every column → full HTML `<table>` output |
| `dbinsert:<table>` | Prepared INSERT with `$_POST` inputs and correct `bind_param` types |
| `dbupdate:<table>` | Prepared UPDATE by primary key |
| `dbdelete:<table>` | Prepared DELETE by primary key |
| `dbfind:<table>` | Fetch one row by primary key |
| `dbquery` | Run UPDATE / DELETE / INSERT and check the result |
| `dbclose` | Close the connection |

The code style (mysqli OOP / mysqli / PDO) and the connection variable name (`$conn`, `$pdo`, …) are detected from the current file.

## Commands
- **PHP SQL: Show Detected Schema** shows every table and column the extension found.
- **PHP SQL: Rescan Database Schema** re-indexes the workspace.

## Settings
| Setting | Default | |
|---|---|---|
| `phpSqlAutocomplete.style` | `auto` | `auto`, `mysqli-oop`, `mysqli` or `pdo` |
| `phpSqlAutocomplete.schemaGlob` | `**/*.{sql,php}` | Files scanned for schema |
| `phpSqlAutocomplete.excludeGlob` | `**/{node_modules,vendor,.git,.kilo}/**` | Files skipped |
| `phpSqlAutocomplete.defaultHost` / `defaultUser` / `defaultPassword` | `localhost` / `root` / `""` | Used by `dbconnect` |

The extension also turns on `editor.quickSuggestions.strings` for PHP files. Without it, suggestions wouldn't pop up inside SQL strings.

## No schema file?
If no `CREATE TABLE` is found for a table, its columns are inferred from the `INSERT INTO t (…)`, `UPDATE t SET …` and simple `SELECT … FROM t` statements in your code.
