import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
    const isProduction = mode === 'production';

    return {
        plugins: [react()],

        resolve: {
            alias: {
                // Fixed: Changed __dirname to import.meta.dirname
                '@': path.resolve(import.meta.dirname, './src'),
                '@components': path.resolve(import.meta.dirname, './src/components'),
                '@pages': path.resolve(import.meta.dirname, './src/pages'),
                '@hooks': path.resolve(import.meta.dirname, './src/hooks'),
                '@utils': path.resolve(import.meta.dirname, './src/utils'),
                '@services': path.resolve(import.meta.dirname, './src/services'),
                '@store': path.resolve(import.meta.dirname, './src/store'),
                '@styles': path.resolve(import.meta.dirname, './src/styles'),
                '@assets': path.resolve(import.meta.dirname, './src/assets'),
                '@config': path.resolve(import.meta.dirname, './src/config')
            }
        },

        server: {
            port: 5173,
            host: true,
            open: true,
            hmr: {
                protocol: 'ws',
                host: 'localhost',
                port: 5173,
                overlay: false,
            },
            proxy: {
                '/api': {
                    target: 'http://127.0.0.1:8000',
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api/, '/api'),
                    timeout: 30000,
                },
                '/ws': {
                    target: 'ws://127.0.0.1:8000',
                    ws: true,
                    changeOrigin: true,
                    timeout: 30000,
                }
            }
        },

        build: {
            outDir: 'dist',
            sourcemap: !isProduction,
            minify: isProduction,
            chunkSizeWarningLimit: 1500,
            rollupOptions: {
                output: {
                    // Fixed: Replaced manualChunks with modern advancedChunks grouping
                    advancedChunks: {
                        groups: [
                            {
                                name: 'vendor-react',
                                test: /node_modules\/(react|react-dom|react-router)/,
                            },
                            {
                                name: 'vendor-redux',
                                test: /node_modules\/(redux|@reduxjs\/toolkit)/,
                            },
                            {
                                name: 'vendor-echarts',
                                test: /node_modules\/(echarts|zrender)/,
                            },
                            {
                                name: 'vendor',
                                test: /node_modules/,
                            }
                        ]
                    },
                    chunkFileNames: 'assets/[name]-[hash].js',
                    entryFileNames: 'assets/[name]-[hash].js',
                    assetFileNames: 'assets/[name]-[hash].[ext]',
                },
            },
        },

        optimizeDeps: {
            include: [
                'react',
                'react-dom',
                'react-router-dom',
                '@reduxjs/toolkit',
                'react-redux',
                'axios',
                'echarts',
                'date-fns',
            ],
        },

        css: {
            devSourcemap: !isProduction,
            modules: {
                localsConvention: 'camelCase',
            },
        },
    };
});
