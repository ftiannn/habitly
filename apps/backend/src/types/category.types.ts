import { HabitColor } from "@/config/category.config";
import { Category, SubCategory } from "@prisma/client";

export interface CategoryWithSubcategories {
    id: Category;
    label: string;
    color: HabitColor;
    subcategories: SubcategoryOption[];
  }
  
  export interface SubcategoryOption {
    label: string;
    icon: string;
    value: SubCategory;
  }
  