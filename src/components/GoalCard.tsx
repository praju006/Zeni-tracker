import { Progress } from "@/components/ui/progress";

interface Props {
  title: string;
  saved: number;
  target: number;
}

export function GoalCard({ title, saved, target }: Props) {
  const percent = Math.min((saved / target) * 100, 100);

  return (
    <div className="glass rounded-xl p-4">
      <h4 className="font-semibold">{title}</h4>
      <p className="text-sm text-muted-foreground">
        ₹{saved} / ₹{target}
      </p>
      <Progress value={percent} className="mt-2" />
    </div>
  );
}