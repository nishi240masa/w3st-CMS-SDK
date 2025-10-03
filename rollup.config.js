const typescript = require('@rollup/plugin-typescript');

module.exports = {
  input: 'src/index.ts',
  output: {
    dir: 'lib',
    format: 'cjs',
    sourcemap: true
  },
  plugins: [typescript()],
  external: ['axios']
};