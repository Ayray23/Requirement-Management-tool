import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import AppShell from "../components/AppShell";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminPage from "../pages/AdminPage";
import AnalyticsPage from "../pages/AnalyticsPage";
import CollaborationPage from "../pages/CollaborationPage";
import DashboardPage from "../pages/DashboardPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import RequirementDetailPage from "../pages/RequirementDetailPage";
import RequirementsPage from "../pages/RequirementsPage";
import SettingsPage from "../pages/SettingsPage";
import WorkbenchPage from "../pages/WorkbenchPage";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppShell>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/requirements" element={<RequirementsPage />} />
                  <Route path="/requirements/:requirementId" element={<RequirementDetailPage />} />
                  <Route path="/collaboration" element={<CollaborationPage />} />
                  <Route
                    path="/workbench"
                    element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <WorkbenchPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </AppShell>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
