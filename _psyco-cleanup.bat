@antml:parameter name="content">@echo off
REM PSYCO cleanup pre instalacao do build novo.
REM Para+deleta services (atual VPNvu + legacy MullvadVPN, idempotente),
REM roda uninstaller, e LIMPA TUDO de usuario tambem · contas, settings,
REM logs · pra cada install ser um teste limpo de boot do zero. Sem isso
REM o splash testa flow de "user existente" em vez de "first launch".

echo [psyco] Parando service VPNvu (atual)...
net stop VPNvu
sc delete VPNvu
echo [psyco] Parando service MullvadVPN (legacy, se existir)...
net stop MullvadVPN
sc delete MullvadVPN

echo [psyco] Rodando uninstaller (silent)...
if exist "C:\Program Files\VPN.vu\Uninstall VPN.vu.exe" "C:\Program Files\VPN.vu\Uninstall VPN.vu.exe" /allusers /S

echo [psyco] Aguardando uninstaller fechar...
timeout /t 8 /nobreak >NUL

echo [psyco] Limpando dados de usuario e daemon...
REM Settings/login/cache do Electron renderer
if exist "%APPDATA%\VPN.vu" rmdir /s /q "%APPDATA%\VPN.vu"
if exist "%APPDATA%\Mullvad VPN" rmdir /s /q "%APPDATA%\Mullvad VPN"
if exist "%LOCALAPPDATA%\VPN.vu" rmdir /s /q "%LOCALAPPDATA%\VPN.vu"
if exist "%LOCALAPPDATA%\Mullvad VPN" rmdir /s /q "%LOCALAPPDATA%\Mullvad VPN"
REM Daemon state · account number, relays cache, WireGuard keys
if exist "%PROGRAMDATA%\VPN.vu" rmdir /s /q "%PROGRAMDATA%\VPN.vu"
if exist "%PROGRAMDATA%\Mullvad VPN" rmdir /s /q "%PROGRAMDATA%\Mullvad VPN"
REM Program Files resíduos do uninstall que sobraram
if exist "C:\Program Files\VPN.vu" rmdir /s /q "C:\Program Files\VPN.vu"
if exist "C:\Program Files\Mullvad VPN" rmdir /s /q "C:\Program Files\Mullvad VPN"

echo [psyco] Estado final:
sc query VPNvu 2>&1 | findstr /i "NOME_DO_SERVI ESTADO"
sc query MullvadVPN 2>&1 | findstr /i "NOME_DO_SERVI ESTADO"
if exist "C:\Program Files\VPN.vu\VPN.vu.exe" (echo PROGRAM FILES AINDA EXISTE) else (echo PROGRAM FILES limpo)
if exist "%APPDATA%\VPN.vu" (echo APPDATA AINDA EXISTE) else (echo APPDATA limpo)
if exist "%PROGRAMDATA%\VPN.vu" (echo PROGRAMDATA AINDA EXISTE) else (echo PROGRAMDATA limpo)
echo [psyco] cleanup concluido.
