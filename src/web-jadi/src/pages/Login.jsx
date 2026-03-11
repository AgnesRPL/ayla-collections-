import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem("token", data.token);
                navigate("/dashboard");
            } else {
                alert("Opps! Username atau password salah.");
            }
        } catch (error) {
            alert("Koneksi gagal. Pastikan server backend menyala.");
        }
    };

    const containerStyle = {
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)",
        fontFamily: "'Poppins', sans-serif"
    };

    const cardStyle = {
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(10px)",
        padding: "50px",
        borderRadius: "30px",
        boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
        width: "350px",
        textAlign: "center"
    };

    const inputStyle = {
        width: "100%",
        padding: "12px 15px",
        margin: "10px 0",
        borderRadius: "12px",
        border: "1px solid #ddd",
        outline: "none",
        boxSizing: "border-box",
        fontSize: "14px"
    };

    const buttonStyle = {
        width: "100%",
        padding: "12px",
        marginTop: "20px",
        borderRadius: "12px",
        border: "none",
        background: "linear-gradient(to right, #6a11cb, #2575fc)",
        color: "white",
        fontWeight: "600",
        cursor: "pointer",
        boxShadow: "0 5px 15px rgba(37, 117, 252, 0.3)"
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <h2 style={{ color: "#444", marginBottom: "30px", fontWeight: "700" }}>Welcome Back</h2>
                <form onSubmit={handleLogin} autoComplete="off"> {/* Mematikan autocomplete pada form secara keseluruhan */}
                    <input 
                        type="text" 
                        placeholder="Username" 
                        autoComplete="off" // Mematikan autocomplete untuk username
                        onChange={(e) => setUsername(e.target.value)} 
                        style={inputStyle} 
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        autoComplete="new-password" 
                        onChange={(e) => setPassword(e.target.value)} 
                        style={inputStyle} 
                    />
                    <button type="submit" style={buttonStyle}>Sign In</button>
                </form>
                <p style={{ fontSize: "12px", color: "#888", marginTop: "20px" }}>Experience the New Standard of Fashion</p>
            </div>
        </div>
    );
}

export default Login;