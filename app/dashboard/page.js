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
  const [jobDescription, setJobDescription] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editCompany, setEditCompany] = useState("");
  const [editRoleTitle, setEditRoleTitle] = useState("");
  const [editJobId, setEditJobId] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editPostingUrl, setEditPostingUrl] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editJobDescription, setEditJobDescription] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");
  const [analyzingId, setAnalyzingId] = useState(null);

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
        job_description: jobDescription || null,
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
      setJobDescription("");
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
    setEditJobId(app.job_id || "");
    setEditLocation(app.location || "");
    setEditPostingUrl(app.posting_url || "");
    setEditNotes(app.notes || "");
    setEditJobDescription(app.job_description || "");
  }

  async function handleSaveEdit(id) {
    const { error } = await supabase
      .from("applications")
      .update({
        company: editCompany,
        role_title: editRoleTitle,
        job_id: editJobId || null,
        location: editLocation || null,
        posting_url: editPostingUrl || null,
        notes: editNotes || null,
        job_description: editJobDescription || null,
      })
      .eq("id", id);

    if (!error) {
      setApplications(
        applications.map((app) =>
          app.id === id
            ? {
                ...app,
                company: editCompany,
                role_title: editRoleTitle,
                job_id: editJobId || null,
                location: editLocation || null,
                posting_url: editPostingUrl || null,
                notes: editNotes || null,
                job_description: editJobDescription || null,
              }
            : app
        )
      );
      setEditingId(null);
    } else {
      alert(error.message);
    }
  }

  async function handleDelete(id) {
    const { error } = await supabase.from("applications").delete().eq("id", id);
    if (!error) {
      setApplications(applications.filter((app) => app.id !== id));
    }
  }

  async function handleAnalyze(app) {
    if (!app.job_description || !app.job_description.trim()) return;

    setAnalyzingId(app.id);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: app.job_description,
          roleTitle: app.role_title,
          company: app.company,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.error || "Analysis failed. Try again in a moment.");
        return;
      }

      const { error } = await supabase
        .from("applications")
        .update({ ai_analysis: result })
        .eq("id", app.id);

      if (!error) {
        setApplications((apps) =>
          apps.map((a) => (a.id === app.id ? { ...a, ai_analysis: result } : a))
        );
      } else {
        alert(error.message);
      }
    } catch (err) {
      alert("Something went wrong reaching the analyzer.");
    } finally {
      setAnalyzingId(null);
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
          <div className="form-grid" style={{ gap: "12px", marginBottom: "12px" }}>
            <input placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} style={inputStyle} />
            <input placeholder="Role Title" value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} style={inputStyle} />
            <input placeholder="Job ID (optional)" value={jobId} onChange={(e) => setJobId(e.target.value)} style={inputStyle} />
            <input placeholder="Location (optional)" value={location} onChange={(e) => setLocation(e.target.value)} style={inputStyle} />
          </div>
          <input placeholder="Posting URL (optional)" value={postingUrl} onChange={(e) => setPostingUrl(e.target.value)} style={{ ...inputStyle, width: "100%", marginBottom: "12px" }} />
          <textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ ...inputStyle, width: "100%", marginBottom: "12px", minHeight: "60px", resize: "vertical" }} />
          <textarea
            placeholder="Paste the job description here (optional) — lets you run an AI fit analysis after adding"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            style={{ ...inputStyle, width: "100%", marginBottom: "16px", minHeight: "80px", resize: "vertical" }}
          />
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
                  <input placeholder="Company" value={editCompany} onChange={(e) => setEditCompany(e.target.value)} style={{ ...inputStyle, width: "100%", marginBottom: "8px" }} />
                  <input placeholder="Role Title" value={editRoleTitle} onChange={(e) => setEditRoleTitle(e.target.value)} style={{ ...inputStyle, width: "100%", marginBottom: "8px" }} />
                  <div className="form-grid" style={{ gap: "8px", marginBottom: "8px" }}>
                    <input placeholder="Job ID (optional)" value={editJobId} onChange={(e) => setEditJobId(e.target.value)} style={inputStyle} />
                    <input placeholder="Location (optional)" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} style={inputStyle} />
                  </div>
                  <input placeholder="Posting URL (optional)" value={editPostingUrl} onChange={(e) => setEditPostingUrl(e.target.value)} style={{ ...inputStyle, width: "100%", marginBottom: "8px" }} />
                  <textarea placeholder="Notes (optional)" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} style={{ ...inputStyle, width: "100%", marginBottom: "8px", minHeight: "60px", resize: "vertical" }} />
                  <textarea placeholder="Job description (optional)" value={editJobDescription} onChange={(e) => setEditJobDescription(e.target.value)} style={{ ...inputStyle, width: "100%", marginBottom: "12px", minHeight: "80px", resize: "vertical" }} />
                  <button onClick={() => handleSaveEdit(app.id)} style={primaryBtnStyle}>Save</button>
                  <button onClick={() => setEditingId(null)} style={{ ...secondaryBtnStyle, marginLeft: "8px" }}>Cancel</button>
                </>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                    <div>
                      <div style={{ fontSize: "17px", fontWeight: 600, color: "#1B2430" }}>{app.company}</div>
                      <div style={{ fontSize: "14px", color: "#6b6355" }}>{app.role_title}</div>
                      {(app.location || app.job_id) && (
                        <div style={{ fontSize: "12px", color: "#9c9384", marginTop: "4px" }}>
                          {app.location}
                          {app.location && app.job_id ? "  ·  " : ""}
                          {app.job_id ? `ID: ${app.job_id}` : ""}
                        </div>
                      )}
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

                  {app.posting_url && (
                    <a
                      href={app.posting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-block",
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: "12px",
                        color: "#B8451A",
                        textDecoration: "underline",
                        marginBottom: "10px",
                      }}
                    >
                      View posting ↗
                    </a>
                  )}

                  {app.notes && (
                    <p style={{ fontSize: "13px", color: "#5B5346", marginTop: 0, marginBottom: "12px", whiteSpace: "pre-wrap" }}>
                      {app.notes}
                    </p>
                  )}

                  {app.job_description && (
                    <div style={{ marginBottom: "12px" }}>
                      {app.ai_analysis ? (
                        <AnalysisCard analysis={app.ai_analysis} />
                      ) : null}
                      <button
                        onClick={() => handleAnalyze(app)}
                        disabled={analyzingId === app.id}
                        style={{
                          ...secondaryBtnStyle,
                          marginTop: app.ai_analysis ? "8px" : 0,
                          opacity: analyzingId === app.id ? 0.6 : 1,
                          cursor: analyzingId === app.id ? "default" : "pointer",
                        }}
                      >
                        {analyzingId === app.id
                          ? "Analyzing..."
                          : app.ai_analysis
                          ? "Re-analyze fit"
                          : "Analyze fit"}
                      </button>
                    </div>
                  )}

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

function AnalysisCard({ analysis }) {
  const { matchScore, strengths = [], gaps = [], tailoringTip } = analysis;

  return (
    <div style={{ background: "#F7F4EC", border: "1px solid #D8D2C2", borderRadius: "8px", padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "0.05em", textTransform: "uppercase", color: "#6B7A5E" }}>
          AI Fit Analysis
        </span>
        {typeof matchScore === "number" && (
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "11px",
              fontWeight: 700,
              color: "#B8451A",
              border: "1px solid #B8451A",
              borderRadius: "999px",
              padding: "2px 10px",
            }}
          >
            {matchScore}/10
          </span>
        )}
      </div>

      {strengths.length > 0 && (
        <div style={{ marginBottom: "8px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#1B2430", marginBottom: "4px" }}>Strengths</div>
          <ul style={{ margin: 0, paddingLeft: "18px" }}>
            {strengths.map((s, i) => (
              <li key={i} style={{ fontSize: "13px", color: "#5B5346", marginBottom: "2px" }}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {gaps.length > 0 && (
        <div style={{ marginBottom: "8px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#1B2430", marginBottom: "4px" }}>Gaps</div>
          <ul style={{ margin: 0, paddingLeft: "18px" }}>
            {gaps.map((g, i) => (
              <li key={i} style={{ fontSize: "13px", color: "#5B5346", marginBottom: "2px" }}>{g}</li>
            ))}
          </ul>
        </div>
      )}

      {tailoringTip && (
        <div>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#1B2430", marginBottom: "4px" }}>Resume Tip</div>
          <p style={{ fontSize: "13px", color: "#5B5346", margin: 0, fontStyle: "italic" }}>{tailoringTip}</p>
        </div>
      )}
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
