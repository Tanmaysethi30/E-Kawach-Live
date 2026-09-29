const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { optionalAuth } = require('../middleware/auth');

// Support both authenticated or direct clinical calls
router.use(optionalAuth || ((req, res, next) => next()));

router.post('/clinical-summary', (req, res, next) => aiController.clinicalSummary(req, res, next));
router.post('/chat', (req, res, next) => aiController.chat(req, res, next));
router.post('/analyze-document', (req, res, next) => aiController.analyzeDocument(req, res, next));
router.post('/ivr-webhook', (req, res, next) => aiController.handleIvrWebhook(req, res, next));
router.post('/emergency-dispatch', (req, res, next) => aiController.handleIvrWebhook(req, res, next));

module.exports = router;
