import { defineConfig, UserConfig } from 'vite';
import path from 'path';
import autoprefixer from 'autoprefixer';
import sassGlobImports from 'vite-plugin-sass-glob-import';
import glob from 'glob';
import { fileURLToPath } from 'node:url';
import babel from 'rollup-plugin-babel';
import removeConsole from "vite-plugin-remove-console";
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { normalizePath } from 'vite'

const PATHS = {
    src: path.join(__dirname, './resources'),
    dist: path.join(__dirname, './assets'),
}

const isProduction = process.env.NODE_ENV === 'production' && !process.argv.includes('--watch');
const config = <UserConfig> defineConfig({    
    build: {
        sourcemap: !isProduction,
        minify: isProduction,
        rollupOptions: {
            input: {
                application: PATHS.src + '/js/application.js',
                vendors: PATHS.src + '/js/vendors.js',
                applicationCss: PATHS.src + '/scss/application.scss',


                ...Object.fromEntries(
                    glob.sync(PATHS.src + '/js/pages/**/*.js').map(file => {
                       return [
                            path.relative(PATHS.src + '/js', file.slice(0, file.length - path.extname(file).length)),
                            file
                        ]
                    })
                ),
            },
            output: {
                dir: PATHS.dist,
                entryFileNames: 'js/[name].js',
                assetFileNames: (assetInfo) => {
                    if(/\.css$/.test(assetInfo.name) && assetInfo.name.includes('resources/scss/')){
                        return assetInfo.name?.replace('resources/scss/', 'css/');
                    }

                    return'css/[name].[ext]';
                },
            }
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
        sassGlobImports(),
        viteStaticCopy({
            targets: [
              {
                src:  normalizePath(path.resolve(__dirname, './resources/assets/*')),
                dest: normalizePath(path.resolve(__dirname, './assets'))
              }
            ]
          })
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
    config.plugins?.push( 
        babel({
             presets: [
                [
                    '@babel/preset-env', {
                        targets: [  
                            "last 2 Chrome versions",
                            "last 2 Firefox versions",
                            "Safari >= 9",
                            "IE >= 10"
                        ], 
                        modules: false
                    },
                ],
            ],
        }),
    );
    
    config.plugins?.push(removeConsole())

}

export default config;