interface PaaSAdminProps {
  onLogout: () => void;
}

export default function PaaSAdmin({ onLogout }: PaaSAdminProps) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">PaaS Admin</h1>
        <button onClick={onLogout} className="px-4 py-2 bg-primary text-on-primary rounded hover:opacity-90">
          Logout
        </button>
      </div>
      <p className="text-muted-foreground">Platform administration dashboard.</p>
    </div>
  );
}
