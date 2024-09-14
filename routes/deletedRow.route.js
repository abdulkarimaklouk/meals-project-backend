const express = require("express");

const router = express.Router();

const deletedController = require("../Controllers/deletedRow.controller");





router.route('/')
    .get(deletedController.getAllDeletedRows)

router.route('/:id')
    .get(deletedController.getDeletedRowById)
    .patch(deletedController.rowRestory)

router.route('/relationships/:ids')
    .get(deletedController.getDeletedRowByCompositeKey)
    .patch(deletedController.rowRestoryByCompositeKey)


module.exports = router;






