import { useTranslations } from "next-intl";

import { Card, CardContent } from "@/shared/ui/card";

import { BackendStatus } from "./backend-status";

export function HomePage() {
  const t = useTranslations("HomePage");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <Card>
        <CardContent>
          <BackendStatus />
        </CardContent>
      </Card>
    </main>
  );
}
