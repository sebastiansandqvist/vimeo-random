import buble from 'rollup-plugin-buble';
import filesize from 'rollup-plugin-filesize';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  entry: 'src/index.js',
  dest: 'public/scripts/bundle.js',
  format: 'iife',
  moduleName: 'VimeoRandomButton',
  external: [ 'mithril' ],
  globals: { mithril: 'm' },
  plugins: [
    buble(),
    resolve(),
    commonjs(),
    filesize(),
  ],
}
