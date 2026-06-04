@echo off
REM Script de instalação de todas as dependências

echo ========================================
echo Rastreabilidade de Gado - Setup
echo ========================================

echo.
echo [1/3] Instalando dependências da API...
cd /d "rastreio-api"
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Erro ao instalar API
    exit /b 1
)
cd /d ..

echo.
echo [2/3] Instalando dependências do Web...
cd /d "rastreio-web"
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Erro ao instalar Web
    exit /b 1
)
cd /d ..

echo.
echo [3/3] Instalando dependências do Mobile...
cd /d "rastreio-mobile"
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Erro ao instalar Mobile
    exit /b 1
)
cd /d ..

echo.
echo ========================================
echo ✓ Instalação concluída com sucesso!
echo ========================================
echo.
echo Próximos passos:
echo 1. Configure os arquivos .env em cada projeto
echo 2. Crie o banco de dados usando database-schema.sql
echo 3. Inicie cada app:
echo    - API: cd rastreio-api && npm run dev
echo    - Web: cd rastreio-web && npm run dev
echo    - Mobile: cd rastreio-mobile && npm start
echo.
pause
