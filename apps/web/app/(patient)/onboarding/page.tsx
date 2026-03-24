"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { patientApi } from "@/lib/api";
import type { Goal, Condition, Diet, ActivityLevel, Sex } from "@pharmapersonal/types";
import { GOAL_LABELS, CONDITION_LABELS } from "@pharmapersonal/config";

const STEPS = 5;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    age: 30,
    sex: "M" as Sex,
    weight_kg: 70,
    height_cm: 170,
    goals: [] as Goal[],
    conditions: [] as Condition[],
    diet: "omnivore" as Diet,
    activity_level: "moderate" as ActivityLevel,
    sleep_hours: 7,
    smoker: false,
  });

  function update<K extends keyof typeof form>(key: K, val: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function toggleGoal(goal: Goal) {
    setForm((f) => ({
      ...f,
      goals: f.goals.includes(goal)
        ? f.goals.filter((g) => g !== goal)
        : [...f.goals, goal],
    }));
  }

  function toggleCondition(c: Condition) {
    if (c === "none") {
      setForm((f) => ({ ...f, conditions: ["none"] }));
      return;
    }
    setForm((f) => ({
      ...f,
      conditions: f.conditions.includes(c)
        ? f.conditions.filter((x) => x !== c)
        : [...f.conditions.filter((x) => x !== "none"), c],
    }));
  }

  async function handleFinish() {
    setLoading(true);
    try {
      await patientApi.saveProfile(form);
      router.push("/dashboard");
    } catch {
      alert("Erreur lors de la sauvegarde. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  const GOALS: Goal[] = ["sleep", "stress", "immunity", "sport", "weight", "heart"];
  const CONDITIONS: Condition[] = ["diabetes", "hypertension", "cholesterol", "none"];
  const GOAL_ICONS: Record<Goal, string> = {
    sleep: "😴", stress: "😰", immunity: "🛡️",
    sport: "🏃", weight: "⚖️", heart: "❤️",
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50 to-white flex items-center justify-center px-4">
      <div className="card w-full max-w-lg">
        {/* Progress */}
        <div className="flex gap-1.5 mb-8">
          {Array.from({ length: STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < step ? "bg-brand-500" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Step 1 — Identité */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Qui es-tu ?</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Age</label>
                <input
                  type="number"
                  className="input"
                  value={form.age}
                  min={1} max={120}
                  onChange={(e) => update("age", Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sexe</label>
                <select
                  className="input"
                  value={form.sex}
                  onChange={(e) => update("sex", e.target.value as Sex)}
                >
                  <option value="M">Homme</option>
                  <option value="F">Femme</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Poids (kg)</label>
                <input
                  type="number"
                  className="input"
                  value={form.weight_kg}
                  onChange={(e) => update("weight_kg", Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Taille (cm)</label>
                <input
                  type="number"
                  className="input"
                  value={form.height_cm}
                  onChange={(e) => update("height_cm", Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Objectifs */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Quels sont tes objectifs ?</h2>
            <p className="text-sm text-gray-500">Sélectionne tout ce qui s&apos;applique</p>
            <div className="grid grid-cols-2 gap-3">
              {GOALS.map((goal) => (
                <button
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    form.goals.includes(goal)
                      ? "border-brand-500 bg-brand-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-2xl">{GOAL_ICONS[goal]}</span>
                  <p className="text-sm font-medium mt-1">
                    {GOAL_LABELS[goal].replace("Améliorer mon ", "").replace("Réduire mon ", "").replace("Renforcer mon ", "").replace("Soutenir ma pratique sportive", "Sport").replace("Gérer mon ", "").replace("Prendre soin de mon ", "")}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Santé */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Ta situation de santé</h2>
            <p className="text-sm text-gray-500">Sélectionne ce qui te concerne</p>
            <div className="space-y-2">
              {CONDITIONS.map((c) => (
                <label
                  key={c}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    form.conditions.includes(c)
                      ? "border-brand-500 bg-brand-50"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.conditions.includes(c)}
                    onChange={() => toggleCondition(c)}
                    className="accent-brand-600"
                  />
                  <span className="text-sm font-medium">{CONDITION_LABELS[c]}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 4 — Habitudes */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold">Tes habitudes</h2>

            <div>
              <label className="block text-sm font-medium mb-2">Alimentation</label>
              <div className="flex gap-2">
                {(["omnivore", "vegetarian", "vegan"] as Diet[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => update("diet", d)}
                    className={`flex-1 py-2 px-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      form.diet === d
                        ? "border-brand-500 bg-brand-50"
                        : "border-gray-200"
                    }`}
                  >
                    {d === "omnivore" ? "Omnivore" : d === "vegetarian" ? "Végétarien" : "Vegan"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Activité physique</label>
              <div className="flex gap-2">
                {(["sedentary", "moderate", "active"] as ActivityLevel[]).map((a) => (
                  <button
                    key={a}
                    onClick={() => update("activity_level", a)}
                    className={`flex-1 py-2 px-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      form.activity_level === a
                        ? "border-brand-500 bg-brand-50"
                        : "border-gray-200"
                    }`}
                  >
                    {a === "sedentary" ? "Peu actif" : a === "moderate" ? "Modere" : "Sportif"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Sommeil : <span className="text-brand-600">{form.sleep_hours}h/nuit</span>
              </label>
              <input
                type="range"
                min={4} max={10} step={0.5}
                value={form.sleep_hours}
                onChange={(e) => update("sleep_hours", Number(e.target.value))}
                className="w-full accent-brand-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>4h</span><span>7h</span><span>10h</span>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.smoker}
                onChange={(e) => update("smoker", e.target.checked)}
                className="accent-brand-600 w-5 h-5"
              />
              <span className="text-sm font-medium">Je suis fumeur/fumeuse</span>
            </label>
          </div>
        )}

        {/* Step 5 — Résumé */}
        {step === 5 && (
          <div className="space-y-4 text-center">
            <div className="text-5xl">🎉</div>
            <h2 className="text-xl font-bold">Ton profil est prêt !</h2>
            <p className="text-sm text-gray-500">
              On va maintenant calculer ton score santé et tes recommandations personnalisées.
            </p>
            <div className="bg-gray-50 rounded-xl p-4 text-left text-sm space-y-1">
              <p><span className="font-medium">Age :</span> {form.age} ans</p>
              <p><span className="font-medium">Objectifs :</span> {form.goals.join(", ") || "aucun"}</p>
              <p><span className="font-medium">Alimentation :</span> {form.diet}</p>
              <p><span className="font-medium">Activite :</span> {form.activity_level}</p>
              <p><span className="font-medium">Sommeil :</span> {form.sleep_hours}h/nuit</p>
            </div>
            <p className="text-xs text-gray-400">
              Ces informations restent confidentielles et ne sont accessibles qu&apos;à votre pharmacien.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button onClick={() => setStep((s) => s - 1)} className="btn-secondary flex-1">
              Retour
            </button>
          )}
          {step < STEPS ? (
            <button onClick={() => setStep((s) => s + 1)} className="btn-primary flex-1">
              Continuer
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={loading}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {loading ? "Calcul en cours..." : "Voir mes recommandations"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
