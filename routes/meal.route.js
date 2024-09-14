const express = require("express");

const router = express.Router();

const mealController = require("../Controllers/meal.controller");

const { validationSChema } = require("../middleware/validation");





router.route('/')
    .get(mealController.getAllMeals)
    .post(validationSChema(["meal_name", "meal_price"]), mealController.createMeal)

router.route('/:mealId')
    .get(mealController.getMealById)
    .patch(mealController.updateMeal)
    .delete(mealController.deleteMeal)




module.exports = router;






