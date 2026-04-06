import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "../components/AppShell";
import AnalyticsPage from "../pages/AnalyticsPage";
import DashboardPage from "../pages/DashboardPage";
import LoginPage from "../pages/LoginPage";
import RequirementDetailPage from "../pages/RequirementDetailPage";
import RequirementsPage from "../pages/RequirementsPage";
import SettingsPage from "../pages/SettingsPage";
import WorkbenchPage from "../pages/WorkbenchPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <AppShell>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/requirements" element={<RequirementsPage />} />
              <Route path="/requirements/:requirementId" element={<RequirementDetailPage />} />
              <Route path="/workbench" element={<WorkbenchPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AppShell>
        }
      />
    </Routes>
  );
}

export default App;
