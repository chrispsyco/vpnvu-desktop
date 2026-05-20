// PSYCO demo build entrypoint: forces NODE_ENV=test so vite uses
// test/e2e/setup/main.ts as the Electron main process, then runs the
// shared build pipeline and packages a Windows NSIS installer that
// runs side-by-side with the real release.

const { build } = require('./build.cjs');
const { setNodeEnvironment } = require('./utils.cjs');
const { packDemo } = require('./pack-windows-demo.cjs');

async function buildAndPackageDemo() {
  setNodeEnvironment('test');
  await build();
  await packDemo();
}

buildAndPackageDemo().catch((error) => {
  console.error(error);
  process.exit(1);
});
