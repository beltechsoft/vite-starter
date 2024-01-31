import { defineConfig, UserConfig } from 'vite';
import path from 'path';
import sassGlobImports from 'vite-plugin-sass-glob-import';
import removeConsole from "vite-plugin-remove-console";
import { viteStaticCopy } from 'vite-plugin-static-copy'
import babel from '@rollup/plugin-babel';
import vue from '@vitejs/plugin-vue'

const PATHS = {
    src: path.join(__dirname, './resources'),
    dist: path.join(__dirname, './assets'),
}

let isProduction = process.env.NODE_ENV === 'production' && !process.argv.includes('--watch');
isProduction = false;

const config = <UserConfig> defineConfig({    
    base: '/assets/',
    esbuild: false,
    build: {
        sourcemap: !isProduction,
        minify: isProduction,
        rollupOptions: { 
            input: {
               //  application: PATHS.src + '/js/application.js',
                // vendors: PATHS.src + '/js/vendors.js',
                 application: PATHS.src + '/scss/application.scss',
                 'css/test/application': PATHS.src + '/scss/test/application.scss',

             //    'vue/application' : PATHS.src + '/vue/application.js'
            },
            output: {
                dir: PATHS.dist,
                entryFileNames:  'js/[name].js',
                assetFileNames: (assetInfo) => {
                    const normalizeAssetInfo = path.normalize(assetInfo.name);
                    const normalizePathAssets = path.normalize(PATHS.src + '/assets/');
                
                    if(normalizeAssetInfo.includes(normalizePathAssets)){
                        return normalizeAssetInfo.replace(normalizePathAssets, '').replace(/\\/g, "/");
                    }

                    if(assetInfo.name?.endsWith('.css')){
                        return assetInfo.name?.replace('resources/scss/', 'css/');
                    }

                    return'[name].[ext]';
                },
            }
        }
    },
    css: {
        preprocessorOptions: {
            scss: {
         //       additionalData: `@import "@/scss/vendors/foundation/foundation";`,
            },
        },
    },
    plugins: [
        babel({ babelHelpers: 'bundled' }),
        sassGlobImports(),
        /*viteStaticCopy({
            targets: [
              {
                src:  normalizePath(path.resolve(__dirname, './resources/assets/*')),
                dest: normalizePath(path.resolve(__dirname, './assets'))
              }
            ]
        })*/
    //    vue(),
    ],
   
    resolve: {
        alias: {
            "~": path.join(__dirname, "/node_modules"),
        },
        extensions: ['.scss', '.css', '.js'],
    },
     hmr: {
            protocol: 'wss',
           // overlay: false
        },
    server: {
        watch: {
          usePolling: true,
        }
      },
});

// Babel
if (isProduction) {    
    config.plugins?.push(removeConsole())

}

export default config;