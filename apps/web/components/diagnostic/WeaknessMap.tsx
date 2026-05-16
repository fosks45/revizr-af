/**
 * WeaknessMap — renders topic weakness scores as a sorted bar chart.
 *
 * WCAG compliance:
 * - V2: Colour is NEVER the only indicator. Every bar has a text label + icon.
 * - Uses div-based bars (not canvas) for screen reader accessibility.
 * - Each bar row is a list item with full text content available to AT.
 * - Sorted descending by weakness_score (highest weakness first).
 */

import type { WeaknessResult } from "@/lib/api";
import type { BadgeVariant } from "@/components/ui/Badge";
import { Badge } from "@/components/ui/Badge";

interface WeaknessMapProps {
  topics: WeaknessResult[];
}

interface TopicStatus {
  variant: BadgeVariant;
  label: string;
  barColor: string;
}

function getTopicStatus(score: number): TopicStatus {
  if (score >= 0.8)
    return {
      variant: "critical",
      label: "Most needs work",
      barColor: "bg-status-critical",
    };
  if (score >= 0.6)
    return {
      variant: "weak",
      label: "Needs practice",
      barColor: "bg-status-weak",
    };
  if (score >= 0.4)
    return {
      variant: "moderate",
      label: "Building confidence",
      barColor: "bg-status-moderate",
    };
  if (score >= 0.2)
    return {
      variant: "improving",
      label: "Improving",
      barColor: "bg-status-improving",
    };
  return {
    variant: "strong",
    label: "Looking good",
    barColor: "bg-status-strong",
  };
}

export function WeaknessMap({ topics }: WeaknessMapProps) {
  if (topics.length === 0) {
    return (
      <p className="text-sm text-text-tertiary py-4">
        No topic data available yet.
      </p>
    );
  }

  const sorted = [...topics].sort((a, b) => b.weakness_score - a.weakness_score);

  return (
    <div
      role="list"
      aria-label="Topic weakness map — sorted from highest to lowest weakness"
    >
      {sorted.map((topic) => {
        const pct = Math.round(topic.weakness_score * 100);
        const { variant, label, barColor } = getTopicStatus(topic.weakness_score);
        const topicLabel = topic.topic_tag.replace(/_/g, " ");

        return (
          <div
            key={topic.topic_tag}
            role="listitem"
            className="py-3 border-b border-border-default last:border-0"
          >
            {/* Text row — colour + text + icon, never colour alone */}
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <span className="text-sm text-text-primary capitalize flex-1 min-w-0 truncate">
                {topicLabel}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-text-secondary font-medium">
                  {pct}%
                </span>
                <Badge variant={variant} showIcon>
                  {label}
                </Badge>
              </div>
            </div>

            {/* Bar — decorative (aria-hidden), full info already in text row) */}
            <div
              className="h-2 w-full bg-bg-surface-overlay rounded-full overflow-hidden"
              aria-hidden="true"
            >
              <div
                className={`h-full rounded-full transition-all duration-deliberate easing-decelerate ${barColor}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
