import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./UserAdmin.css";

function UserAdmin() {
    const [users, setUsers] = useState([]);
    const [username, setUsername] = useState("");
    const [fullname, setFullname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("Admin");
    
    const navigate = useNavigate();

    // Fungsi ambil data
    const fetchUsers = async () => {
        try {
            const response = await fetch("http://localhost:5000/users");
            if (!response.ok) throw new Error("Gagal ambil data");
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5000/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, fullname, email, password, role }),
            });
            if (response.ok) {
                alert("User Berhasil Ditambah!");
                setUsername(""); setFullname(""); setEmail(""); setPassword("");
                fetchUsers();
            } else {
                alert("Gagal menambah user");
            }
        } catch (error) {
            alert("Kesalahan Server");
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            const response = await fetch(`http://localhost:5000/users/${id}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_active: !currentStatus }),
            });
            if (response.ok) fetchUsers();
        } catch (error) {
            alert("Gagal update status");
        }
    };

    return (
        <div className="admin-container">
            <div className="admin-card-large">
                <div className="admin-header-flex">
                    <h1 className="admin-title-main">Users Management</h1>
                    <button className="btn-dash" onClick={() => navigate("/dashboard")}>🏠 Dashboard</button>
                </div>

                <div className="admin-grid">
                    {/* FORM */}
                    <div className="form-section">
                        <h3>Tambah User Baru</h3>
                        <form onSubmit={handleRegister} className="user-form-layout">
                            <input type="text" placeholder="Fullname" value={fullname} onChange={(e) => setFullname(e.target.value)} required />
                            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            <select value={role} onChange={(e) => setRole(e.target.value)}>
                                <option value="Admin">Admin</option>
                                <option value="Kasir">Kasir</option>
                            </select>
                            <button type="submit" className="submit-user-btn">Simpan User</button>
                        </form>
                    </div>

                    {/* TABEL */}
                    <div className="table-section">
                        <h3>Daftar User Database</h3>
                        <div className="table-scroll">
                            <table className="user-table">
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Fullname</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length > 0 ? (
                                        users.map((u) => (
                                            <tr key={u.id}>
                                                <td>{u.username}</td>
                                                <td>{u.email}</td>
                                                <td><span className={`badge ${u.role ? u.role.toLowerCase() : ""}`}>{u.role}</span></td>
                                                <td><b>{u.fullname}</b></td>
                                                <td>
                                                    <span className={u.is_active ? "txt-active" : "txt-inactive"}>
                                                        {u.is_active ? "● Active" : "● Inactive"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button 
                                                        onClick={() => toggleStatus(u.id, u.is_active)}
                                                        className={u.is_active ? "btn-matikan" : "btn-aktifkan"}
                                                    >
                                                        {u.is_active ? "Matikan" : "Aktifkan"}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="8" style={{textAlign:'center'}}>Tidak ada data user</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserAdmin;