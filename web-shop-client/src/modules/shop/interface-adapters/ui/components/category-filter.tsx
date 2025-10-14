'use client';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="mb-6">
      <select 
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="bg-gray-800 text-white border border-yellow-400/30 rounded-lg px-4 py-2"
      >
        <option value="">Все категории</option>
        <option value="weapons">Мифическое оружие</option>
        <option value="bundles">Наборы персонажей</option>
      </select>
    </div>
  );
}
