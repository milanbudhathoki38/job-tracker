"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";

const STATUSES = ["Applied", "OA", "Interview", "Offer", "Rejected"];

export default function DashboardPage() {
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [company, setCompany] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [jobId, setJobId] = useState("");
  const [location, setLocation] = useState("");
  const [postingUrl, setPostingUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editCompany, setEditCompany] = useState("");
  const [editRoleTitle, setEditRoleTitle] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    async function loadUserAndApplications() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);

      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) setApplications(data);
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

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
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

  function startEditing(app) {
    setEditingId(app.id);
    setEditCompany(app.company);
    setEditRoleTitle(app.role_title);
    setEditNotes(app.notes || "");
  }

  async function handleSaveEdit(id) {
    const { error } = await supabase
      .from("applications")
      .update({
        company: editCompany,
        role_title: editRoleTitle,
        notes: editNotes,
      })
      .eq("id", id);

    if (!error) {
      setApplications(
        applications.map((app) =>
          app.id === id
            ? { ...app, company: editCompany, role_title: editRoleTitle, notes: editNotes }
            : app
        )
      );
      setEditingId(null);
    }
  }

  async function handleDelete(id) {
    const { error } = await supabase.from("applications").delete().eq("id", id);
    if (!error) {
      setApplications(applications.filter((app) => app.id !== id));
    }
  }

  const filteredApplications =
  statusFilter === "All"
    ? applications
    : applications.filter((app) => app.status === statusFilter);


  if (loading) return <p style={{ padding: "40px", fontFamily: "Inter, sans-serif" }}>Loading...</p>;
  if (!user) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#F7F4EC", fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "48px 24px" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          <h1 style={{ fontFamily: "'Zilla Slab', serif", fontSize: "36px", color: "#1B2430", margin: 0 }}>
            Your Applications
          </h1>
          <button onClick={handleLogout} style={secondaryBtnStyle}>
            Log Out
          </button>
        </div>

        <div style={{ background: "#ffffff", border: "1px solid #D8D2C2", borderRadius: "10px", padding: "28px", marginBottom: "40px" }}>
          <h3 style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "13px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#B8451A", marginTop: 0, marginBottom: "20px" }}>
            Add New Application
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <input placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} style={inputStyle} />
            <input placeholder="Role Title" value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} style={inputStyle} />
            <input placeholder="Job ID (optional)" value={jobId} onChange={(e) => setJobId(e.target.value)} style={inputStyle} />
            <input placeholder="Location (optional)" value={location} onChange={(e) => setLocation(e.target.value)} style={inputStyle} />
          </div>
          <input placeholder="Posting URL (optional)" value={postingUrl} onChange={(e) => setPostingUrl(e.target.value)} style={{ ...inputStyle, width: "100%", marginBottom: "12px" }} />
          <textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ ...inputStyle, width: "100%", marginBottom: "16px", minHeight: "60px", resize: "vertical" }} />
          <button onClick={handleAddApplication} style={primaryBtnStyle}>Add Application</button>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
          {["All", ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "12px",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                padding: "6px 14px",
                borderRadius: "999px",
                border: statusFilter === s ? "1.5px solid #B8451A" : "1px solid #D8D2C2",
                background: statusFilter === s ? "#FBEEE7" : "#ffffff",
                color: statusFilter === s ? "#B8451A" : "#6b6355",
                cursor: "pointer",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "13px", letterSpacing: "0.05em", textTransform: "uppercase", color: "#6B7A5E", marginBottom: "16px" }}>
          {filteredApplications.length} {filteredApplications.length === 1 ? "Application" : "Applications"}
        </p>

        {filteredApplications.length === 0 && (
          <p style={{ color: "#9c9384" }}>No applications match this filter.</p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {filteredApplications.map((app) => (

    
            <div key={app.id} style={{ background: "#ffffff", border: "1px solid #D8D2C2", borderRadius: "10px", padding: "20px" }}>
              {editingId === app.id ? (
                <>
                  <input value={editCompany} onChange={(e) => setEditCompany(e.target.value)} style={{ ...inputStyle, width: "100%", marginBottom: "8px" }} />
                  <input value={editRoleTitle} onChange={(e) => setEditRoleTitle(e.target.value)} style={{ ...inputStyle, width: "100%", marginBottom: "8px" }} />
                  <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} style={{ ...inputStyle, width: "100%", marginBottom: "12px" }} />
                  <button onClick={() => handleSaveEdit(app.id)} style={primaryBtnStyle}>Save</button>
                  <button onClick={() => setEditingId(null)} style={{ ...secondaryBtnStyle, marginLeft: "8px" }}>Cancel</button>
                </>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                    <div>
                      <div style={{ fontSize: "17px", fontWeight: 600, color: "#1B2430" }}>{app.company}</div>
                      <div style={{ fontSize: "14px", color: "#6b6355" }}>{app.role_title}</div>
                    </div>
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: "11px",
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        border: "1.5px solid #B8451A",
                        color: "#B8451A",
                        borderRadius: "999px",
                        padding: "4px 12px",
                        transform: "rotate(-3deg)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {app.status}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <select value={app.status} onChange={(e) => handleStatusChange(app.id, e.target.value)} style={{ ...inputStyle, padding: "6px 10px", fontSize: "13px" }}>
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <button onClick={() => startEditing(app)} style={secondaryBtnStyle}>Edit</button>
                    <button onClick={() => handleDelete(app.id)} style={secondaryBtnStyle}>Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

const inputStyle = {
  border: "1px solid #D8D2C2",
  borderRadius: "6px",
  padding: "10px 12px",
  fontFamily: "Inter, sans-serif",
  fontSize: "14px",
  color: "#1B2430",
  background: "#F7F4EC",
  outline: "none",
};

const primaryBtnStyle = {
  background: "#1B2430",
  color: "#F7F4EC",
  border: "none",
  borderRadius: "6px",
  padding: "10px 20px",
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: "13px",
  cursor: "pointer",
};

const secondaryBtnStyle = {
  background: "none",
  border: "1px solid #D8D2C2",
  color: "#5B5346",
  borderRadius: "6px",
  padding: "8px 14px",
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: "12px",
  cursor: "pointer",
};