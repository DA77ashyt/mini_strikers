# ============================================================
#  队史馆 · 截图脚本
#  用法（PowerShell）：
#    .\shot.ps1                 # 截全部关键页
#    .\shot.ps1 home,timeline   # 只截指定页
#  产物：out/<name>.png（430×900 逻辑尺寸，2 倍图 860×1800）
#  说明：chrome 的 --window-size 在当前机器上不等于视口尺寸，
#        所以统一「iframe 定宽 430×900 放进大窗口截图 + 裁剪」，
#        保证每张图都是精确的 430×900 版面。
# ============================================================
param([string[]]$Only)

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Definition
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
if (-not (Test-Path $chrome)) { throw "找不到 Chrome：$chrome" }

$out = Join-Path $here 'out'
if (-not (Test-Path $out)) { New-Item -ItemType Directory -Path $out | Out-Null }

$shots = @(
  @{ n = '01-home';      q = '#/home' },
  @{ n = '02-timeline';  q = '#/timeline' },
  @{ n = '03-album';     q = '#/album' },
  @{ n = '04-photo';     q = '#/photo/ph06' },
  @{ n = '05-roster';    q = '#/roster' },
  @{ n = '06-person';    q = '#/person/p27' },
  @{ n = '07-story';     q = '#/story/s01' },
  @{ n = '08-me';        q = '#/me' },
  @{ n = '09-submit';    q = '#/submit' },
  @{ n = '10-selftest';  q = '#/selftest' }
)
if ($Only) { $shots = $shots | Where-Object { $Only -contains ($_.n -replace '^\d+-', '') } }

$index = Join-Path $here 'index.html'
$frame = Join-Path $here '_shot.html'
foreach ($s in $shots) {
  $url = 'file:///' + ($index -replace '\\', '/') + $s.q
  $raw = Join-Path $out ('raw_' + $s.n + '.png')
  $html = @"
<!DOCTYPE html><html><head><meta charset="utf-8"><style>
html,body{margin:0;padding:0;background:#0A1526;overflow:hidden}
iframe{display:block;border:0;width:430px;height:900px}
</style></head><body><iframe src="$url"></iframe></body></html>
"@
  [System.IO.File]::WriteAllText($frame, $html, (New-Object System.Text.UTF8Encoding($false)))
  $frameUrl = 'file:///' + ($frame -replace '\\', '/')
  $cargs = @(
    '--headless=old', '--no-sandbox', '--disable-gpu', '--hide-scrollbars',
    '--force-device-scale-factor=2', '--window-size=1000,2000',
    '--virtual-time-budget=2500', "--screenshot=$raw", $frameUrl
  )
  & $chrome @cargs 2>$null | Out-Null
  if (Test-Path $raw) { Write-Host ("  ✓ " + $s.n) } else { Write-Host ("  ✗ " + $s.n + "  截图失败") }
}
if (Test-Path $frame) { Remove-Item $frame -Force }
& python (Join-Path $here 'crop.py') $out
Write-Host "`n输出目录：$out"
