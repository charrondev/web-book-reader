use log::LevelFilter;
use migrations::migrations;
use tauri_plugin_sql::{Migration, MigrationKind};
use std::fs;
use tauri::Manager;
use tauri_plugin_log::{fern::colors::ColoredLevelConfig, Target, TargetKind};
use sqlx::{
    sqlite::Sqlite,
    error::BoxDynError,
    migrate::{
        MigrateDatabase, Migration as SqlxMigration, MigrationSource, Migrator,
    },
     Pool,
};
use futures_core::future::BoxFuture;

#[cfg(target_os = "macos")]
#[macro_use]
extern crate cocoa;

#[cfg(target_os = "macos")]
#[macro_use]
extern crate objc;

#[cfg(target_os = "macos")]
mod mac;

mod migrations;

#[derive(Debug)]
struct MigrationList(Vec<Migration>);


impl MigrationSource<'static> for MigrationList {
    fn resolve(self) -> BoxFuture<'static, std::result::Result<Vec<SqlxMigration>, BoxDynError>> {
        Box::pin(async move {
            let mut migrations = Vec::new();
            for migration in self.0 {
                if matches!(migration.kind, MigrationKind::Up) {
                    migrations.push(SqlxMigration::new(
                        migration.version,
                        migration.description.into(),
                        migration.kind.into(),
                        migration.sql.into(),
                    ));
                }
            }
            Ok(migrations)
        })
    }
}

#[tauri::command]
async fn reset_db(app_handle: tauri::AppHandle) -> tauri::Result<String> {
    let db_root = app_handle
        .path()
        .app_config_dir()?;

    let _ = fs::remove_dir_all(&db_root);
    let _ = fs::create_dir(&db_root);

    let db_path = db_root.clone().join("application.db");
    let db_path = db_path.to_str().unwrap();

    if !Sqlite::database_exists(&db_path).await.unwrap_or(false) {
        Sqlite::create_database(&db_path).await.expect("Failed to create database");
    }
    let pool = Pool::<Sqlite>::connect(&db_path).await.expect("Fail to connect to db pool");

    println!("Loading database");
    let migrator = Migrator::new(MigrationList(migrations())).await.expect("failed to create migrator");
    println!("Running db migrations");
    migrator.run(&pool).await.expect("Failed to migrate");
    println!("Migrations run");

    return Ok(format!("Ok"));
}

#[tauri::command]
fn get_db_root(app_handle: tauri::AppHandle) -> String {
    let db_root = app_handle
        .path()
        .app_config_dir()
        .expect("No App path was found!");

    return format!("{:?}", &db_root);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(
            tauri_plugin_log::Builder::new()
                .targets([
                    Target::new(TargetKind::Stdout),
                    // Target::new(TargetKind::LogDir { file_name: None }),
                    Target::new(TargetKind::Webview),
                ])
                .level(LevelFilter::Info)
                .with_colors(ColoredLevelConfig::default())
                .build(),
        )
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:application.db", migrations())
                .build(),
        )
        .plugin(tauri_plugin_http::init())
        .plugin(mac::window::init())
        .invoke_handler(tauri::generate_handler![reset_db, get_db_root])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
