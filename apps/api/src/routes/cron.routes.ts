import { Router } from 'express'
import { syncAll } from '../services/sap/syncAll'

const router = Router()

// Triggered by Vercel Cron (see vercel.json). Vercel serverless functions
// can't keep a setInterval alive between invocations, so this replaces the
// old in-process background sync loop.
router.get('/sap-sync', async (req, res) => {
  const expected = process.env.CRON_SECRET
  if (expected && req.headers.authorization !== `Bearer ${expected}`) {
    return res.status(401).json({ success: false, error: 'Unauthorized' })
  }

  if (process.env.SAP_ENABLED !== 'true') {
    return res.json({ success: true, skipped: true, reason: 'SAP_ENABLED is not true' })
  }

  try {
    console.log('⏰ Cron-triggered SAP sync starting...')
    const result = await syncAll()
    res.json({ success: true, data: result })
  } catch (error: any) {
    console.error('Cron SAP sync failed:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
