import { categoryConfig } from '@/config/category.config';
import { CategoryWithSubcategories, SubcategoryOption } from '@/types/category.types';
import { Category, SubCategory } from '@prisma/client';

export class categoryService {
  static getAllCategories(): CategoryWithSubcategories[] {
    return Object.entries(categoryConfig).map(([key, config]) => ({
      id: key as Category,
      label: config.label,
      color: config.color,
      subcategories: config.subcategories
    }));
  }

  static getCategoryByKey(categoryKey: Category): CategoryWithSubcategories | null {
    const config = categoryConfig[categoryKey];
    if (!config) return null;

    return {
      id: categoryKey,
      label: config.label,
      color: config.color,
      subcategories: config.subcategories
    };
  }

  static getSubcategoryInfo(subcategoryKey: SubCategory): SubcategoryOption | null {
    for (const category of Object.values(categoryConfig)) {
      const subcategory = category.subcategories.find(sub => sub.value === subcategoryKey);
      if (subcategory) return subcategory;
    }
    return null;
  }
}
