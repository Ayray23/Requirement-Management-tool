import { NavLink, Navigate, useLocation } from "react-router-dom";
import { hasRequiredRole, useAuth } from "../app/AuthContext";
import { Card, CardHeader, InfoCard } from "./ui/Card";
import Button from "./ui/Button";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();
  const { session } = useAuth();

  if (!session.isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (!hasRequiredRole(session.user?.role, allowedRoles)) {
    return (
      <Card>
        <CardHeader
          eyebrow="Access Restricted"
          title="You do not have permission to open this page"
          description="This area is limited to specific project roles so requirement governance stays controlled."
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
