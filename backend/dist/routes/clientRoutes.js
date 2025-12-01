"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const clientController_1 = require("../controllers/clientController");
const router = (0, express_1.Router)();
// Only ADMIN can manage clients
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)(['ADMIN']));
router.post('/', clientController_1.createClient);
router.get('/', clientController_1.getClients);
router.put('/:id', clientController_1.updateClient);
router.delete('/:id', clientController_1.deleteClient);
exports.default = router;
//# sourceMappingURL=clientRoutes.js.map