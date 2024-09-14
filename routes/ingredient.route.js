const express = require("express");

const router = express.Router();

const ingredientController = require("../Controllers/ingredient.controller");

const { validationSChema } = require("../middleware/validation");





router.route('/')
    .get(ingredientController.getAllIngredients)
    .post(validationSChema(["ingredient_name", "cost"]), ingredientController.createIngredient)

router.route('/:ingredientId')
    .get(ingredientController.getIngredientById)
    .patch(ingredientController.updateIngredient)
    .delete(ingredientController.deleteIngredient)



module.exports = router;