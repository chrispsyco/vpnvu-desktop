# Code-signing setup — VPN.vu Desktop (Windows + macOS)

O pipeline de assinatura **já está escrito** no `.github/workflows/psyco-release.yml`,
guardado pelo input `sign` (default `false`). Enquanto os certs não saem, todo build
é **unsigned** e nada quebra. Quando os certs forem emitidos para a **TMBS LLC**
(destravado pela propagação do D-U-N-S `145032347` no D&B), é só:

1. Adicionar os secrets abaixo no repo (`Settings → Secrets and variables → Actions`).
2. Disparar o workflow **VPN.vu Desktop - Release Build** via `workflow_dispatch` com
   **`sign = true`** (ou pushar uma tag `vX.Y.Z-dev` e rodar com sign=true).

Sem nenhum secret a mais. O YAML não precisa mudar.

---

## Windows — EV via SSL.com eSigner Cloud (cloud HSM, sem token físico)

Step: `Code-sign installer (SSL.com eSigner Cloud)` no job `build-windows`
(usa a action oficial `sslcom/esigner-codesign`). Assina o `.exe` localizado.

Secrets:

| Secret | O que é / onde pegar |
|---|---|
| `SSL_COM_USERNAME` | usuário da conta SSL.com (eSigner) |
| `SSL_COM_PASSWORD` | senha da conta SSL.com |
| `SSL_COM_TOTP_SECRET` | segredo TOTP do eSigner (SSL.com → eSigner → *automation/CI* → "Show/Generate TOTP secret"). É o segredo base32, **não** o código de 6 dígitos |
| `SSL_COM_CREDENTIAL_ID` | ID da credencial de assinatura (eSigner → certificado EV → Credential ID) |

⚠️ **arm64**: a action é testada em x64. Na primeira release assinada, conferir se o
job `windows-11-arm` assina OK. Se falhar no arm64, assinar a fatia arm64 a partir
do runner x64 (o `.exe` é só um arquivo; o eSigner não exige rodar na arquitetura alvo).

> Provedor alternativo: DigiCert KeyLocker (KeyLocker/SSM via `smctl`). Se for esse em
> vez do SSL.com, trocar só este step pelo `digicert/ssm-code-signing` + `smctl sign`.

---

## macOS — Apple Developer ID + notarização

Step: `Build daemon + GUI universal` no job `build-macos`. Quando `sign=true`,
o `electron-builder` assina com o **Developer ID Application** (via `CSC_LINK`) e o
`build.sh --notarize` notariza o `.pkg` com o `notarytool` (usa um keychain-profile
criado no próprio step). Precisa do enrollment **Apple Developer Program como
organização** (TMBS LLC) — mesmo gargalo do D-U-N-S.

Secrets:

| Secret | O que é / onde pegar |
|---|---|
| `APPLE_CSC_LINK` | o `.p12` do **Developer ID Application** em **base64**. Exporta do Keychain (cert + chave privada) e roda `base64 -i cert.p12 \| pbcopy` |
| `APPLE_CSC_KEY_PASSWORD` | senha definida ao exportar o `.p12` |
| `APPLE_ID` | e-mail da conta Apple Developer (org) |
| `APPLE_APP_SPECIFIC_PASSWORD` | app-specific password p/ o notarytool (appleid.apple.com → Sign-In & Security → App-Specific Passwords) |
| `APPLE_TEAM_ID` | Team ID de 10 chars (Apple Developer → Membership) |

> O `.pkg` é instalador; para distribuir fora da App Store ele precisa de
> **Developer ID Installer** além do *Application*. Se o electron-builder reclamar de
> Installer cert na primeira release, adicionar também esse cert ao `.p12` exportado.

---

## Como disparar (quando os secrets estiverem no lugar)

`Actions → VPN.vu Desktop - Release Build → Run workflow`:
- `version`: ex. `0.1.0-dev`
- `sign`: **true**

O job `release` publica o que buildar; com `sign=true` os artefatos saem assinados
(Windows) e assinados+notarizados (macOS). Recomendado: na **primeira** release
assinada, rodar e validar SmartScreen (Win) e Gatekeeper (`spctl -a -vvv` no .pkg)
antes de divulgar o link.
