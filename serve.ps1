<#
  Lokalny podgląd strony AerialParadise (bez Node i Pythona).
  Uruchomienie: powershell -ExecutionPolicy Bypass -File serve.ps1 [-Port 8095]
#>
param(
  [int]$Port = 8095
)

$root = $PSScriptRoot
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()

$mime = @{
  ".html"  = "text/html; charset=utf-8"
  ".css"   = "text/css; charset=utf-8"
  ".js"    = "application/javascript; charset=utf-8"
  ".svg"   = "image/svg+xml"
  ".png"   = "image/png"
  ".jpg"   = "image/jpeg"
  ".jpeg"  = "image/jpeg"
  ".webp"  = "image/webp"
  ".avif"  = "image/avif"
  ".ico"   = "image/x-icon"
  ".json"  = "application/json"
  ".pdf"   = "application/pdf"
  ".woff"  = "font/woff"
  ".woff2" = "font/woff2"
  ".ttf"   = "font/ttf"
}

Write-Host "AerialParadise: http://localhost:$Port/  (Ctrl+C konczy)"

while ($listener.IsListening) {
  $context = $listener.GetContext()
  $request = $context.Request
  $response = $context.Response

  $path = [System.Uri]::UnescapeDataString($request.Url.LocalPath)
  if ($path -eq "/") { $path = "/index.html" }
  $filePath = Join-Path $root ($path.TrimStart("/"))

  if (Test-Path $filePath -PathType Leaf) {
    $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
    $contentType = $mime[$ext]
    if (-not $contentType) { $contentType = "application/octet-stream" }
    $bytes = [System.IO.File]::ReadAllBytes($filePath)
    $response.ContentType = $contentType
    $response.ContentLength64 = $bytes.Length
    $response.OutputStream.Write($bytes, 0, $bytes.Length)
  } else {
    $response.StatusCode = 404
    $notFound = [System.Text.Encoding]::UTF8.GetBytes("404: $path")
    $response.ContentType = "text/plain; charset=utf-8"
    $response.OutputStream.Write($notFound, 0, $notFound.Length)
  }
  $response.OutputStream.Close()
}
