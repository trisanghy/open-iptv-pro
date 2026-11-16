# Opens the official existing Visual Studio Installer, or official Microsoft page.
$installer = 'C:\Program Files (x86)\Microsoft Visual Studio\Installer\setup.exe'
if (Test-Path -LiteralPath $installer -PathType Leaf) {
  Start-Process -FilePath $installer
} else {
  Start-Process 'https://visualstudio.microsoft.com/visual-cpp-build-tools/'
}
Write-Host 'Chon Modify/Install -> Desktop development with C++ -> MSVC x64/x86 + Windows SDK.'
Write-Host 'Neu Windows bao Organization policies are preventing installation, can admin cho phep; script khong the vuot chinh sach.'
