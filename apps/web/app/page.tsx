import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-brand-50 to-white px-4">
      <div className="text-center max-w-xl">
        <div className="text-5xl mb-4">💊</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          PharmaPersonal
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Votre accompagnement santé personnalisé, directement depuis votre pharmacie.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/login" className="btn-primary text-center">
            Connexion patient
          </Link>
          <Link href="/pharma/login" className="btn-secondary text-center">
            Espace pharmacien
          </Link>
        </div>
      </div>
    </main>
  );
}
