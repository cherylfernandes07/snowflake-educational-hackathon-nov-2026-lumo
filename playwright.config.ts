import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'./tests/browser',use:{baseURL:process.env.CLUMSY_TEST_URL || 'http://127.0.0.1:3000',launchOptions:{executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']}},workers:1,reporter:'list'});
