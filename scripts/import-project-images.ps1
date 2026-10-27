param(
    [Parameter(Mandatory = $true)]
    [string]$SourceRoot,
    [ValidateRange(640, 3840)]
    [int]$MaxDimension = 1920,
    [ValidateRange(40, 100)]
    [int]$Quality = 85
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$repoRoot = Split-Path -Parent $PSScriptRoot
$source = (Resolve-Path -LiteralPath $SourceRoot).Path.TrimEnd('\', '/')
$contentPath = Join-Path $repoRoot 'content\portfolio.json'
$outputRoot = Join-Path $repoRoot 'static\images\projects'
$folders = @(Get-ChildItem -LiteralPath $source -Directory | Sort-Object Name)
if ($folders.Count -eq 0) { throw 'No project folders found. Portfolio content was not changed.' }
$existing = @()
if (Test-Path -LiteralPath $contentPath) {
    $existing = Get-Content -LiteralPath $contentPath -Raw -Encoding UTF8 | ConvertFrom-Json
}
$textInfo = [System.Globalization.CultureInfo]::InvariantCulture.TextInfo
$roomLabels = @{
    'kids room' = 'Kids Bedroom'; 'kids bedromm' = 'Kids Bedroom'
    'bedroom 2' = 'Bedroom 2'; 'mbr' = 'Master Bedroom'; 'mbr3' = 'Bedroom 3'
    'm bedroom' = 'Master Bedroom'; 'tv unt' = 'TV Unit'; 'hall' = 'Living & Dining'
}

function ConvertTo-Slug([string]$Value) {
    $slug = ($Value.ToLowerInvariant() -replace '[^a-z0-9]+', '-').Trim('-')
    if (-not $slug) { return 'item' }
    return $slug
}

function Get-PathHash([string]$Value) {
    $hasher = [System.Security.Cryptography.SHA256]::Create()
    try {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($Value)
        return ([BitConverter]::ToString($hasher.ComputeHash($bytes))).Replace('-', '').Substring(0, 12).ToLowerInvariant()
    } finally { $hasher.Dispose() }
}

function Export-WebImage([string]$InputPath, [string]$OutputPath) {
    $image = [System.Drawing.Image]::FromFile($InputPath)
    $bitmap = $null
    $graphics = $null
    $encoderParameters = $null
    try {
        if ($image.PropertyIdList -contains 274) {
            $orientation = [BitConverter]::ToUInt16($image.GetPropertyItem(274).Value, 0)
            $rotations = @{ 2 = 4; 3 = 2; 4 = 6; 5 = 5; 6 = 1; 7 = 7; 8 = 3 }
            if ($rotations.ContainsKey([int]$orientation)) {
                $image.RotateFlip([System.Drawing.RotateFlipType]$rotations[[int]$orientation])
            }
        }
        $scale = [Math]::Min(1.0, $MaxDimension / [double][Math]::Max($image.Width, $image.Height))
        $width = [Math]::Max(1, [int][Math]::Round($image.Width * $scale))
        $height = [Math]::Max(1, [int][Math]::Round($image.Height * $scale))
        $bitmap = New-Object System.Drawing.Bitmap($width, $height)
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        $graphics.Clear([System.Drawing.Color]::White)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.DrawImage($image, 0, 0, $width, $height)
        $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
        $encoderParameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encoderParameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$Quality)
        $bitmap.Save($OutputPath, $codec, $encoderParameters)
        return @{ width = $width; height = $height }
    } finally {
        if ($encoderParameters) { $encoderParameters.Dispose() }
        if ($graphics) { $graphics.Dispose() }
        if ($bitmap) { $bitmap.Dispose() }
        $image.Dispose()
    }
}

$projectIds = @{}
foreach ($folder in $folders) {
    $projectId = ConvertTo-Slug $folder.Name
    if ($projectIds.ContainsKey($projectId)) { throw "Project folder names produce the same ID: $projectId. Rename one folder before importing." }
    $projectIds[$projectId] = $true
}
$projects = @()
$totalImages = 0
foreach ($folder in $folders) {
    $projectId = ConvertTo-Slug $folder.Name
    $previous = $existing | Where-Object source_folder -eq $folder.Name | Select-Object -First 1
    $previousImages = @{}
    foreach ($room in $previous.rooms) {
        foreach ($photo in $room.images) { $previousImages[$photo.source] = $photo }
    }
    $files = @(Get-ChildItem -LiteralPath $folder.FullName -Recurse -File | Sort-Object FullName)
    $imageFiles = @($files | Where-Object Extension -match '^\.(png|jpe?g)$')
    foreach ($excluded in $files | Where-Object Extension -notmatch '^\.(png|jpe?g)$') {
        Write-Warning "Not an imported JPG/PNG image: $($excluded.FullName)"
    }
    $rooms = @()
    $roomLookup = @{}
    foreach ($file in $imageFiles) {
        $relative = $file.FullName.Substring($folder.FullName.Length + 1).Replace('\', '/')
        $roomSource = ''
        if ($relative.Contains('/')) { $roomSource = $relative.Substring(0, $relative.LastIndexOf('/')) }
        if (-not $roomLookup.ContainsKey($roomSource)) {
            $roomName = 'Project Overview'
            $roomId = 'overview'
            if ($roomSource) {
                $roomName = $textInfo.ToTitleCase(($roomSource -replace '[/_]', ' ').ToLowerInvariant())
                if ($roomLabels.ContainsKey($roomSource.ToLowerInvariant())) { $roomName = $roomLabels[$roomSource.ToLowerInvariant()] }
                $roomId = (ConvertTo-Slug $roomSource) + '-' + (Get-PathHash $roomSource)
            }
            $previousRoom = $previous.rooms | Where-Object source_folder -eq $roomSource | Select-Object -First 1
            if ($previousRoom.title) { $roomName = $previousRoom.title }
            $room = [ordered]@{ id = $roomId; title = $roomName; source_folder = $roomSource; images = @() }
            $roomLookup[$roomSource] = $room
            $rooms += $room
        }
        $room = $roomLookup[$roomSource]
        $stem = ConvertTo-Slug $file.BaseName
        if ($stem.Length -gt 70) { $stem = $stem.Substring(0, 70) }
        $fileName = $stem + '-' + (Get-PathHash $relative) + '.jpg'
        $roomPath = Join-Path (Join-Path $outputRoot $projectId) $room.id
        New-Item -ItemType Directory -Path $roomPath -Force | Out-Null
        $dimensions = Export-WebImage $file.FullName (Join-Path $roomPath $fileName)
        $title = $textInfo.ToTitleCase(($file.BaseName -replace '[_\.]', ' ').Trim().ToLowerInvariant())
        if ($file.BaseName -match '^\d+$|^unnamed') { $title = $room.title + ' - View ' + ($room.images.Count + 1) }
        if ($previousImages.ContainsKey($relative)) { $title = $previousImages[$relative].title }
        $room.images += [ordered]@{
            image = "images/projects/$projectId/$($room.id)/$fileName"
            title = $title
            source = $relative
            width = $dimensions.width
            height = $dimensions.height
        }
    }
    $allImages = @($rooms | ForEach-Object { $_.images })
    $cover = ''
    if ($allImages.Count -gt 0) {
        $coverPhoto = $allImages | Where-Object source -match '(living hall|hall/hall|tv unt/2 FULL|light pastel)' | Select-Object -First 1
        if (-not $coverPhoto) { $coverPhoto = $allImages[0] }
        $cover = $coverPhoto.image
        if ($previous.cover -and $previous.cover -in $allImages.image) { $cover = $previous.cover }
    }
    $project = [ordered]@{
        id = $projectId
        source_folder = $folder.Name
        title = $textInfo.ToTitleCase($folder.Name.ToLowerInvariant())
        description = 'Explore the design renders, organized by space. Select any image for a closer look.'
        enabled = $true
        cover = $cover
        image_count = $allImages.Count
        rooms = $rooms
    }
    foreach ($field in @('title', 'description', 'enabled', 'slug', 'order')) {
        if ($previous -and $previous.PSObject.Properties.Name -contains $field) { $project[$field] = $previous.$field }
    }
    $projects += $project
    $totalImages += $allImages.Count
    Write-Host "$($folder.Name): $($allImages.Count) images in $($rooms.Count) room groups"
}
$json = ConvertTo-Json -InputObject @($projects) -Depth 12
[System.IO.File]::WriteAllText($contentPath, $json + [Environment]::NewLine, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "Imported $totalImages images across $($projects.Count) projects. Source files are unchanged."
