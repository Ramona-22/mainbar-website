// Signed in, but not an admin (Firestore rules refused access).
export default function AccessDenied({
  email,
  onLogout,
}: {
  email: string | null;
  onLogout: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#353941] p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl text-center" role="alert">
        <h1 className="font-serif text-2xl text-[#2d2d2d] mb-3">Kein Zugriff</h1>
        <p className="text-sm text-[#555] mb-6">
          Das Konto {email} ist nicht als Admin freigeschaltet.
        </p>
        <button
          onClick={onLogout}
          className="w-full bg-[#cda1b1] hover:bg-[#ebd2db] text-[#353941] py-4 rounded-full font-semibold uppercase tracking-widest text-xs"
        >
          Ausloggen
        </button>
      </div>
    </div>
  );
}
