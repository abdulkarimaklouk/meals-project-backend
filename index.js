require("dotenv").config();

const express = require('express');

const app = express();

const { ERROR } = require("./utils/httpStatusText");

const sequelizeConnection = require('./config/sequelizeConnection');

const cors = require("cors");

app.use(cors({ origin: "http://127.0.0.1:5500" }));


app.use(express.json());


const mealRouter = require("./routes/meal.route");
const deletedRowRouter = require("./routes/deletedRow.route");
const orderRouter = require("./routes/order.route");
const storeRouter = require("./routes/store.route");
const inventoryRouter = require("./routes/inventory.route");
const ingredientRouter = require("./routes/ingredient.route");
const MealIngredientRouter = require("./routes/mealIngredients.route");
const sales = require("./routes/sale.route");


app.use('/api/deletedRows', deletedRowRouter);
app.use('/api/meals', mealRouter);
app.use('/api/orders', orderRouter);
app.use('/api/stores', storeRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/ingredients', ingredientRouter);
app.use('/api/mealIngredients', MealIngredientRouter);
app.use('/api/sales', sales);


app.all('*', (req, res, next) => {
    return res.status(404).json({ status: ERROR, message: "this resource is not available" });
})

app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({ status: err.statusText || ERROR, data: null, message: err.message, code: err.statusCode || 500 })
})



app.listen(process.env.port, () => {
    console.log(`Server is running on port ${process.env.port}`);
});
