const express = require('express')
const {createAlert,deleteAlert,fetchAlerts} = require('../controllers/alert')
const router = express.Router()

router.get('/all',fetchAlerts)
router.post('/create',createAlert)
router.delete('/delete/:id',deleteAlert)

module.exports = router 