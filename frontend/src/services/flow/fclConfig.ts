import * as fcl from '@onflow/fcl'

// Configure FCL for Flow testnet by default
export const configureFCL = () => {
  const walletDiscoveryUrl = process.env.NEXT_PUBLIC_FLOW_WALLET_DISCOVERY || 'https://fcl-discovery.onflow.org/testnet/authn'
  const accessNode = process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE || 'https://rest-testnet.onflow.org'
  const appTitle = process.env.NEXT_PUBLIC_APP_NAME || 'Way Bigger'
  const appIcon = process.env.NEXT_PUBLIC_APP_ICON || '/images/logo.svg'

  fcl.config()
    .put('app.detail.title', appTitle)
    .put('app.detail.icon', appIcon)
    .put('flow.network', 'testnet')
    .put('accessNode.api', accessNode)
    .put('discovery.wallet', walletDiscoveryUrl)
}

export default fcl


