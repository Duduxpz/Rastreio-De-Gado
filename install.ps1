#!/usr/bin/env pwsh

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Rastreabilidade de Gado - Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# API
Write-Host "[1/3] Instalando dependências da API..." -ForegroundColor Yellow
Push-Location "rastreio-api"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar API" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

# Web
Write-Host "[2/3] Instalando dependências do Web..." -ForegroundColor Yellow
Push-Location "rastreio-web"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar Web" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

# Mobile
Write-Host "[3/3] Instalando dependências do Mobile..." -ForegroundColor Yellow
Push-Location "rastreio-mobile"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar Mobile" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ Instalação concluída com sucesso!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Configure os arquivos .env em cada projeto" -ForegroundColor White
Write-Host "2. Crie o banco de dados usando database-schema.sql" -ForegroundColor White
Write-Host "3. Inicie cada app:" -ForegroundColor White
Write-Host "   - API: cd rastreio-api && npm run dev" -ForegroundColor Gray
Write-Host "   - Web: cd rastreio-web && npm run dev" -ForegroundColor Gray
Write-Host "   - Mobile: cd rastreio-mobile && npm start" -ForegroundColor Gray
Write-Host ""
