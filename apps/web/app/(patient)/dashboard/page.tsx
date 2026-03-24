"use client";

import { useEffect, useState } from "react";
import { patientApi } from "@/lib/api";
import HealthScoreGauge from "@/components/health-score/HealthScoreGauge";
import RecCard from "@/components/rec-card/RecCard";
import type { Recommendation } from "@pharmapersonal/types";
import { DISCLAIMER } from "@pharmapersonal/config";

interface ScoreData {
  score: number;
  label: string;
  color: string;
  details: Array<{ label: string; delta: number }>;
}

export default function PatientDashboard() {
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [disclaimer, setDisclaimer] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([patientApi.getScore(), patientApi.getRecommendations()])
      .then(([scoreRes, recsRes]) => {
        setScoreData(scoreRes.data.data);
        setRecs(recsRes.data.data);
        setDisclaimer(recsRes.data.disclaimer);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Chargement de votre bilan...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 max-w-2xl mx-auto">
      <header className="py-6">
        <h1 className="text-2xl font-bold">Mon bilan sante</h1>
        <p className="text-sm text-gray-500">Mis a jour aujourd&apos;hui</p>
      </header>

      {/* Score Sante */}
      {scoreData && (
        <section className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Score Sante</h2>
          <HealthScoreGauge score={scoreData.score} label={scoreData.label} color={scoreData.color} />
          <div className="mt-4 space-y-1">
            {scoreData.details.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{d.label}</span>
                <span className={d.delta >= 0 ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
                  {d.delta >= 0 ? `+${d.delta}` : d.delta}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recommandations */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Mes recommandations</h2>
        {recs.length === 0 ? (
          <div className="card text-center text-gray-400 py-8">
            Aucune recommandation pour le moment.
          </div>
        ) : (
          <div className="space-y-3">
            {recs.map((rec) => (
              <RecCard key={rec.id} rec={rec} />
            ))}
          </div>
        )}
        <p className="text-xs text-gray-400 mt-4 leading-relaxed">{disclaimer}</p>
      </section>
    </main>
  );
}
