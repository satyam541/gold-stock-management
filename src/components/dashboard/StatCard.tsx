import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  variant?: "default" | "gold" | "green" | "red" | "blue";
  className?: string;
  delay?: number;
}

const variantStyles = {
  default: {
    icon: "bg-muted text-foreground",
    trend: "text-muted-foreground",
  },
  gold: {
    icon: "gold-gradient text-white",
    trend: "text-amber-600",
  },
  green: {
    icon: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    trend: "text-green-600",
  },
  red: {
    icon: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    trend: "text-red-600",
  },
  blue: {
    icon: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    trend: "text-blue-600",
  },
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  className,
  delay = 0,
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn("stat-card opacity-0 animate-fade-in", className)}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {title}
          </p>
          <p className="mt-2 font-display text-2xl font-bold leading-tight truncate">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div className={cn("mt-2 flex items-center gap-1 text-xs font-medium", styles.trend)}>
              <span>{trend.value >= 0 ? "↑" : "↓"}</span>
              <span>
                {Math.abs(trend.value)}% {trend.label}
              </span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ml-4",
            styles.icon
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
