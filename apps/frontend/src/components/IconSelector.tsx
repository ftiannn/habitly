import React, { useState, useMemo, useCallback } from 'react';
import { Category, Subcategory, HabitCategory, HabitColor, HabitSubcategory } from '@/types';
import { ChevronUp, ChevronDown, Search, X } from 'lucide-react';
import { useCategories } from '@/lib/hooks/use-categories';
import { Button, Input} from '@/components/ui';
export interface SelectedIcon {
    icon: string;
    label: string;
    category: string;
    categoryId: HabitCategory;
    categoryColor: HabitColor;
    value: HabitSubcategory;
}

interface CategoryIcon extends Subcategory {
    categoryId: HabitCategory;
    categoryLabel: string;
    categoryColor: HabitColor;
}

interface IconSelectorProps {
    selectedIcon?: SelectedIcon;
    onSelectIcon: (icon: SelectedIcon) => void;
}

export const IconSelector: React.FC<IconSelectorProps> = ({ selectedIcon, onSelectIcon }) => {
    const { data: categories, isLoading } = useCategories();
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('');

    const allIcons = useMemo((): CategoryIcon[] => {
        if (!categories) return [];

        return categories.flatMap(cat =>
            cat.subcategories.map(sub => ({
                ...sub,
                categoryId: cat.id,
                categoryLabel: cat.label,
                categoryColor: cat.color
            }))
        );
    }, [categories]);

    const visibleIcons = useMemo((): CategoryIcon[] => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return allIcons.filter(icon =>
                icon.label.toLowerCase().includes(query) ||
                icon.categoryLabel.toLowerCase().includes(query)
            );
        }
        if (activeCategory) {
            return allIcons.filter(icon => icon.categoryLabel === activeCategory);
        }
        return [];
    }, [allIcons, searchQuery, activeCategory]);

    const handleToggle = useCallback(() => {
        setIsExpanded(prev => {
            if (!prev) {
                setActiveCategory(selectedIcon?.category || categories?.[0]?.label || '');
                setSearchQuery('');
            }
            return !prev;
        });

    }, [selectedIcon?.category, categories]);

    const handleIconSelect = useCallback((icon: CategoryIcon): void => {
        onSelectIcon({
            icon: icon.icon,
            label: icon.label,
            category: icon.categoryLabel,
            categoryId: icon.categoryId,
            categoryColor: icon.categoryColor,
            value: icon.value
        });
        setIsExpanded(false);
    }, [onSelectIcon]);

    const handleCategorySelect = useCallback((categoryLabel: string) => {
        setActiveCategory(categoryLabel);
    }, []);

    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value);
    }, []);

    const clearSearch = useCallback(() => {
        setSearchQuery('');
    }, []);

    const IconButton = React.memo(({ icon }: { icon: CategoryIcon }) => (
        <div className="flex flex-col items-center">
            <Button
                variant={selectedIcon?.value === icon.value ? "default" : "outline"}
                className={`h-12 w-12 text-xl p-0 mb-1 icon-circle-${icon.categoryColor}`}
                type="button"
                onClick={() => handleIconSelect(icon)}
            >
                {icon.icon}
            </Button>
            <span className="text-[10px] text-center text-muted-foreground line-clamp-1 w-full">
                {icon.label}
            </span>
        </div>
    ));

    const CategoryButton = React.memo(({ category }: { category: Category }) => (
        <Button
            variant={activeCategory === category.label ? "default" : "outline"}
            size="sm"
            type="button"
            onClick={() => handleCategorySelect(category.label)}
            className="whitespace-nowrap"
        >
            {category.label}
        </Button>
    ));

    if (!categories || categories.length === 0) {
        return (
            <div className="w-full border rounded-lg p-4 bg-white dark:bg-gray-800">
                <p className="text-muted-foreground">No categories available</p>
            </div>
        );
    }

    return (
        <div className="w-full border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm dark:border-gray-700">
            {/* Header */}
            <button
                className="flex items-center justify-between p-4 w-full text-left bg-transparent border-none hover:outline-none focus:outline-none cursor-pointer"
                onClick={handleToggle}
                type="button"
            >
                <div className="flex items-center">
                    <div className={`h-12 w-12 icon-circle-${selectedIcon?.categoryColor || 'gray'} rounded-full bg-primary/10 flex items-center justify-center text-2xl mr-3`}>
                        {selectedIcon?.icon || "😀"}
                    </div>
                    <div>
                        <p className="font-medium">{selectedIcon?.label || "Select an icon"}</p>
                        <p className="text-xs text-muted-foreground">
                            {selectedIcon ? (
                                categories?.find(cat =>
                                    cat.label.toLowerCase() === selectedIcon.category.toLowerCase()
                                )?.label || selectedIcon.category
                            ) : "Choose a category"}
                        </p>
                    </div>
                </div>
                <div>
                    {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                </div>
            </button>

            {/* Expandable Content */}
            {isExpanded && (
                <div className="border-t dark:border-gray-700">
                    {isLoading ? (
                        <div className="p-8 text-center">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-sm text-muted-foreground">Loading categories...</p>
                        </div>
                    ) : (
                        <>
                            {/* Search */}
                            <div className="p-3 border-b dark:border-gray-700">
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search icons..."
                                        value={searchQuery}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        className="pl-9 pr-9 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                    {searchQuery && (
                                        <button
                                            className="absolute right-3 top-2.5"
                                            onClick={clearSearch}
                                            type="button"
                                        >
                                            <X className="h-4 w-4 text-muted-foreground" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Category Tabs */}
                            {!searchQuery && (
                                <div className="p-3 border-b dark:border-gray-700 overflow-x-auto">
                                    <div className="flex gap-2 pb-1">
                                        {categories.map(category => (
                                            <CategoryButton key={category.id} category={category} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Icons Grid */}
                            <div className="p-3 max-h-64 overflow-y-auto">
                                {searchQuery && (
                                    <p className="text-sm text-muted-foreground mb-2">Search results</p>
                                )}
                                {!searchQuery && activeCategory && (
                                    <p className="text-sm text-muted-foreground mb-2">{activeCategory} icons</p>
                                )}

                                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                                    {visibleIcons.map(icon => (
                                        <IconButton key={`${icon.categoryId}-${icon.value}`} icon={icon} />
                                    ))}
                                </div>

                                {visibleIcons.length === 0 && (searchQuery || activeCategory) && (
                                    <div className="text-center py-4 text-muted-foreground">
                                        {searchQuery ? "No icons match your search" : "Select a category to view icons"}
                                    </div>
                                )}
                            </div>

                            {/* Help text */}
                            <div className="border-t dark:border-gray-700 p-3 text-xs text-center text-muted-foreground">
                                Tap an icon to select it
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};