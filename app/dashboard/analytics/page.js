"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("/api/applications/stats")
      .then((res) => res.json())
      .then((data) => setStats(data));
  }, []);

  if (!stats) return <p>Loading...</p>;

  const chartData = Object.entries(stats).map(([status, count]) => ({
    status,
    count,
  }));

  return (
    <div style={{ padding: "40px" }}>
      <Link href="/dashboard" style={{ color: "#B8451A", textDecoration: "none", fontFamily: "'IBM Plex Mono', monospace", fontSize: "13px" }}>
        ← Back to Dashboard
      </Link>
      <h1>Application Funnel</h1>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <XAxis dataKey="status" />
          <YAxis allowDecimals={false} />
          <Bar dataKey="count" fill="#B8451A" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}