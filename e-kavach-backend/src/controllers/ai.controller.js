const aiService = require('../services/ai.service');

class AIController {
  async chat(req, res, next) {
    try {
      const patientProfileId = req.user?.patientProfile?.id || 'patient-rajesh';
      const { prompt, history } = req.body;

      if (!prompt) {
        return res.status(400).json({ success: false, error: 'Prompt is required' });
      }

      const reply = await aiService.chatWithClinicalAI({
        patientProfileId,
        prompt,
        history: history || [],
      });

      res.json({
        success: true,
        reply,
      });
    } catch (err) {
      next(err);
    }
  }

  async analyzeDocument(req, res, next) {
    try {
      const patientProfileId = req.user?.patientProfile?.id || 'patient-rajesh';
      const { recordId, title, recordType, notes, fileUrl } = req.body;

      const analysis = await aiService.analyzePrescriptionOrDocument({
        patientProfileId,
        recordId,
        title,
        recordType,
        notes,
        fileUrl,
      });

      res.json({
        success: true,
        analysis,
      });
    } catch (err) {
      next(err);
    }
  }

  async clinicalSummary(req, res, next) {
    try {
      const patientProfileId = req.body.patientProfileId || req.user?.patientProfile?.id || 'patient-rajesh';
      const { history, dischargeNotes, vitals, condition } = req.body;

      const result = await aiService.generateClinicalSummary({
        patientProfileId,
        history,
        dischargeNotes,
        vitals,
        condition,
      });

      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async handleIvrWebhook(req, res, next) {
    try {
      const ivrService = require('../services/ivr.service');
      // Support nested payload formats from VAPI (message.toolCalls / function parameters) or direct JSON
      let payload = req.body || {};

      // If VAPI webhook wrapper is used
      if (payload.message && payload.message.toolCalls && payload.message.toolCalls.length > 0) {
        const toolCall = payload.message.toolCalls[0];
        const fnArgs = typeof toolCall.function?.arguments === 'string'
          ? JSON.parse(toolCall.function.arguments)
          : (toolCall.function?.arguments || {});
        payload = { ...payload, ...fnArgs };
      } else if (payload.toolCall && payload.toolCall.arguments) {
        const fnArgs = typeof payload.toolCall.arguments === 'string'
          ? JSON.parse(payload.toolCall.arguments)
          : payload.toolCall.arguments;
        payload = { ...payload, ...fnArgs };
      }

      const dispatchResult = await ivrService.processIvrEmergencyCall(payload);
      res.status(200).json(dispatchResult);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AIController();
