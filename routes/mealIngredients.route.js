const express = require("express");

const router = express.Router();

const mealIngredientsController = require("../Controllers/mealIngredients.controller");

const { validationSChema } = require("../middleware/validation");





router.route('/')
    .get(mealIngredientsController.getAllMealIngredients)
    .post(validationSChema(["meal_id", "ingredient_id", "quantity"]), mealIngredientsController.createMealIngredient)

router.route('/:ids')
    .get(mealIngredientsController.getMealIngredientsByMealIdAndIngredientId)
    .patch(mealIngredientsController.updateMealIngredient)
    .delete(mealIngredientsController.deleteMealIngredient)

router.route('/meal/:meal_id')
    .get(mealIngredientsController.getMealIngredientsByMealId)

router.route('/ingredient/:ingredient_id')
    .get(mealIngredientsController.getMealIngredientsByIngredientId)


module.exports = router;