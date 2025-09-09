import { ethers } from "ethers"
import { Connection, PublicKey } from "@solana/web3.js"
import { getIO } from "@helpers/socket-io.helper"
import axios from "axios"

// -----------------------------
// CONFIG
// -----------------------------
const PROVIDERS: Record<string, string> = {
  // ✅ Alchemy (EVM chains)
  ethereum: process.env.ETHEREUM_RPC ?? "https://eth-mainnet.g.alchemy.com/v2/2PKRKABczj5Uf-3_Pb50u4Wndqc22YU_",
  optimism: process.env.OPTIMISM_RPC ?? "https://opt-mainnet.g.alchemy.com/v2/2PKRKABczj5Uf-3_Pb50u4Wndqc22YU_",
  polygon: process.env.POLYGON_RPC ?? "https://polygon-mainnet.g.alchemy.com/v2/2PKRKABczj5Uf-3_Pb50u4Wndqc22YU_",
  arbitrum: process.env.ARBITRUM_RPC ?? "https://arb-mainnet.g.alchemy.com/v2/2PKRKABczj5Uf-3_Pb50u4Wndqc22YU_",
  polygonzkevm: process.env.POLYGONZKEVM_RPC ?? "https://polygonzkevm-mainnet.g.alchemy.com/v2/2PKRKABczj5Uf-3_Pb50u4Wndqc22YU_",
  base: process.env.BASE_RPC ?? "https://base-mainnet.g.alchemy.com/v2/2PKRKABczj5Uf-3_Pb50u4Wndqc22YU_",
  avalanche: process.env.AVALANCHE_RPC ?? "https://avax-mainnet.g.alchemy.com/v2/2PKRKABczj5Uf-3_Pb50u4Wndqc22YU_",

  // ✅ Solana
  solana: process.env.SOLANA_RPC ?? "https://solana-mainnet.g.alchemy.com/v2/2PKRKABczj5Uf-3_Pb50u4Wndqc22YU_",

  // ✅ Bitcoin (⚠️ Alchemy doesn’t support Bitcoin — this URL won’t work.
  // You need QuickNode, Blockstream, or your own `bitcoind` node)
  bitcoin: process.env.BITCOIN_RPC ?? "http://127.0.0.1:8332", 

  // ❌ Tron is handled separately, not via PROVIDERS
}


const ERC20_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
]

// -----------------------------
// LISTENER FOR TRON (polling Tronscan API)
// -----------------------------
async function listenTronPayments(toAddress: string, orderId?: string) {
  let lastTimestamp = 0

  const fetchTxs = async () => {
    try {
      const url = `https://apilist.tronscanapi.com/api/transfer/trx?address=${toAddress}&start=0&limit=20&direction=0&reverse=true&fee=true&db_version=1&start_timestamp=${lastTimestamp}&end_timestamp=`
      const res = await axios.get(url)

      if (!res.data?.data) return

      for (const tx of res.data.data) {
        if (tx.to_address?.toLowerCase() === toAddress.toLowerCase()) {
          const amount = (tx.amount / 1e6).toString()
          const txHash = tx.transactionHash

          await savePayment({
            orderId,
            txHash,
            from: tx.ownerAddress,
            to: tx.to_address,
            amount,
            chain: "tron",
            type: "native",
          })

          lastTimestamp = Math.max(lastTimestamp, tx.timestamp)
        }
      }
    } catch (err: any) {
      console.error("[tron] Error fetching transfers:", err.message)
    }
  }

  setInterval(fetchTxs, 10_000)
  fetchTxs()
}

// -----------------------------
// SOLANA LISTENER
// -----------------------------
async function listenSolanaPayments(toAddress: string, orderId?: string) {
  try {
    const connection = new Connection(PROVIDERS.solana, "confirmed")
    const pubkey = new PublicKey(toAddress)

    connection.onLogs(pubkey, async (log) => {
      const sig = log.signature
      const tx = await connection.getTransaction(sig, { commitment: "confirmed" })
      if (!tx) return

      const accountIndex = tx.transaction.message.accountKeys.findIndex(
        (acc) => acc.toBase58() === toAddress
      )
      if (accountIndex === -1) return

      const pre = tx.meta?.preBalances?.[accountIndex] || 0
      const post = tx.meta?.postBalances?.[accountIndex] || 0
      const diffLamports = post - pre

      if (diffLamports > 0) {
        const amount = (diffLamports / 1e9).toString()

        await savePayment({
          orderId,
          txHash: sig,
          from: tx.transaction.message.accountKeys[0].toBase58(),
          to: toAddress,
          amount,
          chain: "solana",
          type: "native",
        })
      }
    })
  } catch (err) {
    console.error("[solana] Listener error:", err)
  }
}

// -----------------------------
// BITCOIN LISTENER (requires bitcoind or provider)
// -----------------------------
async function listenBitcoinPayments(toAddress: string, orderId?: string) {
  let lastBlock = 0

  const fetchTxs = async () => {
    try {
      const res = await axios.post(PROVIDERS.bitcoin, {
        id: 1,
        jsonrpc: "2.0",
        method: "getblockcount",
        params: [],
      })

      const currentBlock = res.data?.result || 0
      if (currentBlock <= lastBlock) return
      lastBlock = currentBlock

      const hashRes = await axios.post(PROVIDERS.bitcoin, {
        id: 1,
        jsonrpc: "2.0",
        method: "getblockhash",
        params: [currentBlock],
      })
      const blockHash = hashRes.data?.result

      const blockRes = await axios.post(PROVIDERS.bitcoin, {
        id: 1,
        jsonrpc: "2.0",
        method: "getblock",
        params: [blockHash, 2],
      })

      for (const tx of blockRes.data?.result?.tx || []) {
        for (const vout of tx.vout) {
          if (vout.scriptPubKey?.addresses?.includes(toAddress)) {
            const amount = vout.value.toString()
            await savePayment({
              orderId,
              txHash: tx.txid,
              from: "unknown",
              to: toAddress,
              amount,
              chain: "bitcoin",
              type: "native",
            })
          }
        }
      }
    } catch (err: any) {
      console.error("[bitcoin] Error fetching block:", err.message)
    }
  }

  setInterval(fetchTxs, 60_000)
  fetchTxs()
}

// -----------------------------
// getBlockWithTxs (EVM)
// -----------------------------
async function getBlockWithTxs(
  provider: ethers.JsonRpcProvider,
  blockNumber: number
) {
  const block = await provider.getBlock(blockNumber, true)
  return block as ethers.Block & { transactions: ethers.TransactionResponse[] }
}

// -----------------------------
// SAVE PAYMENT
// -----------------------------
async function savePayment({ orderId, txHash, from, to, amount, chain, type }) {
  try {
    const exists = await App.Models.WalletPaymentModel.findOne({ txHash })
    if (exists) return

    if (orderId) {
      await App.Models.QRPaymentModel.findByIdAndUpdate(orderId, {
        txHash,
        from,
        to,
        amount,
        blockchain: chain,
      })
    }

    await App.Models.WalletPaymentModel.create({
      orderId,
      txHash,
      from,
      to,
      amount,
      blockchain: chain,
      type,
      status: "confirmed",
    })

    const io = getIO()
    io.to(to.toLowerCase()).emit("paymentConfirmed", {
      orderId,
      txHash,
      from,
      to,
      amount,
      chain,
      type,
    })
  } catch (err) {
    console.error("❌ Error saving payment:", err)
  }
}

// -----------------------------
// LISTENER FOR EVM CHAINS
// -----------------------------
// -----------------------------
// LISTENER FOR EVM CHAINS
// -----------------------------
async function listenEvmPayments(
  chain: string,
  toAddress: string,
  orderId?: string,
  contract?: string
) {
  const rpcUrl = PROVIDERS[chain]
  console.log(`🔗 [${chain}] Initializing provider: ${rpcUrl}`)

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl)

    // Force a network check to catch invalid RPC URLs early
    provider.getNetwork()
      .then((network) => {
        console.log(`✅ [${chain}] Connected to chainId ${network.chainId} at ${rpcUrl}`)
      })
      .catch((err) => {
        console.error(`❌ [${chain}] Failed to detect network for ${rpcUrl}:`, err.message)
      })

    if (contract) {
      console.log(`📡 [${chain}] Listening for ERC20 transfers on ${contract}`)
      const token = new ethers.Contract(contract, ERC20_ABI, provider)
      token.on("Transfer", async (from, to, value, event) => {
        if (to.toLowerCase() === toAddress.toLowerCase()) {
          const amount = ethers.formatUnits(value, 18)
          console.log(`💰 [${chain}] Token payment detected: ${amount} → ${to}`)
          await savePayment({
            orderId,
            txHash: event.transactionHash,
            from,
            to,
            amount,
            chain,
            type: "token",
          })
        }
      })
    } else {
      console.log(`📡 [${chain}] Listening for native transfers to ${toAddress}`)
      provider.on("block", async (blockNumber) => {
        console.log(`🔎 [${chain}] Checking block ${blockNumber}`)
        const block = await getBlockWithTxs(provider, blockNumber)
        if (!block?.transactions) return

        for (const tx of block.transactions) {
          if (tx.to && tx.to.toLowerCase() === toAddress.toLowerCase()) {
            const amount = ethers.formatEther(tx.value)
            console.log(`💰 [${chain}] Native payment detected: ${amount} ETH → ${toAddress}`)
            await savePayment({
              orderId,
              txHash: tx.hash,
              from: tx.from,
              to: tx.to,
              amount,
              chain,
              type: "native",
            })
          }
        }
      })
    }
  } catch (err: any) {
    console.error(`❌ [${chain}] Listener error with RPC ${rpcUrl}:`, err.message)
  }
}

// -----------------------------
// START LISTENERS
// -----------------------------
async function startListeners() {
  console.log("🚀 Starting listeners...")
  const pendingPayments = await App.Models.QRPaymentModel.find({ status: "pending" })

  for (const payment of pendingPayments) {
    const { blockchain, toAddress, contract, _id } = payment

    if (["ethereum", "optimism", "polygon", "arbitrum", "polygonzkevm", "base", "avalanche"].includes(blockchain)) {
      listenEvmPayments(blockchain, toAddress, _id.toString(), contract)
    }
    if (blockchain === "tron") listenTronPayments(toAddress, _id.toString())
    if (blockchain === "solana") listenSolanaPayments(toAddress, _id.toString())
    if (blockchain === "bitcoin") listenBitcoinPayments(toAddress, _id.toString())
  }
}

// -----------------------------
// SOCKET
// -----------------------------
function initSocketHandlers() {
  const io = getIO()

  io.on("connection", (socket) => {
    const { type, limit = "10", offset = "0", wallet } = socket.handshake.query

    if (type === "list" && wallet) {
      const l = parseInt(limit as string, 10) || 10
      const o = parseInt(offset as string, 10) || 0

      App.Models.WalletPaymentModel.find({ to: (wallet as string).toLowerCase() })
        .sort({ createdAt: -1 })
        .skip(o)
        .limit(l)
        .lean()
        .then((txs) => socket.emit("txList", { wallet, txs }))
    }

    if (wallet) socket.join((wallet as string).toLowerCase())
  })
}

export { startListeners, initSocketHandlers }
