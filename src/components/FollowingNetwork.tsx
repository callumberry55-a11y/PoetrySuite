import { Users } from 'lucide-react';

export default function FollowingNetwork() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Poetry Community
        </h1>
      </div>
      <p className="text-gray-600 dark:text-gray-400">
        Connect with fellow poets, follow their work, and build your writing community.
      </p>
    </div>
  );
}
