// Fast preview without the Remotion bundler: renders <Component frame={n}/> to SVG markup and screenshots it.
// usage: node preview.cjs <ComponentName> <outDir> <frame> [frame...]
const path = require('path'), fs = require('fs'), os = require('os');
const esbuild = require('esbuild');
const {chromium} = require('playwright');
(async () => {
  const [name, outDir, ...frames] = process.argv.slice(2);
  const bundle = path.join(os.tmpdir(), `crayon-preview-${process.pid}.cjs`);
  await esbuild.build({entryPoints: [path.join(__dirname, 'src/preview-entry.tsx')], bundle: true, platform: 'node', format: 'cjs', outfile: bundle, jsx: 'automatic', logLevel: 'error'});
  const {render} = require(bundle);
  fs.mkdirSync(outDir, {recursive: true});
  const browser = await chromium.launch();
  const page = await browser.newPage({viewport: {width: 1000, height: 1000}, deviceScaleFactor: 1});
  for (const f of frames) {
    await page.setContent(`<body style="margin:0;background:#fdfdfd">${render(name, Number(f))}</body>`);
    await page.screenshot({path: path.join(outDir, `p${String(f).padStart(3, '0')}.png`)});
  }
  await browser.close();
  fs.unlinkSync(bundle);
})().catch((e) => { console.error(e); process.exit(1); });
