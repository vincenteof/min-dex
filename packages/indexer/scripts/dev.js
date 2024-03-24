const { spawn } = require('node:child_process')

async function checkHardhatLiveness() {
  try {
    const response = await fetch('http://localhost:8545', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1,
      }),
    })

    const data = await response.json()
    const isLive = response.ok && data.result !== undefined
    console.log(`Hardhat node is ${isLive ? 'live' : 'not live'}.`)
    return isLive
  } catch (error) {
    console.error('Failed to connect to the Hardhat node:', error)
    return false
  }
}

function delay() {
  return new Promise((resolve) => {
    setTimeout(resolve, 3000)
  })
}

async function utilHardhatStarted(times = 0) {
  const isLive = await checkHardhatLiveness()
  if (isLive) {
    return
  }

  if (times === 3) {
    throw new Error('Failed to connect to Hardhat node after 3 attempts')
  }

  console.log('Wait 3000ms for the next check...')
  await delay()
  return utilHardhatStarted(times + 1)
}

async function main() {
  try {
    await utilHardhatStarted()
    spawn('pnpm', ['run', 'exec'], { stdio: 'inherit' })
  } catch (error) {
    console.error(error.message)
  }
}

main()
