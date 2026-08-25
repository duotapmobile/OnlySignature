param(
  [string]$Source = 'store-assets\brand\app-icon-no-text-1024.png'
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$workspace = (Resolve-Path '.').Path
$sourcePath = (Resolve-Path $Source).Path
$brandDir = Join-Path $workspace 'store-assets\brand'
$mobileAssets = Join-Path $workspace 'apps\mobile\assets'
New-Item -ItemType Directory -Force -Path $brandDir, $mobileAssets | Out-Null

function Write-Icon {
  param([System.Drawing.Image]$Image, [int]$Size, [string]$Path, [bool]$Grayscale = $false)
  $bitmap = New-Object System.Drawing.Bitmap($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#133A50'))
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  if ($Grayscale) {
    $matrix = New-Object System.Drawing.Imaging.ColorMatrix
    $matrix.Matrix00 = 0.299; $matrix.Matrix01 = 0.299; $matrix.Matrix02 = 0.299
    $matrix.Matrix10 = 0.587; $matrix.Matrix11 = 0.587; $matrix.Matrix12 = 0.587
    $matrix.Matrix20 = 0.114; $matrix.Matrix21 = 0.114; $matrix.Matrix22 = 0.114
    $matrix.Matrix33 = 1; $matrix.Matrix44 = 1
    $attributes = New-Object System.Drawing.Imaging.ImageAttributes
    $attributes.SetColorMatrix($matrix)
    $graphics.DrawImage($Image, (New-Object System.Drawing.Rectangle(0, 0, $Size, $Size)), 0, 0, $Image.Width, $Image.Height, [System.Drawing.GraphicsUnit]::Pixel, $attributes)
    $attributes.Dispose()
  } else {
    $graphics.DrawImage($Image, 0, 0, $Size, $Size)
  }
  $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose(); $bitmap.Dispose()
}

$sourceImage = [System.Drawing.Image]::FromFile($sourcePath)
try {
  Write-Icon $sourceImage 1024 (Join-Path $brandDir 'app-icon-final-1024.png')
  Write-Icon $sourceImage 1024 (Join-Path $mobileAssets 'icon.png')
  Write-Icon $sourceImage 1024 (Join-Path $mobileAssets 'adaptive-icon.png')
  Write-Icon $sourceImage 120 (Join-Path $brandDir 'app-icon-home-120.png')
  Write-Icon $sourceImage 80 (Join-Path $brandDir 'app-icon-spotlight-80.png')
  Write-Icon $sourceImage 58 (Join-Path $brandDir 'app-icon-settings-58.png')
  Write-Icon $sourceImage 102 (Join-Path $brandDir 'app-icon-search-102.png')
  Write-Icon $sourceImage 1024 (Join-Path $brandDir 'app-icon-grayscale-1024.png') $true
} finally {
  $sourceImage.Dispose()
}

Get-ChildItem $brandDir -Filter 'app-icon-*.png' | Sort-Object Name | Select-Object Name,Length
