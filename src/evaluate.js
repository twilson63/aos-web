import { connect, createDataItemSigner } from '@permaweb/aoconnect'

export async function evaluate(pid, data) {
  // connect wallet 
  await globalThis.arweaveWallet.connect([
    'SIGN_TRANSACTION'
  ])
  const messageId = await connect().message({
    process: pid,
    signer: createDataItemSigner(globalThis.arweaveWallet),
    tags: [{ name: 'Action', value: 'Eval' }],
    data
  })
  const result = await connect().result({
    message: messageId,
    process: pid
  })
  // console.log(result)
  return result.Output.data.output
}