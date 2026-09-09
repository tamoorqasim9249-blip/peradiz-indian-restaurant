export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "start",
  tone = "dark",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "start" | "center";
  tone?: "dark" | "light";
}) {
  const alignClass = align === "center" ? "text-center items-center" : "text-start items-start";
  const titleColor = tone === "dark" ? "text-ink" : "text-paper";
  const subtitleColor = tone === "dark" ? "text-ink/65" : "text-paper/70";

  return (
    <div className={`flex flex-col gap-3 ${alignClass}`}>
      {eyebrow && (
        <span className="font-display text-sm uppercase tracking-[0.25em] text-chili">
          {eyebrow}
        </span>
      )}
      <h2 className={`font-display text-3xl sm:text-4xl md:text-5xl ${titleColor}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`max-w-2xl text-base sm:text-lg ${subtitleColor}`}>{subtitle}</p>
      )}
    </div>
  );
}
