import { NavLink, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../app/AuthContext";
import { hasRequiredRole } from "../app/roles";
import { Card, CardHeader, InfoCard } from "./ui/Card";
import Button from "./ui/Button";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();
  const { session } = useAuth();

  if (session.loading) {
    return <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center text-slate-200">Checking your session...</div>;
  }

  if (!session.isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (!hasRequiredRole(session.user?.role, allowedRoles)) {
    return (
      <Card>
        <CardHeader
          eyebrow="Access Restricted"
          title="You do not have permission to open this page"
          description="This area is limited to specific project roles so workspace governance stays controlled."
        />
        <InfoCard className="mt-6">
          <p className="text-sm text-slate-300">Signed in as {session.user?.name} ({session.user?.role}).</p>
          <Button as={NavLink} to="/dashboard" className="mt-4">
            Return to dashboard
          </Button>
        </InfoCard>
      </Card>
    );
  }

  return children;
}

export default ProtectedRoute;
