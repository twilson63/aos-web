import { connect, createDataItemSigner } from '@permaweb/aoconnect'

const MODULE = "1PdCJiXhNafpJbvC-sjxWTeNzbf9Q_RfUNs84GYoPm0"
const SCHEDULER = "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA"

export async function register(name) {
  if (!globalThis.arweaveWallet) {
    throw new Error('ArConnect is Required!')
  }

  const aos = connect()
  const pid = await aos.spawn({
    module: MODULE,
    scheduler: SCHEDULER,
    signer: createDataItemSigner(globalThis.Wallet || globalThis.arweaveWallet),
    tags: [
      { name: 'Name', value: name },
      { name: 'Version', value: 'web-0.0.1' }
    ],
    data: '1984'
  })
  await new Promise((resolve) => setTimeout(resolve, 3000))
  return pid
}
