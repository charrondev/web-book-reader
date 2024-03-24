use tauri::{plugin::{Builder, TauriPlugin}, Runtime, Window};
use objc::{msg_send, sel, sel_impl};

const WINDOW_CONTROL_PAD_X: f64 = 15.0;
const WINDOW_CONTROL_PAD_Y: f64 = 23.0;
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("example")
        .on_window_ready(|window| {
            println!("Window is ready");
            #[cfg(target_os = "macos")]
            window.position_traffic_lights(WINDOW_CONTROL_PAD_X, WINDOW_CONTROL_PAD_Y)
        })
        .build()
}


pub trait WindowExt {
    #[cfg(target_os = "macos")]
    fn position_traffic_lights(&self, x: f64, y: f64);
}

impl<R: Runtime> WindowExt for Window<R> {
    #[cfg(target_os = "macos")]
    fn position_traffic_lights(&self, x: f64, y: f64) {
        use cocoa::appkit::{NSView, NSWindow, NSWindowButton};
        use cocoa::foundation::NSRect;

        let window = self.ns_window().unwrap() as cocoa::base::id;

        println!("Position traffic lights for window {}", self.label());


        unsafe {

            let close = window.standardWindowButton_(NSWindowButton::NSWindowCloseButton);
            let miniaturize =
                window.standardWindowButton_(NSWindowButton::NSWindowMiniaturizeButton);
            let zoom = window.standardWindowButton_(NSWindowButton::NSWindowZoomButton);

            let title_bar_container_view = close.superview().superview();

            let close_rect: NSRect = msg_send![close, frame];
            let button_height = close_rect.size.height;

            let title_bar_frame_height = button_height + y;
            let mut title_bar_rect = NSView::frame(title_bar_container_view);
            title_bar_rect.size.height = title_bar_frame_height;
            title_bar_rect.origin.y = NSView::frame(window).size.height - title_bar_frame_height;
            let _: () = msg_send![title_bar_container_view, setFrame: title_bar_rect];

            let window_buttons = vec![close, miniaturize, zoom];
            let space_between = NSView::frame(miniaturize).origin.x - NSView::frame(close).origin.x;

            for (i, button) in window_buttons.into_iter().enumerate() {
                println!("Setting button position {:?}", button);
                let mut rect: NSRect = NSView::frame(button);
                rect.origin.x = x + (i as f64 * space_between);
                button.setFrameOrigin(rect.origin);
            }
        }
    }
}