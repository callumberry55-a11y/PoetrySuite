import { BookMarked } from 'lucide-react';

export default function ReadingLists() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <BookMarked className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Reading Lists
        </h1>
      </div>
      <p className="text-gray-600 dark:text-gray-400">
        Create curated collections of poems to organize and revisit your favorites.
      </p>
    </div>
  );
}
