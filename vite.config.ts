import { execFileSync } from 'node:child_process';
import { resolve, sep } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import { serviceWorkerSource } from './scripts/lib/service-worker.mjs';

const root = import.meta.dirname;
const REBUILD_DELAY_MS = 200;

// Rebuilds src/generated/ from data/ and memory/ through scripts/site-data.mjs.
// `vite build` is strict (all 45 chapters must exist) unless GATE_PARTIAL=1;
// the dev server always tolerates missing chapters and re-emits after every edit.
function siteData(): Plugin {
  const emit = (partial: boolean) => {
    execFileSync('node', [resolve(root, 'scripts/site-data.mjs'), ...(partial ? ['--partial'] : [])], { stdio: 'inherit' });
  };
  const sources = [resolve(root, 'data') + sep, resolve(root, 'memory') + sep];
  // These are the pipeline's own outputs; reacting to them would loop.
  const outputs = [resolve(root, 'data/curriculum_manifest.json'), resolve(root, 'memory/STATUS.md')];
  const isSource = (file: string) =>
    sources.some((dir) => file.startsWith(dir)) && /\.(json|md)$/.test(file) && !outputs.includes(file);

  return {
    name: 'gate-site-data',
    configResolved(config) {
      if (process.env.VITEST) return;
      if (config.command === 'build') return emit(process.env.GATE_PARTIAL === '1');
      try {
        emit(true);
      } catch {
        // Keep serving the last good src/generated/ while a file is being fixed.
        config.logger.error('site data not rebuilt: fix the validator errors above');
      }
    },
    configureServer(server) {
      server.watcher.add(sources);
      let timer: ReturnType<typeof setTimeout> | undefined;
      const rebuild = (file: string) => {
        if (!isSource(file)) return;
        // Agents and editors write files in bursts; rebuild once per burst.
        clearTimeout(timer);
        timer = setTimeout(() => {
          try {
            emit(true);
          } catch {
            server.config.logger.error('site data not rebuilt: fix the validator errors above');
          }
        }, REBUILD_DELAY_MS);
      };
      for (const event of ['add', 'change', 'unlink'] as const) server.watcher.on(event, rebuild);
    },
  };
}

// Emits sw.js with the bundle's file list: the entry chunk, its static imports and the CSS form
// the shell precached on install; everything else is cached when first opened or on request.
function serviceWorker(): Plugin {
  return {
    name: 'gate-service-worker',
    apply: 'build',
    generateBundle(_options, bundle) {
      const shell = new Set<string>();
      const visit = (name: string) => {
        const item = bundle[name];
        if (!item || shell.has(name)) return;
        shell.add(name);
        if (item.type === 'chunk') {
          item.imports.forEach(visit);
          item.viteMetadata?.importedCss.forEach((css) => shell.add(css));
        }
      };
      for (const [name, item] of Object.entries(bundle)) if (item.type === 'chunk' && item.isEntry) visit(name);
      const all = Object.entries(bundle)
        .filter(([name]) => !name.endsWith('.map'))
        .map(([file, item]) => ({ file, bytes: item.type === 'chunk' ? Buffer.byteLength(item.code) : typeof item.source === 'string' ? Buffer.byteLength(item.source) : item.source.byteLength }));
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: serviceWorkerSource({ shell: [...shell], all }) });
    },
  };
}

export default defineConfig({
  // Relative asset URLs plus hash routing: the build works from any GitHub Pages path.
  base: './',
  plugins: [siteData(), react(), tailwindcss(), serviceWorker()],
  resolve: { alias: { '@': resolve(root, 'src') } },
  build: { target: 'es2022', chunkSizeWarningLimit: 900 },
});
