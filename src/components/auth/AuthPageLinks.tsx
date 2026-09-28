import Link from "next/link";

export function AuthPageLinks({ showUserLogin = false }: { showUserLogin?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-4 pt-6 text-center">
      <Link
        href={showUserLogin ? "/auth/login" : "/auth/admin-login"}
        className="text-xs font-semibold text-primary hover:underline"
      >
        {showUserLogin ? "Inloggen als organisatie" : "Inloggen als beheerder"}
      </Link>
    </div>
  );
}
