import React from 'react';

function ProductCard({ title, description, price, image, onAdd }) {
    const fallbackImage = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=400";
    
    // Logic untuk menentukan URL gambar
    const imageUrl = image ? (image.startsWith('http') ? image : `http://localhost:5000/uploads/${image}`) : fallbackImage;

    return (
        <div style={{ backgroundColor: "rgba(255, 255, 255, 0.85)", borderRadius: "24px", overflow: "hidden", boxShadow: "0 8px 20px rgba(0,0,0,0.05)", transition: "0.3s" }}>
            <img 
                src={imageUrl} 
                alt={title} 
                style={{ width: "100%", height: "200px", objectFit: "cover" }} 
                onError={(e) => { e.target.src = fallbackImage; }}
            />
            <div style={{ padding: "20px" }}>
                <h4 style={{ margin: "0 0 5px 0", color: "#333" }}>{title}</h4>
                <p style={{ fontSize: "12px", color: "#777", height: "30px", overflow: "hidden" }}>{description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                    <span style={{ fontWeight: "800", color: "#2d3436" }}>Rp {Number(price).toLocaleString()}</span>
                    <button 
                        onClick={onAdd}
                        style={{ background: "linear-gradient(to right, #6a11cb, #2575fc)", color: "white", border: "none", padding: "8px 15px", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", fontSize: "12px" }}
                    >
                        + Tambah
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;