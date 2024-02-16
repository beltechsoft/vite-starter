import { defineConfig, UserConfig, loadEnv, build, ViteDevServer } from 'vite';
import path from 'path';
import sassGlobImports from 'vite-plugin-sass-glob-import';
import removeConsole from "vite-plugin-remove-console";
import { viteStaticCopy } from 'vite-plugin-static-copy'
import babel, { getBabelOutputPlugin } from '@rollup/plugin-babel';
import vue from '@vitejs/plugin-vue';
import chokidar from 'chokidar'


process.env = {...process.env, ...loadEnv(process.env.NODE_ENV, process.cwd())};

const PATHS = {
    src: path.join(__dirname, './resources'),
    dist: path.join(__dirname, './assets'),
}

let isProduction = process.env.NODE_ENV === 'production';
console.log(process.env.NODE_ENV);
const hmr = () => ({
    name: 'configure-server',
    configureServer(server) {
        const reload = (path: string) => {
            server.ws.send({ type: 'full-reload', path: '*'});
        }
        const watcher = chokidar.watch( ['**/*.js', '**/*.css', '**/*.htm' ], {
            usePolling: true,
        });

        watcher.on('add', reload).on('change', reload)
    },
});

const config = <UserConfig> defineConfig({    
  //  base: '/themes/museum/assets/',
    build: {
        sourcemap: true,
        target: 'ESM',
       // minify: 'terser',
        ssr: false,
        rollupOptions: { 
            input: {
               // application: PATHS.src + '/js/application.js',
                //vendors: PATHS.src + '/js/vendors.js',
                 //application: PATHS.src + '/scss/application.scss',
                // 'css/test/application': PATHS.src + '/scss/test/application.scss',
                 'vue/application' : PATHS.src + '/vue/application.js'
            },
            output: {  
                dir: PATHS.dist,
                entryFileNames:  'js/[name].js',
                assetFileNames: (assetInfo) => {
                    if(/\.(png|jpg|gif|svg)$/.test(assetInfo.name)){
                        return'images/[name].[ext]';
                    }

                    if(/\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/.test(assetInfo.name)){
                        return'fonts/[name].[ext]';
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
        vue(),
        hmr(),
      //  getBabelOutputPlugin({ presets: ['@babel/preset-env']}),

      //  babel({ babelHelpers: 'bundled' }),
        sassGlobImports(),
    
    
    ],
   
    resolve: {
        alias: {
            "~": path.join(__dirname, "/node_modules"),
        },
        extensions: ['.scss', '.css', '.js'],
    },
    server: {
    
        hmr: {
            // Do not use encrypted connections for the HMR websocket.
         //   protocol: 'ws',

        },   
        watch: {
            usePolling: true,
        }
      }, 
});

// Babel
if (isProduction) {    
    config.plugins?.push(getBabelOutputPlugin({ presets: ['@babel/preset-env'] }));
}
//
//
export default config;