import buble from 'rollup-plugin-buble';
import filesize from 'rollup-plugin-filesize';

export default {
  entry: 'src/index.js',
  dest: 'public/scripts/bundle.js',
  format: 'iife',
  moduleName: 'VimeoRandomButton',
  external: [ 'mithril' ],
  globals: { mithril: 'm' },
  plugins: [
    buble(),
    filesize(),
  ],
}
