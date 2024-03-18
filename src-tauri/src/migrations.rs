use tauri_plugin_sql::{Migration, MigrationKind};

pub fn migrations() -> Vec<Migration> {
    vec![Migration {
        version: 1,
        description: "create_initial_tables",
        sql: "
CREATE TABLE IF NOT EXISTS WBR_book (
    bookID INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL
);
",
        kind: MigrationKind::Up,
    }]
}
