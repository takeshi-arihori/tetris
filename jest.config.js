const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  
  // テストパターン
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/?(*.)+(spec|test).{js,jsx,ts,tsx}'
  ],
  
  // カバレッジ設定
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/app/**/layout.tsx',
    '!src/app/**/loading.tsx',
    '!src/app/**/not-found.tsx',
    '!src/app/**/error.tsx',
  ],
  
  // カバレッジ閾値
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  
  // モジュールマッピング
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Supabaseモック
  moduleNameMapping: {
    '^@/lib/supabase$': '<rootDir>/src/__mocks__/supabase.ts',
  },
  
  // 静的ファイルのモック
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/__mocks__/fileMock.js',
  },
  
  // テスト環境変数
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  
  // 変換対象外のモジュール
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|@supabase))',
  ],
  
  // セットアップファイル
  setupFiles: ['<rootDir>/jest.env.js'],
  
  // タイムアウト設定
  testTimeout: 10000,
  
  // テスト実行の詳細出力
  verbose: true,
  
  // 並列実行数
  maxWorkers: '50%',
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)