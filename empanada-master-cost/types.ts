
export type UnitType = 'kg' | 'lt' | 'unid';

export interface Ingredient {
  id: string;
  name: string;
  unitType: UnitType;
  buyPrice: number; // Cost per kg, lt, or package
  packageSize: number; // For 'unid', units per package. For 'kg'/'lt', it's usually 1.
  quantityUsed: number; // Quantity used in the batch
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  yield: number; // Total empanadas produced
  createdAt: number;
}

export interface CostBreakdown {
  totalBatchCost: number;
  costPerEmpanada: number;
  ingredientBreakdown: {
    name: string;
    totalCost: number;
    unitCost: number;
    unitQuantity: number;
    unitMeasure: string;
  }[];
}
