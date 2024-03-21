use log::LevelFilter;
use migrations::migrations;
use tauri::Manager;
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

#[tauri::command]
fn get_db_path(app_handle: tauri::AppHandle) -> String {
    let mut db_path = app_handle
        .path()
        .app_config_dir()
        .expect("No App path was found!");
    db_path.push("application.db");

    return format!("{:?}", &db_path);
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
        .invoke_handler(tauri::generate_handler![greet, get_db_path])
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
