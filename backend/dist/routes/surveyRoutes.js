"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const surveyController_1 = require("../controllers/surveyController");
const reportController_1 = require("../controllers/reportController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticate, (0, auth_1.authorize)(['ADMIN', 'SUPERVISOR', 'CLIENT']), surveyController_1.createSurvey);
router.get('/', auth_1.authenticate, surveyController_1.getSurveys);
router.get('/:id/report', auth_1.authenticate, reportController_1.getSurveyReport);
router.get('/:id/heatmap', auth_1.authenticate, reportController_1.getSurveyHeatmap);
router.get('/:id', auth_1.authenticate, surveyController_1.getSurveyById);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)(['ADMIN', 'SUPERVISOR', 'CLIENT']), surveyController_1.updateSurvey);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)(['ADMIN', 'CLIENT']), surveyController_1.deleteSurvey);
exports.default = router;
//# sourceMappingURL=surveyRoutes.js.map