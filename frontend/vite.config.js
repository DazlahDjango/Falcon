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
            chunkSizeWarningLimit: 1500, // Increased from 1000
            rollupOptions: {
                output: {
                    manualChunks: (id) => {
                        // Node_modules chunks - FIXED circular dependency
                        if (id.includes('node_modules')) {
                            // React core
                            if (id.includes('react') && !id.includes('react-router') && !id.includes('react-dom')) {
                                return 'react-core';
                            }
                            if (id.includes('react-dom')) {
                                return 'react-dom';
                            }
                            if (id.includes('react-router')) {
                                return 'react-router';
                            }
                            // Redux
                            if (id.includes('redux') || id.includes('@reduxjs/toolkit')) {
                                return 'redux';
                            }
                            // Charts (large, separate)
                            if (id.includes('echarts') || id.includes('zrender')) {
                                return 'echarts';
                            }
                            // Everything else
                            return 'vendor';
                        }
                        
                        // Structure store - all in one chunk
                        if (id.includes('/store/slices/structure')) {
                            return 'structure-store';
                        }
                        
                        // Other store files
                        if (id.includes('/store/')) {
                            return 'store';
                        }
                        
                        // Pages - keep together to avoid circular deps
                        if (id.includes('/pages/')) {
                            return 'pages';
                        }
                        
                        // Components
                        if (id.includes('/components/')) {
                            return 'components';
                        }
                        
                        // Hooks
                        if (id.includes('/hooks/')) {
                            return 'hooks';
                        }
                        
                        // Services
                        if (id.includes('/services/')) {
                            return 'services';
                        }
                        
                        return 'main';
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