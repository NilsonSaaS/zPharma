"use client";

import { useEffect, useState } from "react";
import { pharmaApi } from "@/lib/api";
import PatientTable from "@/components/patient-table/PatientTable";
import Link from "next/link";

export default function PharmaDashboard() {
  const [patients, setPatients] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<{ low_score: any[]; inactive: any[] }>({
    low_score: [],
    inactive: [],
  });
  const [segments, setSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      pharmaApi.getPatients(),
      pharmaApi.getAlerts(),
      pharmaApi.getSegments(),
    ])
      .then(([pRes, aRes, sRes]) => {
        setPatients(pRes.data.data ?? []);
        setAlerts(aRes.data.data ?? { low_score: [], inactive: [] });
        setSegments(sRes.data.data ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalAlerts = alerts.low_score.length + alerts.inactive.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Chargement du dashboard...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💊</span>
          <h1 className="font-bold text-lg">PharmaPersonal</h1>
        </div>
        <div className="flex items-center gap-4">
          {totalAlerts > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {totalAlerts} alerte{totalAlerts > 1 ? "s" : ""}
            </span>
          )}
          <Link href="/pharma/products" className="text-sm text-gray-500 hover:text-gray-700">
            Catalogue
          </Link>
        </div>
      </header>

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card text-center">
            <div className="text-3xl font-bold text-brand-600">{patients.length}</div>
            <div className="text-sm text-gray-500 mt-1">Patients actifs</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-gray-700">
              {patients.length > 0
                ? Math.round(
                    patients.reduce((sum, p) => sum + (p.health_score ?? 0), 0) /
                      patients.length
                  )
                : "—"}
            </div>
            <div className="text-sm text-gray-500 mt-1">Score moyen</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-red-500">{alerts.low_score.length}</div>
            <div className="text-sm text-gray-500 mt-1">Scores bas</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-orange-500">{alerts.inactive.length}</div>
            <div className="text-sm text-gray-500 mt-1">Inactifs 60j</div>
          </div>
        </div>

        {/* Alertes */}
        {totalAlerts > 0 && (
          <div className="card border-l-4 border-red-400">
            <h2 className="font-semibold text-red-700 mb-3">Alertes ({totalAlerts})</h2>
            <div className="space-y-2">
              {alerts.low_score.map((p) => (
                <Link
                  key={p.id}
                  href={`/pharma/patients/${p.id}`}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <div>
                    <span className="font-medium text-sm">
                      {p.first_name} {p.last_name}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">{p.email}</span>
                  </div>
                  <span className="text-sm font-bold text-red-600">Score {p.health_score}</span>
                </Link>
              ))}
              {alerts.inactive.map((p) => (
                <Link
                  key={p.id}
                  href={`/pharma/patients/${p.id}`}
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <span className="font-medium text-sm">
                    {p.first_name} {p.last_name} — inactif depuis 60j
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Segmentation */}
        {segments.length > 0 && (
          <div className="card">
            <h2 className="font-semibold mb-3">Segmentation patients</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {segments.map((s) => (
                <div key={s.segment} className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-xl font-bold">{s.count}</div>
                  <div className="text-xs text-gray-500 capitalize">{s.segment}</div>
                  <div className="text-xs text-gray-400">moy. {s.avg_score}/100</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Liste patients */}
        <div className="card">
          <h2 className="font-semibold mb-4">Tous les patients</h2>
          <PatientTable patients={patients} />
        </div>
      </div>
    </main>
  );
}
