import { BaseIngredient, EnhancedRecipe } from '../types';

/**
 * Recalculates the total cost and suggested price for a recipe
 * based on its ingredients' current prices and the profit margin.
 */
export function recalculateRecipeCost(
  recipe: EnhancedRecipe,
  ingredientsDB: Map<string, BaseIngredient>
): EnhancedRecipe {
  let totalCost = 0;

  for (const req of recipe.ingredients) {
    const ingredient = ingredientsDB.get(req.ingredientId);
    if (ingredient) {
      // Calculate unit cost based on package size and buy price
      const unitCost = ingredient.buyPrice / ingredient.packageSize;
      totalCost += unitCost * req.quantityUsed;
    }
  }

  // Cost per unit (empanada/item)
  const costPerUnit = recipe.yield > 0 ? totalCost / recipe.yield : 0;
  
  // Profit margin is a percentage markup (e.g., 150 for +150%)
  const suggestedPrice = costPerUnit * (1 + recipe.profitMargin / 100);

  return {
    ...recipe,
    totalCost,
    suggestedPrice,
    updatedAt: Date.now(),
  };
}
