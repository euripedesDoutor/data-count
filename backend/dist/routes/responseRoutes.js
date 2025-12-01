"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const responseController_1 = require("../controllers/responseController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticate, responseController_1.submitResponse);
router.get('/', auth_1.authenticate, (0, auth_1.authorize)(['ADMIN', 'SUPERVISOR']), responseController_1.getResponses);
exports.default = router;
//# sourceMappingURL=responseRoutes.js.map