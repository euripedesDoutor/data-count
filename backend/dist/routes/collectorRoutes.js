"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const collectorController_1 = require("../controllers/collectorController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.post('/', (0, auth_1.authorize)(['ADMIN', 'CLIENT']), collectorController_1.createCollector);
router.get('/', (0, auth_1.authorize)(['ADMIN', 'CLIENT']), collectorController_1.getCollectors);
router.put('/:id', (0, auth_1.authorize)(['ADMIN', 'CLIENT']), collectorController_1.updateCollector);
router.delete('/:id', (0, auth_1.authorize)(['ADMIN', 'CLIENT']), collectorController_1.deleteCollector);
exports.default = router;
//# sourceMappingURL=collectorRoutes.js.map