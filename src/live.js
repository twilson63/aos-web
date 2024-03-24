import { connect } from '@permaweb/aoconnect'

let cursor = ""
export async function live(pid) {
  let results = await connect().results({
    process: pid,
    sort: "DESC",
    cursor,
    limit: 1
  });
  const xnode = results.edges.filter(
    x => x.node.Output.print === true
  )[0]
  if (xnode) {
    cursor = xnode.cursor
    //console.log(xnode.node.Output.data)
    return xnode.node.Output.data
  }
  return null
}