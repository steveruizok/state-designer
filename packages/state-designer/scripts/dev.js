/* eslint-disable */
const esbuild = require('esbuild')
const pkg = require('../package.json')

async function main() {
  esbuild.build({
    entryPoints: ['./src/index.ts'],
    outdir: 'dist/esm',
    minify: false,
    bundle: true,
    incremental: true,
    sourcemap: true,
    format: 'esm',
    target: 'es6',
    tsconfig: './tsconfig.build.json',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    external: Object.keys(pkg.dependencies),
    watch: {
      onRebuild(error) {
        if (error) {
          console.log(`× ${pkg.name}: An error in prevented the rebuild.`)
          return
        }
        console.log(`✔ ${pkg.name}: Rebuilt.`)
      },
    },
  })
}

main()
