interface PoemEditorProps {
  selectedPoemId: string | null;
  onBack: () => void;
}

export default function PoemEditor({ selectedPoemId, onBack }: PoemEditorProps) {
  return (
    <div className="p-6">
      <button onClick={onBack} className="mb-4 text-primary hover:underline">
        ← Back to Library
      </button>
      <h1 className="text-2xl font-bold mb-4">
        {selectedPoemId ? 'Edit Poem' : 'Create New Poem'}
      </h1>
      <p className="text-muted-foreground">Create and edit your poems here.</p>
    </div>
  );
}
