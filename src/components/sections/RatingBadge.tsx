import { useTranslations } from "next-intl";
import { restaurantFacts } from "../../../content/restaurant-facts";

function Star() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.5l2.9 6.28 6.92.7-5.18 4.7 1.5 6.82L12 17.77l-6.14 3.23 1.5-6.82-5.18-4.7 6.92-.7L12 2.5Z" />
    </svg>
  );
}

export function RatingBadge({ tone = "light" }: { tone?: "light" | "dark" }) {
  const t = useTranslations("hero");
  const color = tone === "light" ? "text-paper" : "text-ink";
  const sub = tone === "light" ? "text-paper/70" : "text-ink/60";

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-black/10 px-4 py-2 backdrop-blur-sm">
      <span className="flex items-center gap-1 text-gold">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} />
        ))}
      </span>
      <span className={`text-sm font-semibold ${color}`}>{restaurantFacts.rating.value}</span>
      <span className={`text-xs ${sub}`}>
        ({restaurantFacts.rating.count.toLocaleString()}) {t("ratingLabel")}
      </span>
    </div>
  );
}
