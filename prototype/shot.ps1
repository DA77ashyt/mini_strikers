# 用 iframe 固定 430×900 视口，规避 headless 窗口尺寸与视口不一致的问题
# 用法：pwsh -File shot.ps1
$ErrorActionPreference = 'Stop'
$root = 'D:\project_hyt\strikers-miniprogram\prototype'
$out  = Join-Path $root 'out'
New-Item -ItemType Directory -Force -Path $out | Out-Null
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'

$shots = @(
  @{ n = 'home';      u = 'index.html'; q = '?x=1#/home' },
  @{ n = 'schedule';  u = 'index.html'; q = '?x=1#/schedule' },
  @{ n = 'trainings'; u = 'index.html'; q = '?x=1#/trainings' },
  @{ n = 'training';  u = 'index.html'; q = '?x=1#/training/t1' },
  @{ n = 'import';    u = 'index.html'; q = '?parse=1#/importer/t1' },
  @{ n = 'rollcall';  u = 'index.html'; q = '?x=1#/rollcall/t1' },
  @{ n = 'rollfull';  u = 'index.html'; q = '?full=1#/rollcall/t1' },
  @{ n = 'match';     u = 'index.html'; q = '?x=1#/match/m1' },
  @{ n = 'me';        u = 'index.html'; q = '?x=1#/me' },
  @{ n = 'injury';    u = 'index.html'; q = '?x=1#/injury' },
  @{ n = 'stats';     u = 'index.html'; q = '?x=1#/stats' },
  @{ n = 'newtraining'; u = 'index.html'; q = '?x=1#/newtraining' }
)

foreach ($s in $shots) {
  $html = @"
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;background:#0A1526">
<iframe src="$($s.u)$($s.q)" style="width:430px;height:900px;border:0;display:block"></iframe>
</body></html>
"@
  $tmp = Join-Path $root '_shot.html'
  $html | Out-File -Encoding utf8 $tmp
  $png = Join-Path $out ("raw_" + $s.n + ".png")
  & $chrome --headless=old --no-sandbox --disable-gpu --hide-scrollbars `
    --force-device-scale-factor=2 --window-size=430,995 --virtual-time-budget=2000 `
    --screenshot="$png" "file:///$($tmp -replace '\\','/')" 2>&1 | Out-Null
  if (Test-Path $png) { "ok  $($s.n)" } else { "FAIL $($s.n)" }
}
Remove-Item (Join-Path $root '_shot.html') -ErrorAction SilentlyContinue
