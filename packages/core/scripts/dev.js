const { spawn } = require('node:child_process')

const hardhatNodeTask = spawn('pnpm', ['run', 'node'], { stdio: 'inherit' })

hardhatNodeTask.on('error', (err) => {
  console.error(`Failed to start server: ${err}`)
})

setTimeout(() => {
  const deployTask = spawn('pnpm', ['run', 'deploy'], { stdio: 'inherit' })
  deployTask.on('error', (err) => {
    console.error(`Failed to deploy contract: ${err}`)
  })

  deployTask.on('close', (code) => {
    console.log(`Contract deployment executed with exit code ${code}`)
  })
}, 3000)
