$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot
npm.cmd run dev -- --hostname 0.0.0.0 --port 3000 *> ".\dev-server.log"
