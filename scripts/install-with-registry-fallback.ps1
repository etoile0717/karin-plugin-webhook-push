Write-Host "Running npm install with default registry..."
try {
  npm install
  exit 0
} catch {
  Write-Host "npm install failed. Switching registry to https://registry.npmmirror.com"
  npm config set registry https://registry.npmmirror.com
  npm install
}
