import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="font-heading text-6xl font-extrabold text-primary">404</h1>
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Pagina niet gevonden
        </h2>
        <p className="text-sm text-muted-foreground">
          De opgevraagde pagina kon niet worden gevonden.
        </p>
        <div>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Terug naar startpagina
          </Link>
        </div>
      </div>
    </div>
  );
}

