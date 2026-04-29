import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { subscribeRequirements } from "../app/firestoreService";
import DataStateBanner from "../components/DataStateBanner";
import { Card, CardHeader } from "../components/ui/Card";
import { SelectInput, TextInput } from "../components/ui/Field";
import { Cell, EmptyRow, HeadCell, Table, TableBody, TableHead, TableRow, TableShell } from "../components/ui/Table";

function toDateInputValue(dateLike) {
  if (!dateLike) {
    return "";
  }

  const date = dateLike?.toDate ? dateLike.toDate() : new Date(dateLike);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function RequirementsPage() {
  const navigate = useNavigate();
  const [requirementsData, setRequirementsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "All",
    priority: "All",
    type: "All",
    project: "All",
    dateCreated: ""
  });
  const [requirementsState, setRequirementsState] = useState({
    loading: true,
    error: ""
  });

  useEffect(() => {
    const unsubscribe = subscribeRequirements(
      (data) => {
        setRequirementsData(data);
        setRequirementsState({ loading: false, error: "" });
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

  function updateFilter(field, value) {
    setFilters((current) => ({
      ...current,
      [field]: value
    }));
  }

  const filterOptions = useMemo(
    () => ({
      statuses: ["All", ...new Set(requirementsData.map((item) => item.status))],
      priorities: ["All", ...new Set(requirementsData.map((item) => item.priority))],
      types: ["All", ...new Set(requirementsData.map((item) => item.type))],
      projects: ["All", ...new Set(requirementsData.map((item) => item.project))]
    }),
    [requirementsData]
  );

  const filteredRequirements = requirementsData.filter((requirement) => {
    const matchesSearch = [
      requirement.id,
      requirement.title,
      requirement.description,
      requirement.project,
      requirement.module,
      requirement.stakeholder,
      requirement.owner
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus = filters.status === "All" || requirement.status === filters.status;
    const matchesPriority = filters.priority === "All" || requirement.priority === filters.priority;
    const matchesType = filters.type === "All" || requirement.type === filters.type;
    const matchesProject = filters.project === "All" || requirement.project === filters.project;
    const matchesDate = !filters.dateCreated || toDateInputValue(requirement.createdAt) === filters.dateCreated;

    return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesProject && matchesDate;
  });

  const summary = {
    total: requirementsData.length,
    approved: requirementsData.filter((item) => item.status === "Approved").length,
    pending: requirementsData.filter((item) => item.status === "Pending").length,
    highPriority: requirementsData.filter((item) => item.priority === "High").length
  };

  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader
          eyebrow="Requirements Repository"
          title="Search, filter, and govern requirement records"
          description="Browse the full REMT repository by project, priority, type, approval status, and creation date."
        />
      </Card>

      <DataStateBanner loading={requirementsState.loading} error={requirementsState.error} loadingText="Loading requirement records..." />

      <section className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Total requirements", value: summary.total },
            { label: "Approved", value: summary.approved },
            { label: "Pending", value: summary.pending },
            { label: "High priority", value: summary.highPriority }
          ].map((item) => (
            <Card key={item.label} className="p-5">
              <strong className="block text-3xl font-bold text-white">{item.value}</strong>
              <span className="text-sm text-slate-400">{item.label}</span>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <TextInput
            className="min-h-[52px] lg:col-span-3"
            type="text"
            placeholder="Search by title, description, project, stakeholder, or requirement ID"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <SelectInput className="min-h-[52px]" value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>
            {filterOptions.statuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </SelectInput>
          <SelectInput className="min-h-[52px]" value={filters.priority} onChange={(event) => updateFilter("priority", event.target.value)}>
            {filterOptions.priorities.map((priority) => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </SelectInput>
          <SelectInput className="min-h-[52px]" value={filters.type} onChange={(event) => updateFilter("type", event.target.value)}>
            {filterOptions.types.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </SelectInput>
          <SelectInput className="min-h-[52px]" value={filters.project} onChange={(event) => updateFilter("project", event.target.value)}>
            {filterOptions.projects.map((project) => (
              <option key={project} value={project}>{project}</option>
            ))}
          </SelectInput>
          <TextInput className="min-h-[52px]" type="date" value={filters.dateCreated} onChange={(event) => updateFilter("dateCreated", event.target.value)} />
        </div>
      </section>

      <TableShell>
        <Table>
          <TableHead>
            <HeadCell>ID</HeadCell>
            <HeadCell>Title</HeadCell>
            <HeadCell>Project</HeadCell>
            <HeadCell>Type</HeadCell>
            <HeadCell>Priority</HeadCell>
            <HeadCell>Status</HeadCell>
            <HeadCell>Stakeholder</HeadCell>
          </TableHead>
          <TableBody>
            {filteredRequirements.map((requirement) => (
              <TableRow key={requirement.id} className="cursor-pointer transition hover:bg-white/5">
                <Cell className="text-slate-400">{requirement.id}</Cell>
                <Cell>
                  <button className="text-left font-medium text-white hover:text-cyan-200" onClick={() => navigate(`/requirements/${requirement.id}`)} type="button">
                    {requirement.title}
                  </button>
                </Cell>
                <Cell>{requirement.project} / {requirement.module}</Cell>
                <Cell>{requirement.type}</Cell>
                <Cell>{requirement.priority}</Cell>
                <Cell>{requirement.status}</Cell>
                <Cell>{requirement.stakeholder || requirement.owner}</Cell>
              </TableRow>
            ))}
            {filteredRequirements.length === 0 ? <EmptyRow colSpan="7">No requirements match the current search and filters.</EmptyRow> : null}
          </TableBody>
        </Table>
      </TableShell>
    </div>
  );
}

export default RequirementsPage;
