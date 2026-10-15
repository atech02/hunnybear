Add-Type -AssemblyName System.Drawing
$srcPath = "c:\Dev\projects\hunnybear\image\Whimsical Bear by the Rainbow Stream.png"
$img = [System.Drawing.Image]::FromFile($srcPath)
$outDir = "c:\Dev\projects\hunnybear\public\image\sprites"

$regions = @{
    "head" = @{ x = 360; y = 170; w = 560; h = 520; feather = 24 }
    "left_ear" = @{ x = 440; y = 190; w = 180; h = 180; feather = 18 }
    "right_ear" = @{ x = 740; y = 290; w = 180; h = 190; feather = 18 }
    "nose" = @{ x = 550; y = 425; w = 120; h = 95; feather = 12 }
    "mouth" = @{ x = 535; y = 480; w = 150; h = 110; feather = 14 }
    "left_eye" = @{ x = 500; y = 345; w = 115; h = 130; feather = 14 }
    "right_eye" = @{ x = 650; y = 385; w = 120; h = 135; feather = 14 }
    "left_cheek" = @{ x = 420; y = 405; w = 140; h = 130; feather = 16 }
    "right_cheek" = @{ x = 690; y = 455; w = 140; h = 130; feather = 16 }
    "left_paw" = @{ x = 395; y = 575; w = 205; h = 205; feather = 20 }
    "right_paw" = @{ x = 570; y = 580; w = 205; h = 205; feather = 20 }
    "tummy" = @{ x = 450; y = 650; w = 330; h = 350; feather = 26 }
    "left_foot" = @{ x = 420; y = 960; w = 195; h = 165; feather = 20 }
    "right_foot" = @{ x = 635; y = 965; w = 205; h = 165; feather = 20 }
}

foreach ($key in $regions.Keys) {
    $r = $regions[$key]
    $bmp = New-Object System.Drawing.Bitmap $r.w, $r.h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $srcRect = New-Object System.Drawing.Rectangle $r.x, $r.y, $r.w, $r.h
    $destRect = New-Object System.Drawing.Rectangle 0, 0, $r.w, $r.h
    $g.DrawImage($img, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()

    # Apply soft elliptical alpha mask
    $feather = $r.feather
    $cx = $r.w / 2.0
    $cy = $r.h / 2.0
    $rx = $r.w / 2.0
    $ry = $r.h / 2.0

    for ($y = 0; $y -lt $r.h; $y++) {
        for ($x = 0; $x -lt $r.w; $x++) {
            $dx = ($x - $cx) / $rx
            $dy = ($y - $cy) / $ry
            $dist = [Math]::Sqrt($dx * $dx + $dy * $dy)
            if ($dist -gt 1.0) {
                $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            } elseif ($dist -gt 0.75) {
                $orig = $bmp.GetPixel($x, $y)
                $alphaFactor = (1.0 - $dist) / 0.25
                $newAlpha = [int]($orig.A * $alphaFactor)
                $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($newAlpha, $orig.R, $orig.G, $orig.B))
            }
        }
    }

    $outPath = Join-Path $outDir "$key.png"
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Output "Feathered and saved $key.png"
}

$img.Dispose()
