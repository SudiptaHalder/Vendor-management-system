// Add this right after the router definition
router.post('/test', authMiddleware, (req, res) => {
  console.log('Test endpoint hit');
  console.log('Body:', req.body);
  res.json({ received: req.body });
});
