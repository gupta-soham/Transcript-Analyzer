import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
    test: {
        environment: 'node',
        setupFiles: ['./test/setup.ts'],
        globals: true,
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './'),
            '@/lib': resolve(__dirname, './lib'),
            '@/components': resolve(__dirname, './components'),
        },
    },

});