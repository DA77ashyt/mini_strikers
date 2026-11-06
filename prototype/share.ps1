# 在局域网里把原型发出去：手机连同一个 Wi-Fi，扫不出二维码就直接输网址
# 用法：右键「使用 PowerShell 运行」，或在终端里  pwsh -File .\share.ps1
param([int]$Port = 8080)

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $here

$ip = (ipconfig | Select-String -Pattern 'IPv4' |
        ForEach-Object { ($_.Line -split ':')[-1].Trim() } |
        Where-Object { $_ -notlike '127.*' -and $_ -notlike '169.254.*' } |
        Select-Object -First 1)

if (-not $ip) { $ip = '127.0.0.1' }

Write-Host ''
Write-Host '  Strikers 原型 · 局域网分享' -ForegroundColor Cyan
Write-Host '  ----------------------------------------'
Write-Host "  本机打开：   http://localhost:$Port/" -ForegroundColor White
Write-Host "  发给别人：   http://${ip}:$Port/" -ForegroundColor Green
Write-Host ''
Write-Host '  手机和电脑连同一个 Wi-Fi，把上面那行网址发到群里即可。' -ForegroundColor DarkGray
Write-Host '  第一次运行 Windows 可能弹防火墙提示，选「允许访问」。' -ForegroundColor DarkGray
Write-Host '  关掉这个窗口 = 停止分享。' -ForegroundColor DarkGray
Write-Host ''

Start-Process "http://localhost:$Port/"
python -m http.server $Port --bind 0.0.0.0
