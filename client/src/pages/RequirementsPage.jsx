import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { subscribeRequirements } from "../app/firestoreService";
import DataStateBanner from "../components/DataStateBanner";
import { Card, CardHeader } from "../components/ui/Card";
import { SelectInput, TextInput } from "../components/ui/Field";
import { Cell, EmptyRow, HeadCell, Table, TableBody, TableHead, TableRow, TableShell } from "../components/ui/Table";

function RequirementsPage() {
  const navigate = useNavigate();
  const [requirementsData, setRequirementsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [requirementsState, setRequirementsState] = useState({
    loading: true,
    error: ""
  });

  useEffect(() => {
    const unsubscribe = subscribeRequirements(
      (data) => {
        setRequirementsData(data);
        setRequirementsState({
          loading: false,
          error: ""
        });
      },
      () => {
        setRequirementsState({
          loading: false,
          error: "Could not load requirements from Firebase right now."
        });
      }
    );

    return unsubscribe;
  }, []);

  const summary = {
    total: requirementsData.length,
    active: requirementsData.filter((item) => item.status !== "Completed").length,
    critical: requirementsData.filter((item) => item.priority === "Critical").length
  };

  const filteredRequirements = requirementsData.filter((requirement) => {
    const matchesSearch = [requirement.id, requirement.title, requirement.module, requirement.owner]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" || requirement.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const availableStatuses = ["All", ...new Set(requirementsData.map((item) => item.status))];

  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader
          eyebrow="Requirements Repository"
          title="All requirements"
          description="Live Firestore requirement management with search, status filtering, and operational visibility."
        />
      </Card>

      <DataStateBanner loading={requirementsState.loading} error={requirementsState.error} loadingText="Loading requirement records..." />

      <section className="grid gap-4">
        <div className="flex flex-wrap gap-4">
          {[
            { label: "Total requirements", value: summary.total },
            { label: "Active items", value: summary.active },
            { label: "Critical priority", value: summary.critical }
          ].map((item) => (
            <Card key={item.label} className="min-w-[180px] p-5">
              <strong className="block text-3xl font-bold text-white">{item.value}</strong>
              <span className="text-sm text-slate-400">{item.label}</span>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap gap-4">
          <TextInput
            className="min-h-[52px] flex-1"
            type="text"
            placeholder="Search by title, ID, module, or owner"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <SelectInput className="min-h-[52px] min-w-[200px]" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            {availableStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </SelectInput>
        </div>
      </section>

      <TableShell>
        <Table>
          <TableHead>
            <HeadCell>ID</HeadCell>
            <HeadCell>Title</HeadCell>
            <HeadCell>Module</HeadCell>
            <HeadCell>Priority</HeadCell>
            <HeadCell>Status</HeadCell>
            <HeadCell>Owner</HeadCell>
            <HeadCell>Progress</HeadCell>
          </TableHead>
          <TableBody>
            {filteredRequirements.map((requirement) => (
              <TableRow key={requirement.id} className="cursor-pointer transition hover:bg-white/5">
                <Cell className="text-slate-400">{requirement.id}</Cell>
                <Cell>
                  <button
                    className="text-left font-medium text-white hover:text-cyan-200"
                    onClick={() => navigate(`/requirements/${requirement.id}`)}
                    type="button"
                  >
                    {requirement.title}
                  </button>
                </Cell>
                <Cell>{requirement.module}</Cell>
                <Cell>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                      requirement.priority === "Critical"
                        ? "border-rose-400/30 text-rose-200"
                        : requirement.priority === "High"
                          ? "border-orange-400/30 text-orange-200"
                          : "border-sky-400/30 text-sky-200"
                    }`}
                  >
                    {requirement.priority}
                  </span>
                </Cell>
                <Cell>{requirement.status}</Cell>
                <Cell>{requirement.owner}</Cell>
                <Cell>{requirement.progress}%</Cell>
              </TableRow>
            ))}
            {filteredRequirements.length === 0 ? <EmptyRow colSpan="7">No requirements match the current search and filter.</EmptyRow> : null}
          </TableBody>
        </Table>
      </TableShell>
    </div>
  );
}

export default RequirementsPage;
