const express = require('express');
const router = express.Router();
const {
    getAllMedicines,
    getMedicineById,
    createMedicine,
    updateMedicine,
    deleteMedicine,
    updateStock,
    getLowStock,
    getExpiringSoon,
    bulkDelete,
} = require('../controllers/medicineController');
const { protect } = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// Apply auth and adminOnly middleware to all routes
router.use(protect);
router.use(adminOnly);

// Medicine CRUD routes
router.get('/', getAllMedicines);
router.post('/', createMedicine);
router.get('/low-stock', getLowStock);
router.get('/expiring-soon', getExpiringSoon);
router.post('/bulk-delete', bulkDelete);
router.get('/:id', getMedicineById);
router.put('/:id', updateMedicine);
router.delete('/:id', deleteMedicine);
router.patch('/:id/stock', updateStock);

module.exports = router;
