import { INSIGHTS } from "@/lib/insights";

/** "Business • Technology • Innovation • Growth", wrapping only between items (never before a bullet). */
export function InsightsDescriptor({ className = "" }: { className?: string }) {
  const items = INSIGHTS.descriptor.split(" • ");
  return (
    <span className={className}>
      {items.map((item, i) => (
        <span key={item} className="whitespace-nowrap">
          {item}
          {i < items.length - 1 ? " •" : ""}
          {i < items.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}
