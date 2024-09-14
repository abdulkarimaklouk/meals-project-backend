const express = require("express");

const router = express.Router();

const storeController = require("../Controllers/store.controller");

const { validationSChema } = require("../middleware/validation");



router.route('/')
    .get(storeController.getAllStores)
    .post(validationSChema(["store_name", "store_address", "phone_number"]), storeController.createStore)

router.route('/:storeId')
    .get(storeController.getStoreById)
    .patch(storeController.updateStore)
    .delete(storeController.deleteStore)





module.exports = router;