import { logger } from "../utils/logger"
import { getRpcProvider } from "../utils/provider"
import { prisma } from "../utils/db"
import { parseLogs } from "../indexer/parser"

async function monitorTransactions() {
  const pendingTxs = await prisma.transaction.findMany({
    where: {
      status: "Pending",
    },
  })

  logger.info(`⏳ Monitoring ${pendingTxs.length} pending transactions...`)

  // improve this to batch instead
  for (const tx of pendingTxs) {
    const provider = getRpcProvider(Number(tx.chainId))

    try {
      const receipt = await provider.getTransactionReceipt(tx.hash)

      if (!receipt) {
        logger.warn(`⛔ Tx not found: ${tx.hash}`)
      
        const newRetryCount = tx.retryCount + 1
        const newStatus = newRetryCount >= 10 ? "Failed" : "Pending"
      
        await prisma.transaction.update({
          where: { hash: tx.hash },
          data: {
            retryCount: newRetryCount,
            status: newStatus,
          },
        })
      
        logger.info(
          `🔁 Tx ${tx.hash} marked ${newStatus}, retryCount = ${newRetryCount}`
        )
        continue
      }

      const status = receipt.status === 1 ? "Success" : "Failed"

      const logs = receipt.logs
      for (const log of logs) {
        console.log(log)
        const parsed = await parseLogs(log)
        console.log(parsed)
      }

      await prisma.transaction.update({
        where: { hash: tx.hash },
        data: { status },
      })

      logger.info(`✅ Tx ${tx.hash} updated to ${status}`)
    } catch (error) {
      logger.error(`Failed to fetch receipt for ${tx.hash}`, error)
      await prisma.transaction.update({
        where: { hash: tx.hash },
        data: { status: "FAILED" },
      })
    }
  }
}
setInterval(monitorTransactions, 60 * 1000) // every 1 minute
