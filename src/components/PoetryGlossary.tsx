import { Book } from 'lucide-react';

export default function PoetryGlossary() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Book className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Poetry Glossary
        </h1>
      </div>
      <p className="text-gray-600 dark:text-gray-400">
        Learn about poetry forms, literary devices, meter, and writing techniques.
      </p>
    </div>
  );
}
