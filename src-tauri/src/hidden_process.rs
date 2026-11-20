//! Windows child process creation: keep every CLI helper invisible.
 //! This does not silence stdout/stderr; callers can still collect diagnostic output.
 //! CREATE_NO_WINDOW is applied to process creation, never via cmd.exe or PowerShell.
 use std::ffi::OsStr;
 const CREATE_NO_WINDOW:u32 = 0x0800_0000;

 pub fn tokio<P:AsRef<OsStr>>(program:P)->tokio::process::Command{
   let mut command=tokio::process::Command::new(program);
   #[cfg(windows)] {command.creation_flags(CREATE_NO_WINDOW);}
   command
 }
 pub fn standard<P:AsRef<OsStr>>(program:P)->std::process::Command{
   let mut command=std::process::Command::new(program);
   #[cfg(windows)] {
     use std::os::windows::process::CommandExt;
     command.creation_flags(CREATE_NO_WINDOW);
   }
   command
 }
 #[cfg(test)]
 mod tests {
   use super::*;
   #[test] fn child_constructors_are_available_without_shell(){
     let _a=tokio("ffmpeg");
     let _b=standard("ffmpeg");
     assert_eq!(CREATE_NO_WINDOW,0x0800_0000);
   }
 }
