import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
    css: {
        postcss: {
            plugins: [
                tailwindcss,
                autoprefixer,
            ],
        },
    },
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            devOptions: {
                enabled: true
            },
            includeAssets: ['**/*'],
            manifest: {
                name: 'Sakina - Quran Audio App',
                short_name: 'Sakina',
                description: 'A modern, elegant PWA for listening to the Noble Quran',
                start_url: '/',
                display: 'standalone',
                orientation: 'portrait',
                background_color: '#FAF6EF',
                theme_color: '#FAF6EF',
                lang: 'ar',
                dir: 'rtl',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any maskable'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ],
                categories: ['education', 'lifestyle', 'books', 'audio']
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
                navigateFallbackDenylist: [/^\/oauth2-proxy/, /^\/api-proxy/],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'gstatic-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        urlPattern: /^\/(oauth2-proxy|api-proxy)/,
                        handler: 'NetworkOnly'
                    },
                    {
                        urlPattern: /^https:\/\/api\.alquran\.cloud\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'alquran-api-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 60 * 24 // 24 hours
                            }
                        }
                    }
                ]
            }
        })
    ],
    build: {
        outDir: 'dist',
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor': ['react', 'react-dom', 'lucide-react']
                }
            }
        }
    },
    server: {
        proxy: {
            '/oauth2-proxy': {
                target: 'https://oauth2.quran.foundation',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/oauth2-proxy/, ''),
                secure: false,
            },
            '/prelive-oauth2-proxy': {
                target: 'https://prelive-oauth2.quran.foundation',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/prelive-oauth2-proxy/, ''),
                secure: false,
            },
            '/api-proxy': {
                target: 'https://apis.quran.foundation',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api-proxy/, ''),
                secure: false,
            }
        }
    }
});
