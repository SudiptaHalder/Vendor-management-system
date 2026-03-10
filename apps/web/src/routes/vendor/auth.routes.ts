
// Get vendor profile (protected)
router.get('/me', async (req, res) => {
  try {
    const vendorId = (req as any).user?.vendorId
    
    if (!vendorId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Not authenticated' 
      })
    }

    const vendor = await prisma.vendors.findUnique({
      where: { id: vendorId },
      select: {
        id: true,
        supplierCode: true,
        supplierName: true,
        email: true,
        plantCode: true,
        status: true,
        createdAt: true
      }
    })

    if (!vendor) {
      return res.status(404).json({ 
        success: false, 
        error: 'Vendor not found' 
      })
    }

    res.json({
      success: true,
      data: vendor
    })

  } catch (error) {
    console.error('Error fetching vendor profile:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch profile' 
    })
  }
})
