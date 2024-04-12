import { connect, createDataItemSigner } from '@permaweb/aoconnect'
import { prompt } from './store.js'

export async function evaluate(pid, data) {
  // connect wallet 
  // await globalThis.arweaveWallet.connect([
  //   'SIGN_TRANSACTION'
  // ])
  const messageId = await connect().message({
    process: pid,
    signer: createDataItemSigner(globalThis.Wallet || globalThis.arweaveWallet),
    tags: [{ name: 'Action', value: 'Eval' }],
    data
  })
  const result = await connect().result({
    message: messageId,
    process: pid
  })
  //console.log(result)
  if (result.Error) {
    throw new Error(JSON.stringify(result.Error))
  }

  if (result.Output?.data?.prompt) {
    prompt.set(result.Output?.data?.prompt)
  }
  if (result.Output?.data?.output) {
    return result.Output?.data?.output
  }

  return undefined

}