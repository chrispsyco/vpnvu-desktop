@echo off
REM PSYCO cleanup pre instalacao do build novo.

echo [psyco] Parando service VPNvu...
net stop VPNvu
sc delete VPNvu
echo [psyco] Parando service MullvadVPN (legacy)...
net stop MullvadVPN
sc delete MullvadVPN

echo [psyco] Aguardando services pararem...
timeout /t 4 /nobreak >NUL

echo [psyco] Rodando uninstaller (silent)...
if exist "C:\Program Files\VPN.vu\Uninstall VPN.vu.exe" "C:\Program Files\VPN.vu\Uninstall VPN.vu.exe" /allusers /S

echo [psyco] Aguardando uninstaller fechar...
timeout /t 8 /nobreak >NUL

echo [psyco] Limpando dados de usuario e daemon...
if exist "%APPDATA%\VPN.vu" rmdir /s /q "%APPDATA%\VPN.vu"
if exist "%APPDATA%\Mullvad VPN" rmdir /s /q "%APPDATA%\Mullvad VPN"
if exist "%LOCALAPPDATA%\VPN.vu" rmdir /s /q "%LOCALAPPDATA%\VPN.vu"
if exist "%LOCALAPPDATA%\Mullvad VPN" rmdir /s /q "%LOCALAPPDATA%\Mullvad VPN"
if exist "%PROGRAMDATA%\VPN.vu" rmdir /s /q "%PROGRAMDATA%\VPN.vu"
if exist "%PROGRAMDATA%\Mullvad VPN" rmdir /s /q "%PROGRAMDATA%\Mullvad VPN"
if exist "C:\Program Files\VPN.vu" rmdir /s /q "C:\Program Files\VPN.vu"
if exist "C:\Program Files\Mullvad VPN" rmdir /s /q "C:\Program Files\Mullvad VPN"

echo [psyco] Estado final:
sc query VPNvu 2>&1 | findstr /i "STATE"
if exist "C:\Program Files\VPN.vu\VPN.vu.exe" (echo PROGRAM FILES AINDA EXISTE) else (echo PROGRAM FILES limpo)
if exist "%APPDATA%\VPN.vu" (echo APPDATA AINDA EXISTE) else (echo APPDATA limpo)
if exist "%PROGRAMDATA%\VPN.vu" (echo PROGRAMDATA AINDA EXISTE) else (echo PROGRAMDATA limpo)
echo [psyco] cleanup concluido.
