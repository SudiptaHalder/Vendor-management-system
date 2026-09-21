import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { getScheduleAgreementAmendments } from '../services/sap/schedulingAgreementService';

const router = Router();

// Price amendments only happen on scheduling agreements (open POs) - see
// schedulingAgreementService.getScheduleAgreementAmendments for why.
router.get('/', authMiddleware, async (req, res) => {
  try {
    const amendments = await getScheduleAgreementAmendments();
    res.json({
      success: true,
      data: amendments,
      count: amendments.length
    });
  } catch (error: any) {
    console.error('Error fetching scheduling agreement amendments:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch amendments'
    });
  }
});

export default router;
