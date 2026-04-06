import { useEffect, useState } from "react";
import { getRequirementsData } from "../app/api";
import DataStateBanner from "../components/DataStateBanner";
import { requirements } from "../data/mockData";

function RequirementsPage() {
  const [requirementsData, setRequirementsData] = useState(requirements);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [requirementsState, setRequirementsState] = useState({
    loading: true,
    error: ""
  });

  useEffect(() => {
    let active = true;

    getRequirementsData()
      .then((data) => {
        if (active && Array.isArray(data)) {
          setRequirementsData(data);
          setRequirementsState({
            loading: false,
            error: ""
          });
        }
      })
      .catch(() => {
        if (active) {
          setRequirementsState({
            loading: false,
            error: "Could not reach the API, so the seeded requirement list is being shown."
          });
        }
      });

    return () => {
      active = false;
    };
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
    <div className="page-grid">
      <section className="page-header-card">
        <div>
          <p className="eyebrow">Requirements Repository</p>
          <h1>All requirements</h1>
          <p className="muted">Table-style requirement management with clear status, ownership, and sprint alignment.</p>
        </div>
      </section>
      <DataStateBanner
        loading={requirementsState.loading}
        error={requirementsState.error}
        loadingText="Loading requirement records..."
      />
      <section className="requirements-toolbar">
        <div className="summary-row">
          <article className="summary-chip">
            <strong>{summary.total}</strong>
            <span>Total requirements</span>
          </article>
          <article className="summary-chip">
            <strong>{summary.active}</strong>
            <span>Active items</span>
          </article>
          <article className="summary-chip">
            <strong>{summary.critical}</strong>
            <span>Critical priority</span>
          </article>
        </div>
        <div className="filter-row">
          <input
            className="filter-input"
            type="text"
            placeholder="Search by title, ID, module, or owner"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <select className="filter-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            {availableStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </section>
      <section className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Module</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Owner</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequirements.map((requirement) => (
              <tr key={requirement.id}>
                <td>{requirement.id}</td>
                <td>{requirement.title}</td>
                <td>{requirement.module}</td>
                <td>
                  <span className={`pill ${requirement.priority.toLowerCase()}`}>{requirement.priority}</span>
                </td>
                <td>{requirement.status}</td>
                <td>{requirement.owner}</td>
                <td>{requirement.progress}%</td>
              </tr>
            ))}
            {filteredRequirements.length === 0 ? (
              <tr>
                <td colSpan="7">
                  <div className="empty-table-state">No requirements match the current search and filter.</div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default RequirementsPage;
