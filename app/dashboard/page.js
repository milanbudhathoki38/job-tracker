"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";

const STATUSES = ["Applied", "OA", "Interview", "Offer", "Rejected"];

export default function DashboardPage() {
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [company, setCompany] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [jobId, setJobId] = useState("");
  const [location, setLocation] = useState("");
  const [postingUrl, setPostingUrl] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function loadUserAndApplications() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data, error } = await supabase
          .from("applications")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error) setApplications(data);
      }
      setLoading(false);
    }
    loadUserAndApplications();
  }, []);

  async function handleAddApplication() {
    if (!company || !roleTitle) return;

    const { data, error } = await supabase
      .from("applications")
      .insert({
        user_id: user.id,
        company,
        role_title: roleTitle,
        job_id: jobId || null,
        location: location || null,
        posting_url: postingUrl || null,
        notes: notes || null,
      })
      .select();

    if (!error) {
      setApplications([data[0], ...applications]);
      setCompany("");
      setRoleTitle("");
      setJobId("");
      setLocation("");
      setPostingUrl("");
      setNotes("");
    } else {
      alert(error.message);
    }
  }

  async function handleStatusChange(id, newStatus) {
    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      setApplications(
        applications.map((app) =>
          app.id === id ? { ...app, status: newStatus } : app
        )
      );
    }
  }

  async function handleDelete(id) {
    const { error } = await supabase.from("applications").delete().eq("id", id);
    if (!error) {
      setApplications(applications.filter((app) => app.id !== id));
    }
  }

  if (loading) return <p style={{ padding: "40px" }}>Loading...</p>;
  if (!user) return <p style={{ padding: "40px" }}>Please log in first.</p>;

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "24px" }}>
      <h1>Job Applications</h1>

      <div style={{ marginBottom: "32px", padding: "16px", border: "1px solid #ccc" }}>
        <h3>Add New Application</h3>
        <input placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} style={{ display: "block", width: "100%", marginBottom: "8px", padding: "8px" }} />
        <input placeholder="Role Title" value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} style={{ display: "block", width: "100%", marginBottom: "8px", padding: "8px" }} />
        <input placeholder="Job ID (optional)" value={jobId} onChange={(e) => setJobId(e.target.value)} style={{ display: "block", width: "100%", marginBottom: "8px", padding: "8px" }} />
        <input placeholder="Location (optional)" value={location} onChange={(e) => setLocation(e.target.value)} style={{ display: "block", width: "100%", marginBottom: "8px", padding: "8px" }} />
        <input placeholder="Posting URL (optional)" value={postingUrl} onChange={(e) => setPostingUrl(e.target.value)} style={{ display: "block", width: "100%", marginBottom: "8px", padding: "8px" }} />
        <textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ display: "block", width: "100%", marginBottom: "8px", padding: "8px" }} />
        <button onClick={handleAddApplication}>Add Application</button>
      </div>

      <h3>Your Applications ({applications.length})</h3>
      {applications.length === 0 && <p>No applications yet.</p>}
      {applications.map((app) => (
        <div key={app.id} style={{ border: "1px solid #ddd", padding: "12px", marginBottom: "12px" }}>
          <strong>{app.company}</strong> — {app.role_title}
          <br />
          <select value={app.status} onChange={(e) => handleStatusChange(app.id, e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button onClick={() => handleDelete(app.id)} style={{ marginLeft: "8px" }}>Delete</button>
        </div>
      ))}
    </div>
  );
}