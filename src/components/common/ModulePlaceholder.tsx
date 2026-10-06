import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";

interface ModulePlaceholderProps {
  title: string;
  description: string;
}

/**
 * Temporary page for modules that don't have real pages yet.
 * Replace with the real page in `src/routes.tsx` when ready.
 */
export function ModulePlaceholder({ title, description }: ModulePlaceholderProps) {
  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This module is not built yet. Add its page under
          src/modules/dashboard and point the route at it in src/routes.tsx.
        </p>
      </CardContent>
    </Card>
  );
}
