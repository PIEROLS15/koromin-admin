import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TableSearchForm({ q, placeholder = "Buscar..." }: { q?: string; placeholder?: string }) {
  return (
    <form className="mb-4 flex flex-col gap-2 sm:flex-row" role="search">
      <Input name="q" defaultValue={q ?? ""} placeholder={placeholder} className="sm:max-w-sm" />
      <input type="hidden" name="pageSize" value="20" />
      <Button type="submit" variant="outline">Buscar</Button>
    </form>
  );
}
