import { Category, SubCategory } from '@prisma/client';

export type HabitColor =
    | 'blue' | 'green' | 'red' | 'purple' | 'orange'
    | 'yellow' | 'emerald' | 'pink' | 'teal' | 'indigo' | 'gray';

export interface CategoryOption {
    label: string;
    color: HabitColor;
    subcategories: SubCategoryOption[];
}

export interface SubCategoryOption {
    label: string;
    icon: string;
    value: SubCategory;
}

export const categoryConfig: Record<Category, CategoryOption> = {
    personal: {
        label: 'Personal',
        color: 'blue',
        subcategories: [
            { label: 'Creative', icon: '🎨', value: SubCategory.creative },
            { label: 'Music', icon: '🎸', value: SubCategory.music },
            { label: 'Nature', icon: '🌿', value: SubCategory.nature },
            { label: 'Self-care', icon: '☕', value: SubCategory.self_care },
            { label: 'Family', icon: '👪', value: SubCategory.family },
            { label: 'Pets', icon: '🐶', value: SubCategory.pets },
            { label: 'Home', icon: '🏡', value: SubCategory.home },
        ],
    },
    health: {
        label: 'Health',
        color: 'green',
        subcategories: [
            { label: 'Hydration', icon: '💧', value: SubCategory.hydration },
            { label: 'Nutrition', icon: '🥗', value: SubCategory.nutrition },
            { label: 'Sleep', icon: '😴', value: SubCategory.sleep },
            { label: 'Medication', icon: '💊', value: SubCategory.medication },
            { label: 'Check-up', icon: '🩺', value: SubCategory.checkup },
            { label: 'Dental', icon: '🦷', value: SubCategory.dental },
            { label: 'Mental', icon: '🧠', value: SubCategory.mental },
        ],
    },
    fitness: {
        label: 'Fitness',
        color: 'red',
        subcategories: [
            { label: 'Running', icon: '🏃‍♂️', value: SubCategory.running },
            { label: 'Strength', icon: '💪', value: SubCategory.strength },
            { label: 'Cycling', icon: '🚴', value: SubCategory.cycling },
            { label: 'Workout', icon: '🏋️', value: SubCategory.workout },
            { label: 'Climbing', icon: '🧗‍♀️', value: SubCategory.climbing },
            { label: 'Swimming', icon: '🏊‍♀️', value: SubCategory.swimming },
            { label: 'Sports', icon: '⚽', value: SubCategory.sports },
        ],
    },
    mindfulness: {
        label: 'Mindfulness',
        color: 'purple',
        subcategories: [
            { label: 'Yoga', icon: '🧘‍♀️', value: SubCategory.yoga },
            { label: 'Meditation', icon: '🧠', value: SubCategory.meditation },
            { label: 'Gratitude', icon: '🌱', value: SubCategory.gratitude },
            { label: 'Journaling', icon: '📝', value: SubCategory.journaling },
            { label: 'Prayer', icon: '🙏', value: SubCategory.prayer },
        ],
    },
    productivity: {
        label: 'Productivity',
        color: 'orange',
        subcategories: [
            { label: 'Planning', icon: '📝', value: SubCategory.planning },
            { label: 'Time Mgmt', icon: '⏰', value: SubCategory.time_mgmt },
            { label: 'Work', icon: '💼', value: SubCategory.work },
            { label: 'Goals', icon: '🎯', value: SubCategory.goals },
            { label: 'Progress', icon: '📊', value: SubCategory.progress },
            { label: 'Tasks', icon: '✅', value: SubCategory.tasks },
            { label: 'Track', icon: '📈', value: SubCategory.track },
        ],
    },
    learning: {
        label: 'Learning',
        color: 'yellow',
        subcategories: [
            { label: 'Reading', icon: '📚', value: SubCategory.reading },
            { label: 'Writing', icon: '✍️', value: SubCategory.writing },
            { label: 'Studying', icon: '🎓', value: SubCategory.studying },
            { label: 'Skills', icon: '🧩', value: SubCategory.skills },
            { label: 'Coding', icon: '💻', value: SubCategory.coding },
            { label: 'Language', icon: '🗣️', value: SubCategory.language },
            { label: 'Research', icon: '🔍', value: SubCategory.research },
        ],
    },
    finance: {
        label: 'Finance',
        color: 'emerald',
        subcategories: [
            { label: 'Saving', icon: '💰', value: SubCategory.saving },
            { label: 'Budget', icon: '💸', value: SubCategory.budget },
            { label: 'Investing', icon: '📉', value: SubCategory.investing },
            { label: 'Expense', icon: '🧾', value: SubCategory.expense },
            { label: 'Bills', icon: '💳', value: SubCategory.bills },
        ],
    },
    social: {
        label: 'Social',
        color: 'pink',
        subcategories: [
            { label: 'Friends', icon: '👥', value: SubCategory.friends },
            { label: 'Reach Out', icon: '💌', value: SubCategory.reach_out },
            { label: 'Events', icon: '🎭', value: SubCategory.events },
            { label: 'Network', icon: '🤝', value: SubCategory.network },
            { label: 'Dating', icon: '❤️', value: SubCategory.dating },
            { label: 'Give', icon: '🎁', value: SubCategory.give },
        ],
    },
    environmental: {
        label: 'Environmental',
        color: 'teal',
        subcategories: [
            { label: 'Recycle', icon: '♻️', value: SubCategory.recycle },
            { label: 'Eco-friendly', icon: '🌱', value: SubCategory.eco_friendly },
            { label: 'Walk', icon: '🚶‍♀️', value: SubCategory.walk },
            { label: 'Save Water', icon: '🚿', value: SubCategory.save_water },
            { label: 'Energy', icon: '💡', value: SubCategory.energy },
        ],
    },
    hobbies: {
        label: 'Hobbies',
        color: 'indigo',
        subcategories: [
            { label: 'Photography', icon: '📷', value: SubCategory.photography },
            { label: 'Gaming', icon: '🎮', value: SubCategory.gaming },
            { label: 'Crafting', icon: '🧵', value: SubCategory.crafting },
            { label: 'Art', icon: '🎨', value: SubCategory.art },
            { label: 'Knitting', icon: '🧶', value: SubCategory.knitting },
            { label: 'Movies', icon: '🎬', value: SubCategory.movies },
            { label: 'Cooking', icon: '🍳', value: SubCategory.cooking },
            { label: 'Gardening', icon: '🌱', value: SubCategory.gardening },
        ],
    },
    other: {
        label: 'Other',
        color: 'gray',
        subcategories: [
            { label: 'Custom', icon: '⭐', value: SubCategory.custom },
            { label: 'Routine', icon: '🔄', value: SubCategory.routine },
            { label: 'Reminder', icon: '🔔', value: SubCategory.reminder },
            { label: 'General', icon: '📌', value: SubCategory.general },
            { label: 'Habit', icon: '🎲', value: SubCategory.habit },
            { label: 'Fun', icon: '🎪', value: SubCategory.fun },
            { label: 'Challenge', icon: '🏆', value: SubCategory.challenge },
            { label: 'Avoid', icon: '🛑', value: SubCategory.avoid },
            { label: 'Track', icon: '🔍', value: SubCategory.track_other },
        ],
    },
};
