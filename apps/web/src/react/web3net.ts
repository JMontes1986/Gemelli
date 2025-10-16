export async function ensurePolygonAmoy(): Promise<void> {
  const chainIdHex = '0x13882'; // 80002
  const params = {
    chainId: chainIdHex,
    chainName: 'Polygon Amoy',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://rpc-amoy.polygon.technology/'],
    blockExplorerUrls: ['https://amoy.polygonscan.com/']
  };
  // @ts-ignore
  const { ethereum } = window;
  if (!ethereum) throw new Error('No se detectó wallet (window.ethereum)');
  try {
    await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: chainIdHex }] });
  } catch (e) {
    const err:any = e;
    if (err.code === 4902) {
      await ethereum.request({ method: 'wallet_addEthereumChain', params: [params] });
    } else { throw err; }
  }
}
