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
          setRequirementsState({ loading: false, error: "" });
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
    <div className="grid gap-5">
      <section className="rounded-[28px] border border-white/10 bg-slate-950/50 p-6 shadow-glow backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Requirements Repository</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-white">All requirements</h1>
        <p className="mt-3 text-slate-400">Table-style requirement management with search, status filter, and progress visibility.</p>
      </section>

      <DataStateBanner loading={requirementsState.loading} error={requirementsState.error} loadingText="Loading requirement records..." />

      <section className="grid gap-4">
        <div className="flex flex-wrap gap-4">
          <article className="min-w-[180px] rounded-3xl border border-white/10 bg-slate-950/50 p-5 shadow-glow">
            <strong className="block text-3xl font-bold text-white">{summary.total}</strong>
            <span className="text-sm text-slate-400">Total requirements</span>
          </article>
          <article className="min-w-[180px] rounded-3xl border border-white/10 bg-slate-950/50 p-5 shadow-glow">
            <strong className="block text-3xl font-bold text-white">{summary.active}</strong>
            <span className="text-sm text-slate-400">Active items</span>
          </article>
          <article className="min-w-[180px] rounded-3xl border border-white/10 bg-slate-950/50 p-5 shadow-glow">
            <strong className="block text-3xl font-bold text-white">{summary.critical}</strong>
            <span className="text-sm text-slate-400">Critical priority</span>
          </article>
        </div>

        <div className="flex flex-wrap gap-4">
          <input
            className="min-h-[52px] flex-1 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-fuchsia-400/40"
            type="text"
            placeholder="Search by title, ID, module, or owner"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <select
            className="min-h-[52px] min-w-[200px] rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-slate-100 outline-none focus:border-fuchsia-400/40"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            {availableStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="overflow-x-auto rounded-[28px] border border-white/10 bg-slate-950/50 p-4 shadow-glow backdrop-blur-xl">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs uppercase tracking-[0.18em] text-slate-400">
              <th className="px-3 py-4">ID</th>
              <th className="px-3 py-4">Title</th>
              <th className="px-3 py-4">Module</th>
              <th className="px-3 py-4">Priority</th>
              <th className="px-3 py-4">Status</th>
              <th className="px-3 py-4">Owner</th>
              <th className="px-3 py-4">Progress</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequirements.map((requirement) => (
              <tr key={requirement.id} className="border-b border-white/5 text-sm text-slate-200">
                <td className="px-3 py-4 text-slate-400">{requirement.id}</td>
                <td className="px-3 py-4">{requirement.title}</td>
                <td className="px-3 py-4">{requirement.module}</td>
                <td className="px-3 py-4">
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
                </td>
                <td className="px-3 py-4">{requirement.status}</td>
                <td className="px-3 py-4">{requirement.owner}</td>
                <td className="px-3 py-4">{requirement.progress}%</td>
              </tr>
            ))}
            {filteredRequirements.length === 0 ? (
              <tr>
                <td className="px-3 py-8 text-center text-slate-400" colSpan="7">
                  No requirements match the current search and filter.
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
