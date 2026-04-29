import { useEffect, useState } from "react";
import { useAuth } from "../app/AuthContext";
import { getAdminMetrics, setUserRoleAction, setUserStatusAction, subscribeToUsers } from "../app/services/adminService";
import { canManageRoles, getRoleLabel, getStatusLabel } from "../app/roles";
import DataStateBanner from "../components/DataStateBanner";
import Button from "../components/ui/Button";
import { Card, CardHeader, InfoCard } from "../components/ui/Card";
import { SelectInput } from "../components/ui/Field";
import { Cell, HeadCell, Table, TableBody, TableHead, TableRow, TableShell } from "../components/ui/Table";

function AdminPage() {
  const { session } = useAuth();
  const [users, setUsers] = useState([]);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    adminUsers: 0,
    totalRequirements: 0,
    blockedRequirements: 0,
    inReviewRequirements: 0,
    recentUsers: []
  });
  const [pageState, setPageState] = useState({
    loading: true,
    error: ""
  });
  const [actionState, setActionState] = useState({
    status: "idle",
    message: ""
  });

  useEffect(() => {
    let active = true;
    const unsubscribe = subscribeToUsers(
      (nextUsers) => {
        if (active) {
          setUsers(nextUsers);
          setPageState({
            loading: false,
            error: ""
          });
        }
      },
      () => {
        if (active) {
          setPageState({
            loading: false,
            error: "Could not load live users from Firebase right now."
          });
        }
      }
    );

    getAdminMetrics()
      .then((data) => {
        if (active) {
          setMetrics(data);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  async function handleRoleChange(uid, role) {
    setActionState({
      status: "loading",
      message: "Updating user role..."
    });

    try {
      await setUserRoleAction(uid, role);
      setActionState({
        status: "success",
        message: "User role updated successfully."
      });
    } catch (error) {
      setActionState({
        status: "error",
        message: error.message || "Could not update this user role."
      });
    }
  }

  async function handleStatusToggle(uid, status) {
    const nextStatus = status === "active" ? "suspended" : "active";

    setActionState({
      status: "loading",
      message: `${nextStatus === "suspended" ? "Suspending" : "Reactivating"} user...`
    });

    try {
      await setUserStatusAction(uid, nextStatus);
      setActionState({
        status: "success",
        message: `User ${nextStatus === "suspended" ? "suspended" : "reactivated"} successfully.`
      });
    } catch (error) {
      setActionState({
        status: "error",
        message: error.message || "Could not update this user status."
      });
    }
  }

  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader
          eyebrow="Admin Governance"
          title="Manage users, access, and workspace health"
          description="This panel is backed by live Firebase data and callable Functions for sensitive governance actions."
        />
      </Card>

      <DataStateBanner loading={pageState.loading} error={pageState.error} loadingText="Loading governance data..." />

      {actionState.message ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
            actionState.status === "success"
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
              : actionState.status === "loading"
                ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
                : "border-red-400/20 bg-red-400/10 text-red-200"
          }`}
        >
          {actionState.message}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        {[
          { label: "Total users", value: metrics.totalUsers },
          { label: "Active users", value: metrics.activeUsers },
          { label: "Suspended users", value: metrics.suspendedUsers },
          { label: "Governance roles", value: metrics.adminUsers }
        ].map((item) => (
          <Card key={item.label} className="p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
            <p className="mt-3 text-3xl font-bold text-white">{item.value}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <TableShell>
          <Table>
            <TableHead>
              <HeadCell>User</HeadCell>
              <HeadCell>Email</HeadCell>
              <HeadCell>Role</HeadCell>
              <HeadCell>Status</HeadCell>
              <HeadCell>Actions</HeadCell>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.uid}>
                  <Cell>
                    <div>
                      <p className="font-semibold text-white">{user.displayName}</p>
                      <p className="text-xs text-slate-400">{user.title}</p>
                    </div>
                  </Cell>
                  <Cell>{user.email}</Cell>
                  <Cell>
                    {canManageRoles(session.user?.role) ? (
                      <SelectInput value={user.role} onChange={(event) => handleRoleChange(user.uid, event.target.value)}>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="super-admin">Super Admin</option>
                      </SelectInput>
                    ) : (
                      <span>{getRoleLabel(user.role)}</span>
                    )}
                  </Cell>
                  <Cell>{getStatusLabel(user.status)}</Cell>
                  <Cell>
                    <Button type="button" variant="secondary" onClick={() => handleStatusToggle(user.uid, user.status)}>
                      {user.status === "active" ? "Suspend" : "Reactivate"}
                    </Button>
                  </Cell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableShell>

        <div className="grid gap-5">
          <Card>
            <CardHeader eyebrow="Platform Activity" title="Workspace health" />
            <div className="mt-6 grid gap-3">
              <InfoCard>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Requirements in system</p>
                <p className="mt-2 text-2xl font-bold text-white">{metrics.totalRequirements}</p>
              </InfoCard>
              <InfoCard>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Blocked requirements</p>
                <p className="mt-2 text-2xl font-bold text-white">{metrics.blockedRequirements}</p>
              </InfoCard>
              <InfoCard>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">In review requirements</p>
                <p className="mt-2 text-2xl font-bold text-white">{metrics.inReviewRequirements}</p>
              </InfoCard>
            </div>
          </Card>

          <Card>
            <CardHeader eyebrow="Recent Access" title="Latest workspace profiles" />
            <div className="mt-6 grid gap-3">
              {metrics.recentUsers.map((user) => (
                <InfoCard key={user.uid}>
                  <p className="font-semibold text-white">{user.displayName}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
                    {getRoleLabel(user.role)} • {getStatusLabel(user.status)}
                  </p>
                  <p className="mt-3 text-sm text-slate-300">{user.email}</p>
                </InfoCard>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default AdminPage;
