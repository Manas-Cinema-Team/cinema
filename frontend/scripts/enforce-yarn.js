const userAgent = process.env.npm_config_user_agent || ''

if (!userAgent.startsWith('yarn/')) {
  console.error('')
  console.error('This project only supports Yarn for frontend dependencies.')
  console.error('Use "yarn install" instead of npm, pnpm, or another package manager.')
  console.error('')
  process.exit(1)
}
