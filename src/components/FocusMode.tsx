import { useState, useEffect } from 'react';
import { Focus, Save, X } from 'lucide-react';

export default function FocusMode() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const words = content.trim().split(/\s+/).filter((word) => word.length > 0);
    setWordCount(words.length);
  }, [content]);

  const savePoem = () => {
    console.log('Saving poem:', { title, content });
  };

  const exitFocusMode = () => {
    if (content && !confirm('Exit without saving?')) {
      return;
    }
    window.history.back();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <Focus className="w-6 h-6 text-primary" />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Poem"
            className="bg-transparent border-none outline-none text-xl font-semibold text-white placeholder-gray-500"
          />
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{wordCount} words</span>
          <button
            onClick={savePoem}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
          <button
            onClick={exitFocusMode}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing..."
          className="w-full max-w-4xl h-full bg-transparent border-none outline-none text-gray-100 text-lg leading-relaxed resize-none placeholder-gray-600 font-serif"
          autoFocus
        />
      </div>

      <div className="p-4 border-t border-gray-700 text-center">
        <p className="text-sm text-gray-500">
          Focus mode - distraction-free writing environment
        </p>
      </div>
    </div>
  );
}
