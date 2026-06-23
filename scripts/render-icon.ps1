Add-Type -AssemblyName System.Drawing

$size = 1024
$out = Join-Path $PSScriptRoot "..\app-icon-square.png"

$bmp = New-Object System.Drawing.Bitmap $size, $size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.Clear([System.Drawing.Color]::Transparent)

$cyan = [System.Drawing.Color]::FromArgb(255, 0, 229, 255)
$silver = [System.Drawing.Color]::FromArgb(255, 156, 163, 175)
$panel = [System.Drawing.Color]::FromArgb(255, 18, 20, 26)

$inset = 96
$rect = New-Object System.Drawing.Rectangle $inset, $inset, ($size - 2 * $inset), ($size - 2 * $inset)
$radius = 140
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$path.AddArc($rect.X, $rect.Y, $radius, $radius, 180, 90)
$path.AddArc($rect.Right - $radius, $rect.Y, $radius, $radius, 270, 90)
$path.AddArc($rect.Right - $radius, $rect.Bottom - $radius, $radius, $radius, 0, 90)
$path.AddArc($rect.X, $rect.Bottom - $radius, $radius, $radius, 90, 90)
$path.CloseFigure()

$fillBrush = New-Object System.Drawing.SolidBrush $panel
$g.FillPath($fillBrush, $path)

$pen = New-Object System.Drawing.Pen $cyan, 40
$pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$g.DrawPath($pen, $path)

$font = New-Object System.Drawing.Font "Segoe UI", 240, ([System.Drawing.FontStyle]::Bold)
$brush = New-Object System.Drawing.SolidBrush $cyan
$format = New-Object System.Drawing.StringFormat
$format.Alignment = [System.Drawing.StringAlignment]::Center
$format.LineAlignment = [System.Drawing.StringAlignment]::Center
$textRect = New-Object System.Drawing.RectangleF 0, 300, $size, 280
$g.DrawString("BLP", $font, $brush, $textRect, $format)

$arrowY = 760
$arrowPenCyan = New-Object System.Drawing.Pen $cyan, 28
$arrowPenCyan.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$arrowPenCyan.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$arrowPenSilver = New-Object System.Drawing.Pen $silver, 28
$arrowPenSilver.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$arrowPenSilver.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

$g.DrawLine($arrowPenCyan, 300, $arrowY, 430, $arrowY)
$g.DrawLine($arrowPenCyan, 300, $arrowY, 350, $arrowY - 35)
$g.DrawLine($arrowPenCyan, 300, $arrowY, 350, $arrowY + 35)

$g.DrawLine($arrowPenSilver, 724, $arrowY, 594, $arrowY)
$g.DrawLine($arrowPenSilver, 724, $arrowY, 674, $arrowY - 35)
$g.DrawLine($arrowPenSilver, 724, $arrowY, 674, $arrowY + 35)

$dotBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 107, 114, 128))
$g.FillEllipse($dotBrush, ($size / 2) - 12, $arrowY - 12, 24, 24)

$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()
$pen.Dispose()
$fillBrush.Dispose()
$font.Dispose()
$brush.Dispose()
$path.Dispose()

Write-Host "Saved icon (solid fill inside, transparent outside): $out (${size}x${size})"
