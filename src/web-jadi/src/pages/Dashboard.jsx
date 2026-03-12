import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";

function Dashboard() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]); 
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All"); 
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false); 
    
    // State User
    const [username, setUsername] = useState("User");
    const [userRole, setUserRole] = useState(""); 

    // State Form Checkout
    const [paymentMethod, setPaymentMethod] = useState("");
    const [shippingCost, setShippingCost] = useState(0);
    const [customerName, setCustomerName] = useState("");
    const [address, setAddress] = useState("");

    const navigate = useNavigate();

    // --- FUNGSI PEMBEDAH TOKEN JWT ---
    const getDataFromToken = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    };

    // --- FUNGSI AMBIL DATA ---
    const fetchData = async () => {
        const token = localStorage.getItem("token");
        try {
            if (token) {
                const userData = getDataFromToken(token);
                if (userData) {
                    const nameToShow = userData.fullname || userData.username || "User";
                    setUsername(nameToShow);
                    
                    const roleToShow = userData.role ? userData.role.toLowerCase() : "kasir";
                    setUserRole(roleToShow); 
                }
            }

            const [resProd, resCat] = await Promise.all([
                fetch("http://localhost:5000/products", { headers: { "Authorization": `Bearer ${token}` } }),
                fetch("http://localhost:5000/categories", { headers: { "Authorization": `Bearer ${token}` } })
            ]);
            
            if (resProd.ok) setProducts(await resProd.json());
            if (resCat.ok) setCategories(await resCat.json()); 
        } catch (error) { 
            console.error("Fetch error:", error); 
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { 
            navigate("/"); 
            return; 
        }
        fetchData();
    }, [navigate]);

    // --- LOGIKA KERANJANG ---
    const addToCart = (product) => {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            if (existing.qty >= product.stock) {
                alert(`Maaf, stok ${product.name} hanya tersisa ${product.stock} pcs.`);
                return;
            }
            setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
        } else {
            if (product.stock <= 0) {
                alert("Maaf, stok barang ini sedang habis.");
                return;
            }
            setCart([...cart, { ...product, qty: 1 }]);
        }
        setIsCartOpen(true);
    };

    const removeFromCart = (productId) => {
        const existing = cart.find(item => item.id === productId);
        if (existing.qty === 1) {
            setCart(cart.filter(item => item.id !== productId));
        } else {
            setCart(cart.map(item => item.id === productId ? { ...item, qty: item.qty - 1 } : item));
        }
    };

    const deleteFromCart = (productId) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        (selectedCategory === "All" || p.category_id === selectedCategory)
    );

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    const handleConfirmPayment = async () => {
        if (!paymentMethod || shippingCost === 0 || !customerName || !address) {
            alert("Harap lengkapi data pengiriman & pembayaran!");
        return;
        }
    
        const token = localStorage.getItem("token");
        const userData = getDataFromToken(token); 
        const userId = userData ? userData.id : null; 

        if (!userId) {
            alert("Sesi habis, silakan login kembali.");
        return;
        }

    try {
        const response = await fetch("http://localhost:5000/transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({
                total_amount: totalPrice + shippingCost,
                payment_method: paymentMethod,
                user_id: userId, 
                items: cart.map(item => ({ id: parseInt(item.id), qty: parseInt(item.qty) }))
            }),
        });

            if (response.ok) {
                alert("✨ Transaksi Berhasil!");
                setCart([]); setIsCheckoutOpen(false); fetchData(); 
            } else {
                const errorData = await response.json();
                alert("Gagal: " + (errorData.error || "Kesalahan."));
            }
        } catch (error) { alert("Gagal koneksi server."); }
    };

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)", padding: "30px 20px", fontFamily: "'Poppins', sans-serif" }}>
            <div style={{ 
                background: "rgba(255, 255, 255, 0.3)", backdropFilter: isCheckoutOpen ? "blur(5px)" : "blur(20px)", opacity: isCheckoutOpen ? 0.4 : 1, borderRadius: "30px",
                maxWidth: "1200px", margin: "0 auto", padding: "35px", border: "1px solid rgba(255, 255, 255, 0.4)", transition: "0.4s all ease", boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
            }}>
                
                {/* HEADER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1 style={{ color: '#444', fontWeight: '900', margin: 0, letterSpacing: '-1.5px', fontSize: '32px' }}>
                        AYLA <span style={{color: '#6a11cb'}}>COLLECTION.</span>
                    </h1>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', position: 'relative' }}>
                        <button onClick={() => setIsCartOpen(true)} style={navBtnStyle}>🛒 Cart ({cart.reduce((a, b) => a + b.qty, 0)})</button>
                        
                        <div style={{ position: 'relative' }}>
                            <button 
                                onClick={() => setIsProfileOpen(!isProfileOpen)} 
                                style={{ ...navBtnStyle, background: '#6a11cb', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'capitalize' }}
                            >
                                👤 {userRole}: {username} <span style={{fontSize: '10px'}}>{isProfileOpen ? '▲' : '▼'}</span>
                            </button>

                            {isProfileOpen && (
                                <div style={dropdownContainerStyle}>
                                    <button onClick={() => {navigate("/dashboard"); setIsProfileOpen(false);}} style={dropdownItemStyle}>🏠 Dashboard</button>
                                    
                                    {/* MENU KHUSUS ADMIN */}
                                    {userRole === "admin" && (
                                        <>
                                            <button onClick={() => {navigate("/user-admin"); setIsProfileOpen(false);}} style={dropdownItemStyle}>🔑 Kelola User</button>
                                            <button onClick={() => {navigate("/kelola-produk"); setIsProfileOpen(false);}} style={dropdownItemStyle}>📦 Kelola Produk</button>
                                        </>
                                    )}

                                    <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '5px 0' }} />
                                    <button onClick={handleLogout} style={{ ...dropdownItemStyle, color: '#ff4b5c' }}>🚪 Logout</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* SEARCH & FILTER */}
                <div style={{ marginBottom: '30px' }}>
                    <input type="text" placeholder="Cari product..." onChange={(e) => setSearchTerm(e.target.value)} style={searchInputStyle} />
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px' }}>
                        <button onClick={() => setSelectedCategory("All")} style={catBtnStyle(selectedCategory === "All")}>Semua</button>
                        {categories.map(cat => (
                            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} style={catBtnStyle(selectedCategory === cat.id)}>{cat.name}</button>
                        ))}
                    </div>
                </div>

                {/* GRID PRODUK */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "25px" }}>
                    {filteredProducts.map(item => (
                        <div key={item.id} style={{ position: 'relative' }}>
                            <ProductCard {...item} title={item.name} onAdd={() => addToCart(item)} />
                            <div style={stockBadgeStyle(item.stock)}>
                                {item.stock > 0 ? `Stok: ${item.stock}` : 'Habis'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MODAL KERANJANG & CHECKOUT */}
            {isCartOpen && (
                <div style={cartContainerStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ margin: 0, fontWeight: '800', fontSize: '20px' }}>My Bag</h2>
                        <button onClick={() => setIsCartOpen(false)} style={closeBtnStyle}>&times;</button>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {cart.length === 0 ? <p style={{textAlign: 'center', color: '#888'}}>Keranjang kosong</p> : cart.map(item => (
                            <div key={item.id} style={cartItemStyle}>
                                <img src={item.image} alt="" style={{ width: '50px', height: '50px', borderRadius: '10px', objectFit: 'cover' }} />
                                <div style={{ flex: 1, marginLeft: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <h4 style={{ margin: 0, fontSize: '13px' }}>{item.name}</h4>
                                        <span onClick={() => deleteFromCart(item.id)} style={{ color: '#ff4d4d', cursor: 'pointer', fontSize: '12px' }}>Hapus</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                                        <button onClick={() => removeFromCart(item.id)} style={qtyBtnStyle}>-</button>
                                        <span>{item.qty}</span>
                                        <button onClick={() => addToCart(item)} style={qtyBtnStyle}>+</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ borderTop: '2px solid #eee', paddingTop: '15px' }}>
                        <h4 style={{ display: 'flex', justifyContent: 'space-between' }}>Total: <span>Rp {totalPrice.toLocaleString()}</span></h4>
                        <button disabled={cart.length === 0} onClick={() => { setShippingCost(0); setIsCartOpen(false); setIsCheckoutOpen(true); }} style={{...checkoutBtnStyle, opacity: cart.length === 0 ? 0.5 : 1}}>Checkout Now</button>
                    </div>
                </div>
            )}

            {isCheckoutOpen && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentWrapperStyle}>
                        <button onClick={() => setIsCheckoutOpen(false)} style={closeModalBtnStyle}>&times;</button>
                        <h3 style={{ textAlign: 'center', fontWeight: '800', marginBottom: '20px', fontSize: '20px' }}>Shipping Details</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <input type="text" placeholder="Nama Lengkap" style={inputS} onChange={(e) => setCustomerName(e.target.value)} />
                            <textarea placeholder="Alamat Lengkap" style={{ ...inputS, height: '80px', resize: 'none' }} onChange={(e) => setAddress(e.target.value)} />
                            <select style={inputS} onChange={(e) => setShippingCost(Number(e.target.value))}>
                                <option value="0">-- Pilih Ekspedisi --</option>
                                <option value="15000">JNE (Rp 15,000)</option>
                                <option value="10000">J&T Express (Rp 10,000)</option>
                                <option value="8000">Anteraja (Rp 8,000)</option>
                            </select>
                        </div>
                        <div style={{ marginTop: '20px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Metode Pembayaran</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                                <button onClick={() => setPaymentMethod("Cash")} style={payBtnStyle(paymentMethod === "Cash")}>💵 Cash</button>
                                <button onClick={() => setPaymentMethod("Debit")} style={payBtnStyle(paymentMethod === "Debit")}>💳 Debit</button>
                            </div>
                        </div>
                        <div style={summaryBoxStyle}>
                            <div style={flexSpace}>
                                <span>Total Harga Barang:</span> 
                                <span>Rp {totalPrice.toLocaleString()}</span>
                            </div>
                            <div style={flexSpace}>
                                <span>Biaya Pengiriman:</span> 
                                <span>Rp {shippingCost.toLocaleString()}</span>
                            </div>
                                <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '10px 0' }} />
                            <div style={flexSpace}>
                                <span style={{ fontWeight: 'bold' }}>Total Bayar:</span> 
                                <span style={{ fontWeight: '800', color: '#6a11cb' }}>
                                Rp {(totalPrice + shippingCost).toLocaleString()}
                                </span>
                            </div>
                        </div>
                        <button onClick={handleConfirmPayment} style={confirmBtnStyle}>Konfirmasi & Bayar</button>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- STYLES ---
const navBtnStyle = { background: 'white', border: 'none', padding: '10px 20px', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold', color: '#6a11cb' };
const dropdownContainerStyle = { position: 'absolute', top: '55px', right: 0, background: 'white', borderRadius: '15px', padding: '10px', width: '180px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 3000, display: 'flex', flexDirection: 'column', gap: '5px' };
const dropdownItemStyle = { background: 'none', border: 'none', padding: '10px', textAlign: 'left', cursor: 'pointer', fontWeight: '600', fontSize: '14px', borderRadius: '8px', width: '100%', color: '#444' };
const catBtnStyle = (active) => ({ padding: '8px 18px', borderRadius: '20px', border: 'none', cursor: 'pointer', background: active ? '#6a11cb' : 'rgba(255,255,255,0.5)', color: active ? 'white' : '#444', fontWeight: 'bold' });
const searchInputStyle = { padding: '12px 20px', width: '100%', maxWidth: '350px', borderRadius: '15px', border: 'none', background: 'rgba(255,255,255,0.6)', outline: 'none' };
const qtyBtnStyle = { width: '24px', height: '24px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer', background: 'white' };
const inputS = { padding: '12px', borderRadius: '10px', border: '1px solid #ddd', width: '100%', boxSizing: 'border-box' };
const flexSpace = { display: 'flex', justifyContent: 'space-between' };
const payBtnStyle = (active) => ({ padding: '10px', borderRadius: '10px', border: active ? '2px solid #6a11cb' : '1px solid #eee', cursor: 'pointer', background: active ? '#f3efff' : '#fff' });
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(5px)' };
const modalContentWrapperStyle = { background: 'white', padding: '30px', borderRadius: '25px', width: '380px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' };
const closeModalBtnStyle = { position: 'absolute', right: '15px', top: '15px', background: '#eee', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontSize: '18px' };
const cartContainerStyle = { position: 'fixed', top: '20px', right: '20px', width: '350px', maxHeight: '85vh', background: 'white', padding: '25px', borderRadius: '25px', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', zIndex: 1000 };
const cartItemStyle = { display: 'flex', alignItems: 'center', marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #f9f9f9' };
const summaryBoxStyle = { padding: '15px', background: '#f9f7ff', borderRadius: '15px', marginTop: '20px', border: '1.5px dashed #6a11cb' };
const closeBtnStyle = { background: '#eee', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer' };
const checkoutBtnStyle = { width: '100%', background: 'linear-gradient(to right, #6a11cb, #2575fc)', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' };
const confirmBtnStyle = { width: '100%', background: 'linear-gradient(to right, #6a11cb, #2575fc)', color: 'white', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' };
const stockBadgeStyle = (stock) => ({ position: 'absolute', top: '10px', right: '10px', background: stock > 0 ? 'rgba(255,255,255,0.9)' : '#ff4d4d', padding: '4px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold', color: stock > 0 ? '#6a11cb' : 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' });

export default Dashboard;