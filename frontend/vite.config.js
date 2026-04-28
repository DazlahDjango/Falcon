import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
    const isProduction = mode === 'production';
    
    return {
        plugins: [react()],
        
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
                '@components': path.resolve(__dirname, './src/components'),
                '@pages': path.resolve(__dirname, './src/pages'),
                '@hooks': path.resolve(__dirname, './src/hooks'),
                '@utils': path.resolve(__dirname, './src/utils'),
                '@services': path.resolve(__dirname, './src/services'),
                '@store': path.resolve(__dirname, './src/store'),
                '@styles': path.resolve(__dirname, './src/styles'),
                '@assets': path.resolve(__dirname, './src/assets'),
                '@config': path.resolve(__dirname, './src/config')
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
            chunkSizeWarningLimit: 1000,
            rollupOptions: {
                output: {
                    manualChunks: {
                        'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                        'redux-vendor': ['@reduxjs/toolkit', 'react-redux', 'redux-persist'],
                        'ui-vendor': ['lucide-react', 'react-icons'],
                        'chart-vendor': ['echarts', 'react-chartjs-2', 'chart.js'],
                        'form-vendor': ['formik', 'yup'],
                        'date-vendor': ['date-fns'],
                        'query-vendor': ['@tanstack/react-query'],
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