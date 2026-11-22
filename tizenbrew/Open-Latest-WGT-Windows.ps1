# Open IPTV Pro TizenBrew - Windows CMD one-command browser preview.
# Downloads the latest tizenbrew HEAD from GitHub on every run and builds a local unsigned .wgt.
# Requires Windows PowerShell 5.1+ and an Internet connection. No Python/Tizen Studio required.
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2.0

try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    $headers = @{ 'User-Agent' = 'OpenIPTVPro-TizenBrowser'; 'Accept' = 'application/vnd.github+json'; 'Cache-Control' = 'no-cache' }
    Write-Host ''
    Write-Host 'Open IPTV Pro TV - TizenBrew browser preview' -ForegroundColor Cyan
    Write-Host 'Checking current TizenBrew commit on GitHub...'
    $branch = Invoke-RestMethod -Uri 'https://api.github.com/repos/trisanghy/open-iptv-pro/branches/tizenbrew' -Headers $headers -TimeoutSec 35
    $sha = [string]$branch.commit.sha
    if ($sha -notmatch '^[0-9a-f]{40}$') { throw 'Invalid GitHub branch commit SHA.' }

    # The cache directory includes the exact git SHA; the launcher never silently opens an older build.
    $root = Join-Path $env:LOCALAPPDATA ('OpenIPTVPro\TizenBrowser\' + $sha)
    $app = Join-Path $root 'app'
    $wgt = Join-Path $root 'Open-IPTV-Pro-TizenBrowser.wgt'
    $null = New-Item -ItemType Directory -Path $app -Force

    $required = @('index.html', 'phone.html', 'supabase-sdk.js', 'config.xml')
    $build = -not (Test-Path -LiteralPath $wgt)
    foreach ($name in $required) {
        if (-not (Test-Path -LiteralPath (Join-Path $app $name))) { $build = $true }
    }

    if ($build) {
        Write-Host ('Fetching TizenBrew files at ' + $sha.Substring(0,12) + '...')
        $base = 'https://raw.githubusercontent.com/trisanghy/open-iptv-pro/' + $sha + '/'
        $files = @(
            @('tizenbrew/index.html', 'index.html'),
            @('tizenbrew/phone.html', 'phone.html'),
            @('supabase-sdk.js', 'supabase-sdk.js'),
            @('tizenbrew/README.md', 'README.md'),
            @('tizenbrew/THIRD_PARTY_NOTICES.md', 'THIRD_PARTY_NOTICES.md')
        )
        foreach ($item in $files) {
            $uri = $base + $item[0]
            $target = Join-Path $app $item[1]
            Invoke-WebRequest -Uri $uri -OutFile $target -UseBasicParsing -TimeoutSec 60
            if (-not (Test-Path -LiteralPath $target)) { throw ('Download failed: ' + $uri) }
        }

        $tvFile = Join-Path $app 'index.html'
        $phoneFile = Join-Path $app 'phone.html'
        $tv = [IO.File]::ReadAllText($tvFile, [Text.Encoding]::UTF8)
        $phone = [IO.File]::ReadAllText($phoneFile, [Text.Encoding]::UTF8)
        if (-not $tv.Contains('sourceQR') -or -not $tv.Contains('manager-request')) { throw 'Downloaded TV code does not include QR manager.' }
        if (-not $phone.Contains('manager-result')) { throw 'Downloaded phone page does not include QR manager.' }
        # The local SDK must be loaded before the main application script.
        $anchor = '<script>' + [char]10 + '(function(){'
        if (-not $tv.Contains($anchor)) { throw 'Cannot identify TV main script. Stop rather than creating a broken package.' }
        if (-not $phone.Contains($anchor)) { throw 'Cannot identify phone main script. Stop rather than creating a broken package.' }
        $prefix = '<script src="supabase-sdk.js"></script>' + [char]10
        $tv = $tv.Replace($anchor, $prefix + $anchor)
        $phone = $phone.Replace($anchor, $prefix + $anchor)
        [IO.File]::WriteAllText($tvFile, $tv, (New-Object Text.UTF8Encoding($false)))
        [IO.File]::WriteAllText($phoneFile, $phone, (New-Object Text.UTF8Encoding($false)))

        $config = @'
<?xml version="1.0" encoding="utf-8"?>
<widget xmlns="http://www.w3.org/ns/widgets" xmlns:tizen="http://tizen.org/ns/widgets"
 id="http://trisanghy.github.io/open-iptv-pro/tizen-browser" version="0.1.6" viewmodes="fullscreen">
 <name>Open IPTV Pro TV - Browser Preview</name>
 <content src="index.html" />
 <tizen:application id="OPENIPTVBR.Browser" package="OPENIPTVBR" required_version="2.4"/>
 <tizen:profile name="tv"/>
</widget>
'@
        [IO.File]::WriteAllText((Join-Path $app 'config.xml'), $config, (New-Object Text.UTF8Encoding($false)))
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        if (Test-Path -LiteralPath $wgt) { Remove-Item -LiteralPath $wgt -Force }
        [IO.Compression.ZipFile]::CreateFromDirectory($app, $wgt, [IO.Compression.CompressionLevel]::Optimal, $false)
        $zip = [IO.Compression.ZipFile]::OpenRead($wgt)
        try {
            foreach ($name in $required) {
                if ($null -eq $zip.GetEntry($name)) { throw ('WGT is missing ' + $name) }
            }
        } finally { $zip.Dispose() }
        Write-Host ('Latest browser-preview WGT built: ' + $wgt) -ForegroundColor Green
    } else {
        Write-Host ('Using already-built WGT for latest commit ' + $sha.Substring(0,12))
    }

    # Windows-compatible HTTP loopback server, without Python, npm, or HTTP.sys ACL/admin rights.
    # Serving from http://127.0.0.1 avoids file:// restrictions on localStorage and script loading.
    $server = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, 0)
    $server.Start()
    $port = ([Net.IPEndPoint]$server.LocalEndpoint).Port
    $address = 'http://127.0.0.1:' + $port + '/index.html'
    Write-Host ('Current GitHub commit: ' + $sha)
    Write-Host ('WGT file: ' + $wgt)
    Write-Host ('Opening browser: ' + $address) -ForegroundColor Cyan
    Write-Host 'Keep CMD open. Press Ctrl+C to stop.'
    Start-Process $address

    $crlf = [string][char]13 + [char]10
    try {
        while ($true) {
            $client = $server.AcceptTcpClient()
            try {
                $client.ReceiveTimeout = 15000
                $client.SendTimeout = 15000
                $stream = $client.GetStream()
                $reader = [IO.StreamReader]::new($stream, [Text.Encoding]::ASCII, $false, 1024, $true)
                $line = $reader.ReadLine()
                while ($null -ne $line) {
                    $headerLine = $reader.ReadLine()
                    if ([string]::IsNullOrEmpty($headerLine)) { break }
                }
                $status = '200 OK'
                $contentType = 'text/html; charset=utf-8'
                $body = [byte[]]@()
                $targetName = 'index.html'
                if (-not [string]::IsNullOrWhiteSpace($line)) {
                    $parts = $line.Split(' ')
                    if ($parts.Length -ge 2) {
                        $requestPath = [Uri]::UnescapeDataString($parts[1].Split('?')[0]).TrimStart('/')
                        if ($requestPath -ne '') { $targetName = $requestPath }
                    }
                }
                # Strict allowlist prevents reading arbitrary files from the user's computer.
                if (@('index.html','phone.html','supabase-sdk.js','config.xml') -notcontains $targetName) {
                    $status = '404 Not Found'
                    $body = [Text.Encoding]::UTF8.GetBytes('Not Found')
                    $contentType = 'text/plain; charset=utf-8'
                } else {
                    if ($targetName.EndsWith('.js')) { $contentType = 'application/javascript; charset=utf-8' }
                    elseif ($targetName.EndsWith('.xml')) { $contentType = 'application/xml; charset=utf-8' }
                    $body = [IO.File]::ReadAllBytes((Join-Path $app $targetName))
                }
                $responseHead = 'HTTP/1.1 ' + $status + $crlf +
                                'Content-Type: ' + $contentType + $crlf +
                                'Content-Length: ' + $body.Length + $crlf +
                                'Cache-Control: no-store' + $crlf +
                                'X-Content-Type-Options: nosniff' + $crlf +
                                'Connection: close' + $crlf + $crlf
                $headBytes = [Text.Encoding]::ASCII.GetBytes($responseHead)
                $stream.Write($headBytes,0,$headBytes.Length)
                if ($body.Length) { $stream.Write($body,0,$body.Length) }
                $stream.Flush()
            } catch {
                Write-Host ('Local request error: ' + $_.Exception.Message) -ForegroundColor Yellow
            } finally {
                if ($null -ne $client) { $client.Close() }
            }
        }
    } finally {
        $server.Stop()
    }
} catch {
    Write-Host ('Cannot open latest Tizen WGT: ' + $_.Exception.Message) -ForegroundColor Red
    exit 1
}
