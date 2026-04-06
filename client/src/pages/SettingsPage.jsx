import { userProfile } from "../data/mockData";

function SettingsPage() {
  return (
    <div className="two-column">
      <article className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Profile</p>
            <h3>Workspace identity</h3>
          </div>
        </div>
        <div className="form-grid">
          <div className="input-group">
            <label>Full name</label>
            <input defaultValue={userProfile.name} />
          </div>
          <div className="input-group">
            <label>Role</label>
            <input defaultValue={userProfile.role} />
          </div>
          <div className="input-group full">
            <label>Email</label>
            <input defaultValue={userProfile.email} />
          </div>
          <div className="input-group full">
            <label>Bio</label>
            <textarea rows="5" defaultValue="Senior Product Owner with 6+ years in agile software delivery and requirement engineering." />
          </div>
        </div>
      </article>
      <article className="panel accent-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Preferences</p>
            <h3>Notification controls</h3>
          </div>
        </div>
        {["Email notifications", "Requirement status changes", "AI conflict alerts", "Weekly summary digest"].map((item) => (
          <div key={item} className="toggle-row">
            <div>
              <strong>{item}</strong>
              <p>Enabled for this workspace</p>
            </div>
            <span className="toggle-pill">On</span>
          </div>
        ))}
      </article>
    </div>
  );
}

export default SettingsPage;
