/*********************************************************************************************************************/
/**********                                              Vite                                               **********/
/*********************************************************************************************************************/

import { defineConfig, UserConfig } from 'vite';
import path from 'path';
import legacy from '@vitejs/plugin-legacy';
import autoprefixer from 'autoprefixer';
import pkg from './package.json';
import alias from '@rollup/plugin-alias'
import sassGlobImports from 'vite-plugin-sass-glob-import';

const PATHS = {
    src: path.join(__dirname, './resources'),
    entries: path.join(__dirname, './resources/entries'),
    dist: path.join(__dirname, './assets'),
}

const isProduction = process.env.NODE_ENV === 'production' && !process.argv.includes('--watch');

const config = <UserConfig> defineConfig({

    build: {
        sourcemap: !isProduction,
        minify: isProduction,
        rollupOptions: {
            input: {
                'application': PATHS.entries  + '/application.js',
            },
            output: {
                dir:  PATHS.dist,
                entryFileNames: 'js/[name].js',
                assetFileNames: 'css/[name].[ext]',
            },
        }
    },
    css: {
        postcss: {
            plugins: [
                autoprefixer()
            ]
        }
    },
    plugins: [
        alias(),
        sassGlobImports(),
    ],
    resolve: {
        alias: {
            "~": path.join(__dirname, "/node_modules"),
        },
        extensions: ['.scss', '.css', '.js'],
    },
});

// Babel
if (isProduction) {
    config.plugins?.unshift(
        legacy({
            targets: pkg.browserslist
        })
    );
}


export default config;