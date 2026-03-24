import Link from "next/link";

interface PatientRow {
  user: { id: string; first_name: string; last_name: string; email: string };
  profile: { health_score: number; goals: string[] } | null;
  health_score: number | null;
}

interface Props {
  patients: PatientRow[];
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-xs text-gray-400">—</span>;
  const color =
    score >= 70 ? "text-green-600 bg-green-50"
    : score >= 40 ? "text-orange-500 bg-orange-50"
    : "text-red-500 bg-red-50";
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
      {score}/100
    </span>
  );
}

export default function PatientTable({ patients }: Props) {
  if (patients.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <p className="text-lg">Aucun patient enregistre</p>
        <p className="text-sm mt-1">Les patients apparaitront ici apres leur onboarding.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-100">
            <th className="pb-3 font-medium">Patient</th>
            <th className="pb-3 font-medium">Score sante</th>
            <th className="pb-3 font-medium">Objectifs</th>
            <th className="pb-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p.user.id} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="py-3">
                <div className="font-medium">
                  {p.user.first_name} {p.user.last_name}
                </div>
                <div className="text-xs text-gray-400">{p.user.email}</div>
              </td>
              <td className="py-3">
                <ScoreBadge score={p.health_score} />
              </td>
              <td className="py-3">
                <div className="flex gap-1 flex-wrap">
                  {(p.profile?.goals ?? []).slice(0, 3).map((g) => (
                    <span key={g} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                      {g}
                    </span>
                  ))}
                </div>
              </td>
              <td className="py-3 text-right">
                <Link
                  href={`/pharma/patients/${p.user.id}`}
                  className="text-xs text-brand-600 hover:underline"
                >
                  Voir →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
