import { ReportsDashboard } from "./reports/reports-dashboard";

interface ReportsModuleProps {
  onBack: () => void;
}

export default function ReportsModule({ onBack }: ReportsModuleProps) {
  return <ReportsDashboard onBack={onBack} />;
}
