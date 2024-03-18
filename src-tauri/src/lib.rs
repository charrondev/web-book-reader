use std::fs;

use log::{info, LevelFilter};
use migrations::migrations;
use tauri::{App, Manager};
use tauri_plugin_log::{fern::colors::ColoredLevelConfig, Target, TargetKind};

#[cfg(target_os = "macos")]
#[macro_use]
extern crate cocoa;

#[cfg(target_os = "macos")]
#[macro_use]
extern crate objc;

#[cfg(target_os = "macos")]
mod mac;

mod migrations;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn delete_db(app: &App) {
    let root_db_path = app.path().app_config_dir().expect("No App path was found!");

    let mut db_file = root_db_path.clone();
    db_file.push("application.db");
    let mut shm_file = root_db_path.clone();
    shm_file.push("application.db-shm");
    let mut wal_file = root_db_path.clone();
    wal_file.push("application.db-wal");

    let paths_to_del = [
        db_file,
        shm_file,
        wal_file,
    ];

    for path_to_del in paths_to_del {
        info!("Deleting {:?}", &path_to_del);
        let _ = fs::remove_file(path_to_del);
    }

    return;
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().targets([
            Target::new(TargetKind::Stdout),
            // Target::new(TargetKind::LogDir { file_name: None }),
            Target::new(TargetKind::Webview),
        ])
        .level(LevelFilter::Info)
        .with_colors(ColoredLevelConfig::default())

        .build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:application.db", migrations())
                .build(),
        )
        .plugin(tauri_plugin_http::init())
        .invoke_handler(tauri::generate_handler![greet])
        .setup(|app| {
            if cfg!(target_os = "macos") {
                #[cfg(target_os = "macos")]
                use mac::window::setup_mac_window;

                #[cfg(target_os = "macos")]
                setup_mac_window(app);
            }

            // Uncomment to wipe the app on startup.
            // delete_db(app);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
