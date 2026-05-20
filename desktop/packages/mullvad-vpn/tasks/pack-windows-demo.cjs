// PSYCO demo build: packages the mock entrypoint (test/e2e/setup/main.ts) as
// a standalone NSIS installer. No Rust daemon, no winfw.dll, no split-tunnel
// driver, no service install — just the Electron GUI talking to an in-process
// mock that mimics daemon RPC responses. Used for QA on machines where the
// real daemon backend (Fase 4 / Fase 8) isn't ready yet.
//
// Installs side-by-side with the real release because appId and productName
// differ from tasks/distribution.cjs.

const path = require('path');
const fs = require('fs');
const builder = require('electron-builder');
const { execFileSync } = require('child_process');

const noCompression = process.argv.includes('--no-compression');

function root(relativePath) {
  return path.join(path.resolve(__dirname, '../../../../'), relativePath);
}

function distAssets(relativePath) {
  return root(path.join('dist-assets', relativePath));
}

// Versioning: try cargo (gives the same YYYY.N-... format as the real build);
// fall back to a date + short SHA when cargo isn't available (workflow demo).
function demoVersion() {
  const tagFromEnv = process.env.PSYCO_DEMO_VERSION;
  if (tagFromEnv) {
    return tagFromEnv.replace(/^v/, '');
  }
  try {
    const semverRaw = execFileSync('cargo', ['run', '-q', '--bin', 'mullvad-version', 'semver'], {
      encoding: 'utf-8',
      cwd: root(''),
    }).trim();
    return semverRaw + '-demo';
  } catch {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    let sha = 'local';
    try {
      sha = execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
        encoding: 'utf-8',
        cwd: root(''),
      }).trim();
    } catch {
      /* git missing, keep "local" */
    }
    return `${year}.${month}.${day}-demo-${sha}`;
  }
}

function newDemoConfig() {
  const version = demoVersion();

  return {
    appId: 'vu.vpn.app.demo',
    copyright: 'VPN.vu',
    productName: 'VPN.vu Demo',
    publish: null,
    asar: true,
    compression: noCompression ? 'store' : 'normal',
    // NO Rust daemon, NO winfw.dll, NO wireguard.dll, NO split-tunnel driver.
    extraResources: [],

    directories: {
      buildResources: distAssets(''),
      output: root('dist-demo'),
    },
    // Intentionally NO extraMetadata.name — overriding the package name
    // confuses electron-builder's workspace dependency traversal (it loses
    // track of postcss under styled-components). Letting the real
    // package.json drive identity is fine because appId / productName /
    // NSIS GUID below already prevent any collision with the real release.

    files: [
      'package.json',
      'build/',
      '!**/*.tsbuildinfo',
      '!test/e2e/installed/**',
      '!playwright.config.ts',
      'node_modules/',
      '!node_modules/grpc-tools',
      '!node_modules/@types',
      '!node_modules/@rollup',
      '!node_modules/nseventforwarder/debug',
      '!node_modules/windows-utils/debug',
    ],

    nsis: {
      // Different GUID from the real installer so demo installs side-by-side
      // and doesn't show up under the "VPN.vu" entry in Programs and Features.
      guid: 'd9b1f4a2-7a3e-4c1c-9c8b-3fa2c1b50d11',
      oneClick: false,
      perMachine: false,
      allowElevation: true,
      allowToChangeInstallationDirectory: true,
      // No include here: we deliberately skip the upstream mullvad_nsis plugin
      // and service-install macros. electron-builder's default NSIS template
      // handles install / shortcuts / uninstall / Programs and Features for us.
    },

    win: {
      target: [
        {
          target: 'nsis',
          arch: 'x64',
        },
      ],
      // demoVersion() is embedded literally so it survives ${version}
      // interpolation by electron-builder (which would substitute the
      // package.json "0.0.0" here).
      artifactName: 'vpn.vu-demo-' + version + '_${arch}.${ext}',
      // No extraResources for Win — the mock doesn't talk to a daemon.
    },
  };
}

async function packDemo() {
  process.env.PSYCO_DEMO_RESOLVED_VERSION = demoVersion();
  console.log(`Packing VPN.vu Demo · version ${process.env.PSYCO_DEMO_RESOLVED_VERSION}`);

  await builder.build({
    targets: builder.Platform.WINDOWS.createTarget(),
    config: newDemoConfig(),
  });
}

exports.packDemo = packDemo;
