module.exports = {
  scripts: {
    dev: 'next dev',
    build: 'next build',
    start: 'next start',
    lint: 'next lint',
    precommit: 'nps care',
    care: 'nps build lint',
    dry: 'twly --boring --lines 3',
    grep: {
      // assumes usage of ripgrep
      logs: 'rg "console.log" | node scripts/flume.js',
    },
  },
}
