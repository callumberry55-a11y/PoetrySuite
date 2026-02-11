interface FormsProps {
  onSelectForm: () => void;
}

export default function Forms({ onSelectForm }: FormsProps) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Poetry Forms</h1>
      <p className="text-muted-foreground">Explore different poetry forms and structures.</p>
      <button onClick={onSelectForm} className="mt-4 px-4 py-2 bg-primary text-on-primary rounded hover:opacity-90">
        Start Writing
      </button>
    </div>
  );
}
