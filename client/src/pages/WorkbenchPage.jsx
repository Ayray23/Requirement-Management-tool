import { useState } from "react";
import { Sparkles } from "../app/icons";
import { createRequirement } from "../app/api";
import { collaborationThreads, userProfile } from "../data/mockData";

function WorkbenchPage() {
  const initialForm = {
    title: "User Authentication System with OAuth 2.0 Integration",
    priority: "Critical",
    module: "Access Control",
    sprint: "Sprint 7",
    description:
      "The system must support OAuth 2.0 authentication with Google, Microsoft, and GitHub providers. Users should log in with a single click, and session tokens should expire after 24 hours with refresh support."
  };
  const [formData, setFormData] = useState(initialForm);
  const [submitState, setSubmitState] = useState({
    status: "idle",
    message: ""
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitState({
      status: "loading",
      message: "Creating requirement..."
    });

    try {
      const createdRequirement = await createRequirement({
        ...formData,
        owner: userProfile.name
      });

      setSubmitState({
        status: "success",
        message: `${createdRequirement.id} created successfully and assigned to ${createdRequirement.owner}.`
      });
      setFormData(initialForm);
    } catch (error) {
      setSubmitState({
        status: "error",
        message: "Could not create the requirement right now. Check the API and try again."
      });
    }
  }

  return (
    <div className="workbench-layout">
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">AI Workbench</p>
            <h3>Create or refine a requirement</h3>
          </div>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Requirement title</label>
            <input name="title" value={formData.title} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Priority</label>
            <input name="priority" value={formData.priority} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Module</label>
            <input name="module" value={formData.module} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Sprint</label>
            <input name="sprint" value={formData.sprint} onChange={handleChange} />
          </div>
          <div className="input-group full">
            <label>Description</label>
            <textarea name="description" rows="8" value={formData.description} onChange={handleChange} />
          </div>
          <div className="form-actions full">
            <button className="secondary-button inline-button" type="button" onClick={() => setFormData(initialForm)}>
              Reset form
            </button>
            <button className="primary-button inline-button" type="submit" disabled={submitState.status === "loading"}>
              {submitState.status === "loading" ? "Saving..." : "Create requirement"}
            </button>
          </div>
          {submitState.message ? (
            <div className={`form-status ${submitState.status}`}>
              <p>{submitState.message}</p>
            </div>
          ) : null}
        </form>
      </section>
      <aside className="panel accent-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Smart Assist</p>
            <h3>Conflict and similarity alerts</h3>
          </div>
        </div>
        <div className="insight-item">
          <Sparkles />
          <p>REQ-019 contains overlapping session management rules that may conflict with this requirement.</p>
        </div>
        {collaborationThreads.map((thread) => (
          <article key={thread.title} className="thread-card">
            <small>{thread.tag}</small>
            <h4>{thread.title}</h4>
            <p>{thread.excerpt}</p>
            <span>{thread.participants} participants</span>
          </article>
        ))}
      </aside>
    </div>
  );
}

export default WorkbenchPage;
