@echo off
REM PSYCO local build wrapper. Carrega vcvars (BuildTools 2022 x64) e roda
REM o build.sh em release mode com cargo limitado a 4 cores.
REM
REM Workaround importante: Git Bash injeta /usr/bin no inicio do PATH,
REM mascarando o link.exe da MSVC (que vcvars carregou) com o link.exe
REM da GNU coreutils. Resolvemos prepando o diretorio MSVC no PATH do
REM bash antes de chamar build.sh.

call "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvarsall.bat" x64
if errorlevel 1 exit /b 1

set CARGO_BUILD_JOBS=4
cd /d "C:\Users\chris\Desktop\Claude-Psyco\psyco\projects\thiago-moya\vpnvu-desktop"

REM Captura o diretorio do link.exe do MSVC (setado por vcvars).
set "MSVC_LINK_DIR="
for /f "delims=" %%i in ('where link.exe 2^>nul ^| findstr /i "BuildTools"') do (
    set "MSVC_LINK_DIR=%%~dpi"
    goto :found
)
:found
if not defined MSVC_LINK_DIR (
    echo ERRO: link.exe da MSVC nao encontrado apos vcvars
    exit /b 2
)
echo [psyco] MSVC link.exe dir: %MSVC_LINK_DIR%

REM Roda build.sh via Git Bash com link.exe MSVC prepended no PATH.
"C:\Program Files\Git\bin\bash.exe" -c "export PATH=\"$(cygpath -u '%MSVC_LINK_DIR%'):$PATH\"; bash build.sh --optimize"
exit /b %ERRORLEVEL%
