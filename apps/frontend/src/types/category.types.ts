import { HabitCategory, HabitColor, HabitSubcategory } from "./habit.types";

export interface Subcategory {
    label: string;
    icon: string;
    value: HabitSubcategory;
  }
  
  export interface Category {
    id: HabitCategory;
    label: string;
    color: HabitColor;
    subcategories: Subcategory[];
  }
  
  export interface CategoriesResponse {
    categories: Category[];
    message: string;
  }
  