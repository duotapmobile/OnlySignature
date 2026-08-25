import { Redirect } from "expo-router";
import { ExportFlow } from "@/components/ExportFlow";
import { useAppState } from "@/state/AppStateProvider";

export default function PaidExportScreen() {
  const { activeSet } = useAppState();
  if (activeSet.status !== "purchased") return <Redirect href="/purchase" />;
  return <ExportFlow purchased />;
}
