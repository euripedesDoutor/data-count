"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const statsController_1 = require("../controllers/statsController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', statsController_1.getStats);
router.get('/evolution', statsController_1.getGoalEvolution);
router.get('/dashboard-surveys', statsController_1.getDashboardSurveys);
exports.default = router;
//# sourceMappingURL=statsRoutes.js.map