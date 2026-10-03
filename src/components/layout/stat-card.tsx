import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  title,
  value,
  icon: Icon,
  tone = "primary",
}: {
  title: string;
  value: string;
  icon: LucideIcon;
  tone?: "primary" | "gold" | "success" | "info";
}) {
  const colors = {
    primary: "bg-primary-softer text-primary",
    gold: "bg-gold-soft text-gold-foreground",
    success: "bg-success/10 text-success",
    info: "bg-info/10 text-info",
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <span className={`grid size-11 place-items-center rounded-xl ${colors[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="truncate text-2xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
