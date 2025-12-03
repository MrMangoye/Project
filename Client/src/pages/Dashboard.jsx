import React, { useEffect, useState } from "react";
import API from "../services/api.js";
import AddMember from "../components/AddMember";

function Dashboard() {
  const [family, setFamily] = useState(null);
  const [error, setError] = useState("");
  const [showAddMember, setShowAddMember] = useState(false); // ✅ toggle state

  // ✅ reusable fetch function
  const fetchFamily = () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    let user = null;
    try {
      user = JSON.parse(userStr);
    } catch {}

    if (!token) {
      setError("Missing authentication token.");
      return;
    }
    if (!user?.familyId) {
      setError("No family linked to this account yet.");
      return;
    }

    API.get(`/api/family/families/${user.familyId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => setFamily(res.data))
      .catch((err) => {
        console.error(err);
        setError("Failed to load family data");
      });
  };

  useEffect(() => {
    fetchFamily();
  }, []);

  return (
    <div className="container">
      <h1>Dashboard</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {family ? (
        <div>
          <h2>Family: {family.name}</h2>
          <p>Description: {family.description || "No description provided"}</p>
          <h3>Members:</h3>

          {family.members && family.members.length > 0 ? (
            <ul className="grid">
              {family.members.map((m) => (
                <li key={m._id} className="card">
                  <strong>{m.name}</strong> — {m.occupation || "No occupation"}

                  {/* ✅ Show parents */}
                  {m.relationships?.parent?.length > 0 && (
                    <p>Parents: {m.relationships.parent.map(p => p.name).join(", ")}</p>
                  )}

                  {/* ✅ Show spouses */}
                  {m.relationships?.spouse?.length > 0 && (
                    <p>Spouses: {m.relationships.spouse.map(s => s.name).join(", ")}</p>
                  )}

                  {/* ✅ Show siblings */}
                  {m.relationships?.sibling?.length > 0 && (
                    <p>Siblings: {m.relationships.sibling.map(s => s.name).join(", ")}</p>
                  )}

                  {/* ✅ Show children */}
                  {m.relationships?.child?.length > 0 && (
                    <p>Children: {m.relationships.child.map(c => c.name).join(", ")}</p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No members yet.</p>
          )}

          <button
            className="primary"
            onClick={() => setShowAddMember((prev) => !prev)}
          >
            {showAddMember ? "Hide Add Member" : "Add Member"}
          </button>

          {showAddMember && (
            <div className="card">
              <h3>Add a new member</h3>
              {/* ✅ pass callback to refresh after adding */}
              <AddMember familyId={family._id} onMemberAdded={fetchFamily} />
            </div>
          )}
        </div>
      ) : (
        !error && <p>Loading family data...</p>
      )}
    </div>
  );
}

export default Dashboard;