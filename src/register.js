import { connect, createDataItemSigner } from '@permaweb/aoconnect'

const MODULE = "SBNb1qPQ1TDwpD_mboxm2YllmMLXpWw4U8P9Ff8W9vk"
const SCHEDULER = "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA"

export async function register(name) {
  if (!globalThis.arweaveWallet) {
    throw new Error('ArConnect is Required!')
  }
  if (Number(globalThis.arweaveWallet.walletVersion.split('.')[0]) >= 1
    && Number(globalThis.arweaveWallet.walletVersion.split('.')[1]) > 5
  ) {
    // connect wallet 
    await globalThis.arweaveWallet.connect([
      'SIGN_TRANSACTION'
    ])
    const aos = connect()
    const pid = await aos.spawn({
      module: MODULE,
      scheduler: SCHEDULER,
      signer: createDataItemSigner(globalThis.arweaveWallet),
      tags: [
        { name: 'Name', value: name },
        { name: 'Version', value: 'web-0.0.1' }
      ],
      data: '1984'
    })
    return pid
  }
  throw new Error('ArConnect version 1.6 or greater is required!')

}
