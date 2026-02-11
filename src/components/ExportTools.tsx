import { Download, FileText, Image, BookOpen, FileJson } from 'lucide-react';

export default function ExportTools() {
  const formats = [
    {
      name: 'PDF Export',
      description: 'Export your poems as a beautifully formatted PDF',
      icon: FileText,
      format: 'PDF',
      color: 'red',
    },
    {
      name: 'Image Export',
      description: 'Create shareable images of your poems',
      icon: Image,
      format: 'PNG/JPG',
      color: 'blue',
    },
    {
      name: 'Book Format',
      description: 'Export as a formatted book (EPUB)',
      icon: BookOpen,
      format: 'EPUB',
      color: 'green',
    },
    {
      name: 'JSON Export',
      description: 'Export your data in JSON format',
      icon: FileJson,
      format: 'JSON',
      color: 'purple',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Export Tools</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Export your poems in various formats
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {formats.map((format) => (
          <div
            key={format.name}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-primary transition-all hover:shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg bg-${format.color}-100 dark:bg-${format.color}-900/20`}>
                <format.icon className={`w-6 h-6 text-${format.color}-500`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{format.name}</h3>
                  <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {format.format}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {format.description}
                </p>
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold mb-2">Export Tips</h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• PDF exports maintain formatting and are great for printing</li>
          <li>• Image exports are perfect for sharing on social media</li>
          <li>• EPUB format works with most e-readers</li>
          <li>• JSON exports allow you to backup your data</li>
        </ul>
      </div>
    </div>
  );
}
