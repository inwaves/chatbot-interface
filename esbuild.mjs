import * as esbuild from 'esbuild'

const context = await esbuild.context({
  entryPoints: ['src/index.tsx'],
  bundle: true,
  outdir: 'public',
});

await context.watch();

let { host, port } = await context.serve({
    servedir: 'public',
})