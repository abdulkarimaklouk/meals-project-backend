# meals-project-backend


## Project Overview

meals project is a project for managing restaurant meal information. The system stores details about meals, their ingredients, costs, and orders, helping restaurants track and manage their inventory and sales effectively.

Features

### Meal Management
- **Meals Table**: Stores meal names, selling prices, and their ingredients.
- **Ingredients**: Details the components required for each meal (e.g., "2 lettuce leaves, 3 kg beef"), and allows for the reuse of ingredients in different meals.

### Inventory Management
- **Raw Materials Table**: Contains information on each ingredient, including cost and stock levels.
- **Stock Table**: Displays the available quantities of raw materials and supply details.

### Order Management
- **Orders Table**: Records details of each order, including meal type, quantity, and total selling price.

### Cost and Profit Calculation
- **Meal Cost Calculation**: Computes the cost of preparing each meal based on ingredient costs.
- **Profit Calculation**: Calculates profit by comparing the meal cost with its selling price.

## Technologies Used
- **Database**: MySQL
- **Programming Language**: Node.js with Express
