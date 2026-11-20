fn main() {
    // Slint selects its standard-widget colors at compile time. The default
    // "fluent" follows the CI desktop's light theme, causing bright gray
    // buttons and inputs on Open IPTV Pro's dark player background.
    // Compile native previews with the explicitly dark Fluent widget palette,
    // while keeping SLINT_STYLE override available for custom builds.
    println!("cargo:rerun-if-env-changed=SLINT_STYLE");
    if std::env::var_os("SLINT_STYLE").is_none() {
        std::env::set_var("SLINT_STYLE", "fluent-dark");
    }
    slint_build::compile("ui/app.slint").expect("Không biên dịch được giao diện Slint");
}
