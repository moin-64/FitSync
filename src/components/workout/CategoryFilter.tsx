
import React from 'react';
import { Button } from "@/components/ui/button";
import { EXERCISE_CATEGORIES } from '@/constants/exerciseData';

interface CategoryFilterProps {
  exerciseFilter: string;
  setExerciseFilter: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ exerciseFilter, setExerciseFilter }) => {
  return (
    <div className="mb-2 flex gap-2 overflow-x-auto py-1 no-scrollbar">
      <Button 
        variant={exerciseFilter === 'all' ? "default" : "outline"} 
        size="sm"
        onClick={() => setExerciseFilter('all')}
        className="whitespace-nowrap"
      >
        Alle
      </Button>
      {EXERCISE_CATEGORIES.filter(cat => cat !== 'All').map(category => (
        <Button
          key={category}
          variant={exerciseFilter === category ? "default" : "outline"}
          size="sm"
          onClick={() => setExerciseFilter(category)}
          className="whitespace-nowrap"
        >
          {category}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
