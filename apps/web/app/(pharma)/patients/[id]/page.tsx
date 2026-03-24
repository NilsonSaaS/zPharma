"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { pharmaApi } from "@/lib/api";
import Link from "next/link";

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    pharmaApi
      .getPatient(id)
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  }, [id]);

  async function addNote() {
    if (!note.trim()) return;
    setSaving(true);
    try {
      await pharmaApi.addNote(id, note);
      setNote("");
      const res = await pharmaApi.getPatient(id);
      setData(res.data.data);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 animate-pulse">
        Chargement...
      </div>
    );
  }

  const { patient, profile, recommendations, interactions } = data;

  return (
    <main className="min-h-screen bg-gray-50 p-4 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/pharma/dashboard" className="text-sm text-brand-600 hover:underline">
          &larr; Dashboard
        </Link>
      </div>

      {/* En-tête patient */}
      <div className="card mb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold">
              {patient.first_name} {patient.last_name}
            </h1>
            <p className="text-sm text-gray-500">{patient.email}</p>
          </div>
          {profile && (
            <div className="text-right">
              <div
                className={`text-2xl font-bold ${
                  profile.health_score >= 70
                    ? "text-green-600"
                    : profile.health_score >= 40
                    ? "text-orange-500"
                    : "text-red-500"
                }`}
              >
                {profile.health_score}/100
              </div>
              <div className="text-xs text-gray-400">Score sante</div>
            </div>
          )}
        </div>
      </div>

      {/* Profil sante */}
      {profile && (
        <div className="card mb-4">
          <h2 className="font-semibold mb-3">Profil de sante</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-gray-500">Age :</span> {profile.age} ans</div>
            <div><span className="text-gray-500">Sexe :</span> {profile.sex}</div>
            <div><span className="text-gray-500">Poids :</span> {profile.weight_kg} kg</div>
            <div><span className="text-gray-500">Taille :</span> {profile.height_cm} cm</div>
            <div><span className="text-gray-500">Alimentation :</span> {profile.diet}</div>
            <div><span className="text-gray-500">Activite :</span> {profile.activity_level}</div>
            <div><span className="text-gray-500">Sommeil :</span> {profile.sleep_hours}h/nuit</div>
            <div><span className="text-gray-500">Fumeur :</span> {profile.smoker ? "Oui" : "Non"}</div>
          </div>
          {profile.goals.length > 0 && (
            <div className="mt-2 text-sm">
              <span className="text-gray-500">Objectifs :</span>{" "}
              <span className="font-medium">{profile.goals.join(", ")}</span>
            </div>
          )}
          {profile.conditions.length > 0 && (
            <div className="mt-1 text-sm">
              <span className="text-gray-500">Conditions :</span>{" "}
              <span className="font-medium">{profile.conditions.join(", ")}</span>
            </div>
          )}
        </div>
      )}

      {/* Recommandations */}
      <div className="card mb-4">
        <h2 className="font-semibold mb-3">Recommandations ({recommendations.length})</h2>
        {recommendations.length === 0 ? (
          <p className="text-sm text-gray-400">Aucune recommandation generee.</p>
        ) : (
          <div className="space-y-2">
            {recommendations.map((rec: any) => (
              <div key={rec.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium">{rec.product?.name ?? "Produit"}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{rec.reason}</p>
                </div>
                <div className="text-xs font-bold text-brand-600">
                  {Math.round(rec.score * 100)}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes / Interactions */}
      <div className="card">
        <h2 className="font-semibold mb-3">Notes ({interactions.length})</h2>
        <div className="flex gap-2 mb-4">
          <input
            className="input flex-1"
            placeholder="Ajouter une note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addNote()}
          />
          <button
            onClick={addNote}
            disabled={saving}
            className="btn-primary px-4 py-2 text-sm"
          >
            {saving ? "..." : "Ajouter"}
          </button>
        </div>
        {interactions.length === 0 ? (
          <p className="text-sm text-gray-400">Aucune note pour ce patient.</p>
        ) : (
          <div className="space-y-2">
            {interactions.map((i: any) => (
              <div key={i.id} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">{i.note}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(i.created_at).toLocaleDateString("fr-FR")} — {i.pharma_first_name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
