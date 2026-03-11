import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./KelolaProduk.css";

function KelolaProduk() {
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState({ 
        id: "", 
        category_id: "", 
        name: "", 
        price: "", 
        stock: "", 
        description: "", 
        image: "" 
    });
    const [isEdit, setIsEdit] = useState(false);
    const navigate = useNavigate();

    const fetchProducts = async () => {
        try {
            const res = await fetch("http://localhost:5000/products");
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error("Gagal mengambil data produk", err);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        const url = isEdit 
            ? `http://localhost:5000/products/${form.id}` 
            : "http://localhost:5000/products";
        const method = isEdit ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                alert(isEdit ? "✨ Produk diperbarui!" : "✨ Produk berhasil ditambah!");
                resetForm();
                fetchProducts();
            }
        } catch (err) {
            alert("Gagal memproses produk");
        }
    };

    const handleEditClick = (product) => {
        setForm(product);
        setIsEdit(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Apakah anda yakin ingin menghapus produk ini?")) {
            try {
                const res = await fetch(`http://localhost:5000/products/${id}`, {
                    method: "DELETE",
                });
                if (res.ok) {
                    fetchProducts();
                }
            } catch (err) {
                alert("Gagal menghapus produk");
            }
        }
    };

    const resetForm = () => {
        setForm({ id: "", category_id: "", name: "", price: "", stock: "", description: "", image: "" });
        setIsEdit(false);
    };

    return (
        <div className="kelola-container">
            <div className="kelola-glass-card">
                <div className="kelola-header">
                    <h1>Product Management</h1>
                    <button className="btn-dash" onClick={() => navigate("/dashboard")}>🏠 Dashboard</button>
                </div>

                <div className="kelola-content">
                    <div className="kelola-form-box">
                        <h3>{isEdit ? "✏️ Edit Produk" : "Tambah Produk Baru"}</h3>
                        <form onSubmit={handleSave}>
                            <input type="number" placeholder="Category ID" value={form.category_id} onChange={(e) => setForm({...form, category_id: e.target.value})} required />
                            <input type="text" placeholder="Nama Produk" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
                            <input type="number" placeholder="Harga" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} required />
                            <input type="number" placeholder="Stok" value={form.stock} onChange={(e) => setForm({...form, stock: e.target.value})} required />
                            <textarea placeholder="Deskripsi Produk" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows="3"></textarea>
                            <input type="text" placeholder="URL Gambar" value={form.image} onChange={(e) => setForm({...form, image: e.target.value})} />
                            
                            <div className="btn-group">
                                <button type="submit" className="btn-primary">{isEdit ? "Update Produk" : "Simpan Produk"}</button>
                                {isEdit && <button type="button" className="btn-cancel" onClick={resetForm}>Batal</button>}
                            </div>
                        </form>
                    </div>

                    <div className="kelola-table-box">
                        <h3>Daftar Katalog Produk</h3>
                        <div className="table-scroll">
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Gambar</th>
                                        <th>Nama</th>
                                        <th>Harga</th>
                                        <th>Stok</th>
                                        <th>Deskripsi</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((p) => (
                                        <tr key={p.id}>
                                            <td>{p.id}</td>
                                            <td><img src={p.image} alt="product" className="img-p" onError={(e) => e.target.src='https://via.placeholder.com/50'} /></td>
                                            <td><b>{p.name}</b><br/><small>Cat: {p.category_id}</small></td>
                                            <td>Rp {parseInt(p.price).toLocaleString()}</td>
                                            <td>{p.stock}</td>
                                            <td><div className="desc-text">{p.description}</div></td>
                                            <td>
                                                <div className="action-cell">
                                                    <button className="btn-edit" onClick={() => handleEditClick(p)}>Edit</button>
                                                    <button className="btn-delete" onClick={() => handleDelete(p.id)}>Hapus</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default KelolaProduk;