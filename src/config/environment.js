// 环境配置
const getEnvironment = () => {
  if (typeof window === 'undefined') {
    return 'local';
  }
  const hostname = window.location.hostname;
  
  if (hostname.includes('github.io')) {
    return 'github-pages';
  } else if (hostname.includes('cloudflare') || hostname.includes('yourdomain.com')) {
    return 'cloudflare';
  } else {
    return 'local';
  }
};

const config = {
  'github-pages': {
    apiBaseUrl: 'https://your-test-api.vercel.app',
    qwenApiUrl: 'https://your-test-qwen-api.vercel.app',
    environment: 'test'
  },
  'cloudflare': {
    apiBaseUrl: 'https://your-production-api.com',
    qwenApiUrl: 'https://your-production-qwen-api.com',
    environment: 'production'
  },
  'local': {
    apiBaseUrl: 'http://localhost:3001',
    qwenApiUrl: 'http://localhost:8002',
    ttsApiUrl: 'http://localhost:3002',
    manimApiUrl: 'http://localhost:3000',
    environment: 'development'
  }
};

export const getConfig = () => {
  const env = getEnvironment();
  return config[env] || config.local;
};

export const isProduction = () => getEnvironment() === 'cloudflare';
export const isTest = () => getEnvironment() === 'github-pages';
export const isDevelopment = () => getEnvironment() === 'local'; 