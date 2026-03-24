import type { Recommendation } from "@pharmapersonal/types";

interface Props {
  rec: Recommendation;
}

const CATEGORY_ICONS: Record<string, string> = {
  complement: "💊",
  parapharmacie: "🧴",
  hygiene: "🪥",
};

export default function RecCard({ rec }: Props) {
  const product = rec.product;
  const icon = product ? CATEGORY_ICONS[product.category] ?? "💊" : "💊";
  const relevance = Math.round(rec.score * 100);

  return (
    <div className="card flex items-start gap-4">
      <div className="text-3xl w-12 h-12 flex items-center justify-center bg-brand-50 rounded-xl flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm">{product?.name ?? "Produit"}</h3>
          <span className="text-xs font-bold text-brand-600 flex-shrink-0">
            {relevance}% pertinent
          </span>
        </div>
        {rec.reason && (
          <p className="text-sm text-gray-500 mt-1">{rec.reason}</p>
        )}
        {product?.price && (
          <p className="text-xs text-gray-400 mt-1">{product.price.toFixed(2)} €</p>
        )}
      </div>
    </div>
  );
}
