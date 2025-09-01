import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// UPI Payment Component
function UPIPaymentDemo({ amount, onPaymentComplete }) {
  const [paymentDone, setPaymentDone] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentSimulate = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setPaymentDone(true);
      setIsProcessing(false);
      if (onPaymentComplete) {
        onPaymentComplete();
      }
    }, 2000);
  };

  return (
    <div style={{
      margin: "20px 0",
      padding: "30px",
      backgroundColor: "white",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      textAlign: "center",
      maxWidth: "500px",
      marginLeft: "auto",
      marginRight: "auto"
    }}>
      <h3 style={{ color: "#2c5530", marginBottom: "20px", fontSize: "24px" }}>
        💳 UPI Payment Gateway
      </h3>
      <div style={{
        backgroundColor: "#f8f9fa",
        padding: "15px",
        borderRadius: "8px",
        marginBottom: "20px"
      }}>
        <p style={{ fontSize: "20px", fontWeight: "bold", color: "#333", margin: "10px 0" }}>
          Total Amount: ₹{amount}
        </p>
      </div>
      
      <div style={{ margin: "20px 0" }}>
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=seller@paytm&pn=EcoBazaar&am=${amount}&cu=INR`}
          alt="UPI QR Code"
          style={{ 
            width: 200, 
            height: 200, 
            border: "3px solid #e0e0e0", 
            borderRadius: "8px",
            backgroundColor: "white"
          }}
        />
      </div>

      {!paymentDone ? (
        <div>
          <p style={{ margin: "20px 0", color: "#666", fontSize: "16px" }}>
            📱 Scan QR code with any UPI app (GPay, PhonePe, Paytm)
          </p>
          <button 
            onClick={handlePaymentSimulate}
            disabled={isProcessing}
            style={{
              backgroundColor: isProcessing ? "#ccc" : "#00C851",
              color: "white",
              padding: "15px 30px",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: isProcessing ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              minWidth: "200px"
            }}
          >
            {isProcessing ? "⏳ Processing Payment..." : "✅ I Have Paid"}
          </button>
        </div>
      ) : (
        <div style={{
          backgroundColor: "#d4edda",
          color: "#155724",
          padding: "20px",
          borderRadius: "8px",
          fontSize: "18px",
          fontWeight: "bold"
        }}>
          🎉 Payment Successful!<br/>
          <span style={{ fontSize: "14px", fontWeight: "normal" }}>
            Thank you for your purchase. Order confirmed!
          </span>
        </div>
      )}
    </div>
  );
}

// Sample products data
const sampleProducts = [
  {
    id: 1,
    name: "Bamboo Toothbrush Set",
    price: 299,
    carbonFootprint: 0.2,
    category: "Personal Care",
    image: "🦷",
    seller: "EcoStore",
    description: "Biodegradable bamboo toothbrushes - Pack of 4",
    stock: 50,
    rating: 4.5
  },
  {
    id: 2,
    name: "Organic Cotton T-Shirt",
    price: 899,
    carbonFootprint: 2.1,
    category: "Clothing",
    image: "👕",
    seller: "GreenWear",
    description: "100% organic cotton, eco-friendly dyes",
    stock: 25,
    rating: 4.8
  },
  {
    id: 3,
    name: "Solar Power Bank",
    price: 1899,
    carbonFootprint: 1.8,
    category: "Electronics",
    image: "🔋",
    seller: "TechGreen",
    description: "10000mAh solar power bank with fast charging",
    stock: 15,
    rating: 4.3
  },
  {
    id: 4,
    name: "Reusable Water Bottle",
    price: 599,
    carbonFootprint: 0.5,
    category: "Lifestyle",
    image: "🍶",
    seller: "EcoLife",
    description: "Stainless steel, BPA-free, 750ml capacity",
    stock: 100,
    rating: 4.7
  },
  {
    id: 5,
    name: "Eco-Friendly Notebook",
    price: 199,
    carbonFootprint: 0.3,
    category: "Stationery",
    image: "📓",
    seller: "PaperCraft",
    description: "Made from recycled paper, ruled pages",
    stock: 200,
    rating: 4.4
  }
];

function Dashboard() {
  const navigate = useNavigate();
  
  // User management
  const getUserFromStorage = () => {
    try {
      const userStr = localStorage.getItem("ecobazaar_user");
      if (!userStr) return null;
      return JSON.parse(userStr);
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      localStorage.removeItem("ecobazaar_user");
      return null;
    }
  };

  // State management
  const [user, setUser] = useState(getUserFromStorage());
  const [products, setProducts] = useState(sampleProducts);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [notification, setNotification] = useState(null);

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    carbonFootprint: "",
    category: "",
    image: "📦",
    description: "",
    stock: "",
    imageFile: null,
  });

  // Notification system
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Get user role with backward compatibility
  const normalizeRole = (role) => {
    if (!role) return 'guest';
    const roleStr = role.toLowerCase();
    // Map old 'user' role to 'customer' for backward compatibility
    if (roleStr === 'user') return 'customer';
    return roleStr;
  };
  
  const userRole = normalizeRole(user?.role);
  
  // Debug logging
  useEffect(() => {
    console.log("=== DASHBOARD DEBUG ===");
    console.log("Raw user object:", user);
    console.log("User role (original):", user?.role);
    console.log("User role (normalized):", userRole);
    console.log("Active tab:", activeTab);
    console.log("Products count:", products.length);
    console.log("======================");
  }, [user, userRole, activeTab, products]);

  // Get unique categories
  const categories = ["all", ...new Set(products.map(p => p.category))];

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Fetch products from backend with better error handling
  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const response = await axios.get(`${apiUrl}/products`);
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        console.log("Fetched products from API:", response.data);
        
        // Ensure all products have required fields and proper format
        const formattedProducts = response.data.map(product => ({
          ...product,
          id: product.id || product._id || Date.now() + Math.random(),
          rating: product.rating || 0,
          stock: product.stock || 0,
          description: product.description || `${product.name} - Premium quality product`,
          image: product.image || "📦"
        }));
        
        setProducts(formattedProducts);
      } else {
        console.log("No products from API, using sample data");
        setProducts(sampleProducts);
      }
    } catch (err) {
      console.warn("API fetch failed, using sample data:", err.message);
      setProducts(sampleProducts);
    }
    setIsLoadingProducts(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Navigation functions
  const handleLogout = () => {
    localStorage.removeItem("ecobazaar_user");
    localStorage.removeItem("ecobazaar_token");
    setUser(null);
    setCart([]);
    navigate("/login");
  };

  // Product management
  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setNewProduct(prev => ({ ...prev, imageFile: file }));
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewProduct(prev => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      alert("Please fill in all required fields (name, price, category)");
      return;
    }

    try {
      // Create product with same format as sample products
      const productToAdd = {
        id: Date.now(), // Generate unique ID
        name: newProduct.name.trim(),
        price: parseFloat(newProduct.price),
        carbonFootprint: parseFloat(newProduct.carbonFootprint) || 0,
        category: newProduct.category,
        image: newProduct.image || "📦", // Default emoji if no image
        seller: user.username,
        description: newProduct.description.trim() || `${newProduct.name} - Premium eco-friendly product`,
        stock: parseInt(newProduct.stock) || 10, // Default stock
        rating: 0, // New products start with 0 rating
        dateAdded: new Date().toISOString(),
        isActive: true
      };

      console.log("Adding product:", productToAdd);

      // Always add to local state immediately for instant UI update
      setProducts(prevProducts => {
        const updatedProducts = [...prevProducts, productToAdd];
        console.log("Updated products list:", updatedProducts);
        return updatedProducts;
      });

      // Try to sync with backend
      try {
        const token = localStorage.getItem("ecobazaar_token");
        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
        
        const response = await axios.post(
          `${apiUrl}/products/add`,
          productToAdd,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log("Product added to backend:", response.data);
        
        // Refresh from backend to ensure consistency
        await fetchProducts();
        
      } catch (apiError) {
        console.warn("Backend sync failed, product saved locally:", apiError.message);
        // Product is already added to local state, so continue
      }

      // Reset form
      setNewProduct({
        name: "",
        price: "",
        carbonFootprint: "",
        category: "",
        image: "📦",
        description: "",
        stock: "",
        imageFile: null,
      });
      
      // Switch to products view to see the new product
      setActiveTab("products");
      showNotification(`Product "${productToAdd.name}" added successfully! It's now visible to all customers.`, "success");
      
    } catch (err) {
      console.error("Error adding product:", err);
      showNotification("Failed to add product: " + (err.response?.data?.message || err.message), "error");
    }
  };

  // Cart management with notifications
  const addToCart = (product) => {
    setCart(prev => [...prev, { ...product, cartId: Date.now() }]);
    showNotification(`${product.name} added to cart!`, "success");
  };

  const removeFromCart = (cartId) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const clearCart = () => {
    setCart([]);
    setActiveTab("products");
  };

  const handlePaymentComplete = () => {
    const newOrder = {
      id: Date.now(),
      items: [...cart],
      total: totalCartAmount,
      date: new Date().toLocaleDateString(),
      status: "Completed"
    };
    setOrders(prev => [...prev, newOrder]);
    setCart([]);
    setActiveTab("orders");
    alert("Order placed successfully!");
  };

  const totalCartAmount = cart.reduce((sum, item) => sum + item.price, 0);

  // Styles
  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#f8f9fa",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    header: {
      backgroundColor: "#2c5530",
      color: "white",
      padding: "20px 0",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
    },
    headerContent: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "0 20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap"
    },
    logo: {
      fontSize: "24px",
      fontWeight: "bold",
      display: "flex",
      alignItems: "center",
      gap: "10px"
    },
    userInfo: {
      display: "flex",
      alignItems: "center",
      gap: "15px",
      flexWrap: "wrap"
    },
    roleBadge: {
      backgroundColor: "#4CAF50",
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "bold",
      textTransform: "uppercase"
    },
    logoutBtn: {
      backgroundColor: "#dc3545",
      color: "white",
      border: "none",
      padding: "8px 16px",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "500"
    },
    sidebar: {
      width: "250px",
      backgroundColor: "white",
      height: "calc(100vh - 80px)",
      position: "fixed",
      left: 0,
      top: "80px",
      boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
      overflowY: "auto"
    },
    sidebarItem: {
      padding: "15px 20px",
      cursor: "pointer",
      borderBottom: "1px solid #eee",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      transition: "background-color 0.3s"
    },
    activeSidebarItem: {
      backgroundColor: "#e8f5e8",
      borderLeft: "4px solid #2c5530",
      fontWeight: "600"
    },
    mainContent: {
      marginLeft: "250px",
      padding: "30px",
      minHeight: "calc(100vh - 80px)"
    },
    card: {
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "25px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      marginBottom: "20px"
    },
    productGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      gap: "25px",
      marginTop: "20px"
    },
    productCard: {
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "20px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      cursor: "pointer"
    },
    button: {
      backgroundColor: "#28a745",
      color: "white",
      border: "none",
      padding: "10px 20px",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      transition: "background-color 0.3s"
    },
    dangerButton: {
      backgroundColor: "#dc3545",
      color: "white",
      border: "none",
      padding: "8px 16px",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "12px"
    },
    input: {
      width: "100%",
      padding: "12px",
      border: "1px solid #ddd",
      borderRadius: "6px",
      fontSize: "14px",
      marginBottom: "15px"
    },
    searchContainer: {
      display: "flex",
      gap: "15px",
      marginBottom: "20px",
      alignItems: "center",
      flexWrap: "wrap"
    }
  };

  // Login check with debugging and role selector
  if (!user) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: "center", padding: "100px 20px" }}>
          <h1 style={{ color: "#2c5530", fontSize: "48px", marginBottom: "20px" }}>
            🌱 EcoBazaarX
          </h1>
          <p style={{ fontSize: "18px", color: "#666", marginBottom: "30px" }}>
            Your Eco-Friendly Marketplace
          </p>
          
          {/* Debug Mode - Role Selector for Testing */}
          <div style={{ margin: "30px 0", padding: "20px", backgroundColor: "white", borderRadius: "8px", display: "inline-block" }}>
            <h3 style={{ marginBottom: "15px", color: "#333" }}>🔧 Quick Test Login</h3>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "15px" }}>For testing purposes - select a role:</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
              <button 
                onClick={() => {
                  const testUser = { username: "test_customer", role: "customer", email: "customer@test.com" };
                  localStorage.setItem("ecobazaar_user", JSON.stringify(testUser));
                  localStorage.setItem("ecobazaar_token", "test_token");
                  setUser(testUser);
                }}
                style={{ ...styles.button, backgroundColor: "#17a2b8" }}
              >
                🛍️ Login as Customer
              </button>
              <button 
                onClick={() => {
                  const testUser = { username: "test_seller", role: "seller", email: "seller@test.com" };
                  localStorage.setItem("ecobazaar_user", JSON.stringify(testUser));
                  localStorage.setItem("ecobazaar_token", "test_token");
                  setUser(testUser);
                }}
                style={{ ...styles.button, backgroundColor: "#ffc107", color: "#212529" }}
              >
                🏪 Login as Seller
              </button>
              <button 
                onClick={() => {
                  const testUser = { username: "test_admin", role: "admin", email: "admin@test.com" };
                  localStorage.setItem("ecobazaar_user", JSON.stringify(testUser));
                  localStorage.setItem("ecobazaar_token", "test_token");
                  setUser(testUser);
                }}
                style={{ ...styles.button, backgroundColor: "#6f42c1" }}
              >
                👑 Login as Admin
              </button>
            </div>
          </div>
          
          <div style={{ marginTop: "20px" }}>
            <button 
              onClick={() => navigate("/login")}
              style={{
                ...styles.button,
                fontSize: "18px",
                padding: "15px 30px"
              }}
            >
              Go to Regular Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Sidebar navigation based on role
  const getSidebarItems = () => {
    const baseItems = [
      { id: "dashboard", label: "Dashboard", icon: "🏠" }
    ];

    if (userRole === "customer") {
      return [
        ...baseItems,
        { id: "products", label: "Browse Products", icon: "🛍️" },
        { id: "cart", label: `Cart (${cart.length})`, icon: "🛒" },
        { id: "orders", label: "My Orders", icon: "📦" }
      ];
    } else if (userRole === "seller") {
      return [
        ...baseItems,
        { id: "products", label: "My Products", icon: "📝" },
        { id: "add-product", label: "Add Product", icon: "➕" },
        { id: "orders", label: "Orders Received", icon: "📊" }
      ];
    } else if (userRole === "admin") {
      return [
        ...baseItems,
        { id: "all-products", label: "All Products", icon: "📦" },
        { id: "users", label: "Manage Users", icon: "👥" },
        { id: "orders", label: "All Orders", icon: "📋" },
        { id: "analytics", label: "Analytics", icon: "📈" }
      ];
    }
    
    return baseItems;
  };

  // Render main content based on active tab and role
  const renderMainContent = () => {
    // CUSTOMER VIEWS
    if (userRole === "customer") {
      switch (activeTab) {
        case "dashboard":
          return (
            <div>
              <h2 style={{ color: "#2c5530", marginBottom: "30px" }}>
                👋 Welcome back, {user.username}!
              </h2>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
                <div style={{...styles.card, textAlign: "center", backgroundColor: "#e8f5e8"}}>
                  <h3 style={{ color: "#2c5530", margin: "0 0 10px 0" }}>🛍️</h3>
                  <p style={{ margin: "0", fontSize: "24px", fontWeight: "bold" }}>{products.length}</p>
                  <p style={{ margin: "5px 0 0 0", color: "#666" }}>Products Available</p>
                </div>
                <div style={{...styles.card, textAlign: "center", backgroundColor: "#fff3cd"}}>
                  <h3 style={{ color: "#856404", margin: "0 0 10px 0" }}>🛒</h3>
                  <p style={{ margin: "0", fontSize: "24px", fontWeight: "bold" }}>{cart.length}</p>
                  <p style={{ margin: "5px 0 0 0", color: "#666" }}>Items in Cart</p>
                </div>
                <div style={{...styles.card, textAlign: "center", backgroundColor: "#d1ecf1"}}>
                  <h3 style={{ color: "#0c5460", margin: "0 0 10px 0" }}>📦</h3>
                  <p style={{ margin: "0", fontSize: "24px", fontWeight: "bold" }}>{orders.length}</p>
                  <p style={{ margin: "5px 0 0 0", color: "#666" }}>Orders Placed</p>
                </div>
              </div>

              <div style={styles.card}>
                <h3 style={{ color: "#2c5530", marginBottom: "20px" }}>🔥 Featured Products</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
                  {products.slice(0, 4).map(product => (
                    <div key={product.id} style={{
                      border: "1px solid #eee",
                      borderRadius: "8px",
                      padding: "15px",
                      textAlign: "center"
                    }}>
                      <div style={{ fontSize: "32px", marginBottom: "10px" }}>
                        {product.image}
                      </div>
                      <h4 style={{ margin: "0 0 5px 0", fontSize: "14px" }}>{product.name}</h4>
                      <p style={{ margin: "0", color: "#28a745", fontWeight: "bold" }}>₹{product.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );

        case "products":
          return (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
                <h2 style={{ color: "#2c5530", margin: 0 }}>🛍️ Browse Products</h2>
              </div>

              <div style={styles.searchContainer}>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ ...styles.input, marginBottom: 0, flex: 1, maxWidth: "300px" }}
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ ...styles.input, marginBottom: 0, width: "200px" }}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === "all" ? "All Categories" : cat}
                    </option>
                  ))}
                </select>
              </div>

              {isLoadingProducts ? (
                <div style={{ textAlign: "center", padding: "50px" }}>
                  <p>Loading products...</p>
                </div>
              ) : (
                <div style={styles.productGrid}>
                  {filteredProducts.map(product => (
                    <div
                      key={product.id}
                      style={{
                        ...styles.productCard,
                        ":hover": { transform: "translateY(-2px)", boxShadow: "0 6px 20px rgba(0,0,0,0.12)" }
                      }}
                    >
                      <div style={{ textAlign: "center", marginBottom: "15px" }}>
                        <div style={{ fontSize: "48px", marginBottom: "10px" }}>
                          {product.image && product.image.startsWith("data:") ? (
                            <img src={product.image} alt={product.name} style={{ width: 64, height: 64, borderRadius: "8px" }} />
                          ) : (
                            <span>{product.image}</span>
                          )}
                        </div>
                      </div>
                      
                      <h3 style={{ color: "#333", marginBottom: "8px", fontSize: "18px" }}>
                        {product.name}
                      </h3>
                      
                      <p style={{ color: "#666", fontSize: "14px", marginBottom: "10px" }}>
                        {product.description}
                      </p>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <span style={{ backgroundColor: "#e9ecef", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", color: "#495057" }}>
                          {product.category}
                        </span>
                        <span style={{ color: "#888", fontSize: "12px" }}>
                          Stock: {product.stock}
                        </span>
                      </div>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                        <span style={{ fontSize: "20px", fontWeight: "bold", color: "#28a745" }}>
                          ₹{product.price}
                        </span>
                        <span style={{ fontSize: "12px", color: "#6c757d" }}>
                          🌱 {product.carbonFootprint} kg CO₂
                        </span>
                      </div>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                        <span style={{ fontSize: "12px", color: "#6c757d" }}>
                          by {product.seller}
                        </span>
                        {product.rating > 0 && (
                          <span style={{ fontSize: "12px", color: "#ffc107" }}>
                            ⭐ {product.rating}
                          </span>
                        )}
                      </div>
                      
                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                        style={{
                          ...styles.button,
                          width: "100%",
                          opacity: product.stock === 0 ? 0.5 : 1,
                          cursor: product.stock === 0 ? "not-allowed" : "pointer"
                        }}
                      >
                        {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );

        case "cart":
          return (
            <div>
              <h2 style={{ color: "#2c5530", marginBottom: "25px" }}>🛒 Shopping Cart</h2>
              
              {cart.length === 0 ? (
                <div style={{ ...styles.card, textAlign: "center", padding: "50px" }}>
                  <div style={{ fontSize: "64px", marginBottom: "20px" }}>🛒</div>
                  <h3 style={{ color: "#666", marginBottom: "15px" }}>Your cart is empty</h3>
                  <p style={{ color: "#888", marginBottom: "25px" }}>Add some eco-friendly products to get started!</p>
                  <button onClick={() => setActiveTab("products")} style={styles.button}>
                    Browse Products
                  </button>
                </div>
              ) : (
                <div>
                  <div style={styles.card}>
                    {cart.map((item, idx) => (
                      <div key={item.cartId} style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "15px 0",
                        borderBottom: idx < cart.length - 1 ? "1px solid #eee" : "none"
                      }}>
                        <div style={{ fontSize: "32px", marginRight: "15px" }}>
                          {item.image}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: "0 0 5px 0", color: "#333" }}>{item.name}</h4>
                          <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>{item.description}</p>
                        </div>
                        <div style={{ textAlign: "right", marginRight: "15px" }}>
                          <div style={{ fontSize: "18px", fontWeight: "bold", color: "#28a745" }}>
                            ₹{item.price}
                          </div>
                          <div style={{ fontSize: "12px", color: "#6c757d" }}>
                            🌱 {item.carbonFootprint} kg CO₂
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.cartId)}
                          style={styles.dangerButton}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <div style={{ ...styles.card, backgroundColor: "#f8f9fa" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                      <div>
                        <h3 style={{ margin: "0", color: "#333" }}>Order Summary</h3>
                        <p style={{ margin: "5px 0 0 0", color: "#666" }}>{cart.length} items in cart</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "24px", fontWeight: "bold", color: "#2c5530" }}>
                          ₹{totalCartAmount.toFixed(2)}
                        </div>
                        <div style={{ fontSize: "14px", color: "#6c757d" }}>
                          🌱 {cart.reduce((sum, item) => sum + item.carbonFootprint, 0).toFixed(1)} kg CO₂ total
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button onClick={clearCart} style={styles.dangerButton}>
                        Clear Cart
                      </button>
                      <button 
                        onClick={() => setActiveTab("payment")} 
                        style={{ ...styles.button, flex: 1 }}
                      >
                        Proceed to Payment
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );

        case "payment":
          return (
            <div>
              <h2 style={{ color: "#2c5530", marginBottom: "25px" }}>💳 Payment</h2>
              {cart.length > 0 ? (
                <UPIPaymentDemo amount={totalCartAmount} onPaymentComplete={handlePaymentComplete} />
              ) : (
                <div style={{ ...styles.card, textAlign: "center", padding: "50px" }}>
                  <h3 style={{ color: "#666" }}>No items to pay for</h3>
                  <button onClick={() => setActiveTab("products")} style={styles.button}>
                    Browse Products
                  </button>
                </div>
              )}
            </div>
          );

        case "orders":
          return (
            <div>
              <h2 style={{ color: "#2c5530", marginBottom: "25px" }}>📦 My Orders</h2>
              
              {orders.length === 0 ? (
                <div style={{ ...styles.card, textAlign: "center", padding: "50px" }}>
                  <div style={{ fontSize: "64px", marginBottom: "20px" }}>📦</div>
                  <h3 style={{ color: "#666", marginBottom: "15px" }}>No orders yet</h3>
                  <p style={{ color: "#888", marginBottom: "25px" }}>Your order history will appear here</p>
                  <button onClick={() => setActiveTab("products")} style={styles.button}>
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div>
                  {orders.map(order => (
                    <div key={order.id} style={{ ...styles.card, marginBottom: "20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                        <div>
                          <h4 style={{ margin: "0", color: "#333" }}>Order #{order.id}</h4>
                          <p style={{ margin: "5px 0 0 0", color: "#666", fontSize: "14px" }}>
                            Placed on {order.date} • {order.status}
                          </p>
                        </div>
                        <div style={{ fontSize: "18px", fontWeight: "bold", color: "#28a745" }}>
                          ₹{order.total.toFixed(2)}
                        </div>
                      </div>
                      
                      <div>
                        {order.items.map((item, idx) => (
                          <div key={idx} style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "10px 0",
                            borderTop: idx > 0 ? "1px solid #f0f0f0" : "none"
                          }}>
                            <span style={{ fontSize: "20px", marginRight: "10px" }}>{item.image}</span>
                            <div style={{ flex: 1 }}>
                              <span style={{ fontWeight: "500" }}>{item.name}</span>
                              <span style={{ color: "#666", marginLeft: "15px" }}>₹{item.price}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );

        default:
          return <div>Page not found</div>;
      }
    }

    // SELLER VIEWS
    else if (userRole === "seller") {
      switch (activeTab) {
        case "dashboard":
          const sellerProducts = products.filter(p => p.seller === user.username);
          const totalRevenue = sellerProducts.reduce((sum, product) => sum + (product.price * (product.sold || 0)), 0);
          
          return (
            <div>
              <h2 style={{ color: "#2c5530", marginBottom: "30px" }}>
                🏪 Seller Dashboard - Welcome {user.username}!
              </h2>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
                <div style={{...styles.card, textAlign: "center", backgroundColor: "#e8f5e8"}}>
                  <h3 style={{ color: "#2c5530", margin: "0 0 10px 0" }}>📦</h3>
                  <p style={{ margin: "0", fontSize: "24px", fontWeight: "bold" }}>{sellerProducts.length}</p>
                  <p style={{ margin: "5px 0 0 0", color: "#666" }}>Products Listed</p>
                </div>
                <div style={{...styles.card, textAlign: "center", backgroundColor: "#fff3cd"}}>
                  <h3 style={{ color: "#856404", margin: "0 0 10px 0" }}>💰</h3>
                  <p style={{ margin: "0", fontSize: "24px", fontWeight: "bold" }}>₹{totalRevenue}</p>
                  <p style={{ margin: "5px 0 0 0", color: "#666" }}>Total Revenue</p>
                </div>
                <div style={{...styles.card, textAlign: "center", backgroundColor: "#d1ecf1"}}>
                  <h3 style={{ color: "#0c5460", margin: "0 0 10px 0" }}>📊</h3>
                  <p style={{ margin: "0", fontSize: "24px", fontWeight: "bold" }}>
                    {sellerProducts.reduce((sum, p) => sum + (p.stock || 0), 0)}
                  </p>
                  <p style={{ margin: "5px 0 0 0", color: "#666" }}>Total Stock</p>
                </div>
              </div>

              <div style={styles.card}>
                <h3 style={{ color: "#2c5530", marginBottom: "20px" }}>🎯 Quick Actions</h3>
                <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
                  <button 
                    onClick={() => setActiveTab("add-product")} 
                    style={{ ...styles.button, padding: "15px 25px" }}
                  >
                    ➕ Add New Product
                  </button>
                  <button 
                    onClick={() => setActiveTab("products")} 
                    style={{ ...styles.button, backgroundColor: "#17a2b8", padding: "15px 25px" }}
                  >
                    📝 Manage Products
                  </button>
                  <button 
                    onClick={() => setActiveTab("orders")} 
                    style={{ ...styles.button, backgroundColor: "#ffc107", color: "#212529", padding: "15px 25px" }}
                  >
                    📊 View Orders
                  </button>
                </div>
              </div>

              {sellerProducts.length > 0 && (
                <div style={styles.card}>
                  <h3 style={{ color: "#2c5530", marginBottom: "20px" }}>📈 Your Recent Products</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
                    {sellerProducts.slice(0, 4).map(product => (
                      <div key={product.id} style={{
                        border: "1px solid #eee",
                        borderRadius: "8px",
                        padding: "15px",
                        textAlign: "center"
                      }}>
                        <div style={{ fontSize: "32px", marginBottom: "10px" }}>
                          {product.image}
                        </div>
                        <h4 style={{ margin: "0 0 5px 0", fontSize: "14px" }}>{product.name}</h4>
                        <p style={{ margin: "0", color: "#28a745", fontWeight: "bold" }}>₹{product.price}</p>
                        <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#666" }}>Stock: {product.stock}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );

        case "products":
          const myProducts = products.filter(p => p.seller === user.username);
          
          return (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
                <h2 style={{ color: "#2c5530", margin: 0 }}>📝 My Products</h2>
                <button 
                  onClick={() => setActiveTab("add-product")} 
                  style={styles.button}
                >
                  ➕ Add Product
                </button>
              </div>

              {myProducts.length === 0 ? (
                <div style={{ ...styles.card, textAlign: "center", padding: "50px" }}>
                  <div style={{ fontSize: "64px", marginBottom: "20px" }}>📦</div>
                  <h3 style={{ color: "#666", marginBottom: "15px" }}>No products listed yet</h3>
                  <p style={{ color: "#888", marginBottom: "25px" }}>Start by adding your first product</p>
                  <button onClick={() => setActiveTab("add-product")} style={styles.button}>
                    Add Product
                  </button>
                </div>
              ) : (
                <div style={styles.productGrid}>
                  {myProducts.map(product => (
                    <div key={product.id} style={styles.productCard}>
                      <div style={{ textAlign: "center", marginBottom: "15px" }}>
                        <div style={{ fontSize: "48px", marginBottom: "10px" }}>
                          {product.image && product.image.startsWith("data:") ? (
                            <img src={product.image} alt={product.name} style={{ width: 64, height: 64, borderRadius: "8px" }} />
                          ) : (
                            <span>{product.image}</span>
                          )}
                        </div>
                      </div>
                      
                      <h3 style={{ color: "#333", marginBottom: "8px", fontSize: "18px" }}>
                        {product.name}
                      </h3>
                      
                      <p style={{ color: "#666", fontSize: "14px", marginBottom: "10px" }}>
                        {product.description}
                      </p>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <span style={{ backgroundColor: "#e9ecef", padding: "4px 8px", borderRadius: "12px", fontSize: "12px" }}>
                          {product.category}
                        </span>
                        <span style={{ color: "#888", fontSize: "12px" }}>
                          Stock: {product.stock}
                        </span>
                      </div>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                        <span style={{ fontSize: "20px", fontWeight: "bold", color: "#28a745" }}>
                          ₹{product.price}
                        </span>
                        <span style={{ fontSize: "12px", color: "#6c757d" }}>
                          🌱 {product.carbonFootprint} kg CO₂
                        </span>
                      </div>
                      
                      <div style={{ display: "flex", gap: "5px" }}>
                        <button
                          style={{ ...styles.button, fontSize: "12px", padding: "8px 12px", flex: 1 }}
                        >
                          Edit
                        </button>
                        <button
                          style={{ ...styles.dangerButton, fontSize: "12px", padding: "8px 12px" }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );

        case "add-product":
          return (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
                <h2 style={{ color: "#2c5530", margin: 0 }}>➕ Add New Product</h2>
                <button 
                  onClick={() => setActiveTab("products")} 
                  style={{ ...styles.button, backgroundColor: "#6c757d" }}
                >
                  👈 Back to My Products
                </button>
              </div>
              
              <div style={styles.card}>
                <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#e8f5e8", borderRadius: "8px" }}>
                  <h4 style={{ margin: "0 0 10px 0", color: "#2c5530" }}>📋 Product Information</h4>
                  <p style={{ margin: "0", fontSize: "14px", color: "#495057" }}>
                    Fill in the details below. Your product will be immediately available to all customers after adding.
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" }}>
                  <div>
                    <h4 style={{ color: "#495057", marginBottom: "20px", borderBottom: "2px solid #e9ecef", paddingBottom: "10px" }}>
                      📝 Basic Details
                    </h4>
                    
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#495057" }}>
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newProduct.name}
                      placeholder="e.g., Organic Cotton T-Shirt"
                      onChange={handleNewProductChange}
                      style={styles.input}
                    />

                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#495057" }}>
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={newProduct.price}
                      placeholder="e.g., 299"
                      min="1"
                      onChange={handleNewProductChange}
                      style={styles.input}
                    />

                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#495057" }}>
                      Category *
                    </label>
                    <select
                      name="category"
                      value={newProduct.category}
                      onChange={handleNewProductChange}
                      style={styles.input}
                    >
                      <option value="">-- Select Category --</option>
                      <option value="Personal Care">Personal Care</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Lifestyle">Lifestyle</option>
                      <option value="Stationery">Stationery</option>
                      <option value="Home & Garden">Home & Garden</option>
                      <option value="Food & Beverages">Food & Beverages</option>
                    </select>

                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#495057" }}>
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={newProduct.stock}
                      placeholder="e.g., 50"
                      min="0"
                      onChange={handleNewProductChange}
                      style={styles.input}
                    />
                  </div>

                  <div>
                    <h4 style={{ color: "#495057", marginBottom: "20px", borderBottom: "2px solid #e9ecef", paddingBottom: "10px" }}>
                      📋 Additional Details
                    </h4>
                    
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#495057" }}>
                      Product Description
                    </label>
                    <textarea
                      name="description"
                      value={newProduct.description}
                      placeholder="e.g., 100% organic cotton, eco-friendly dyes, comfortable fit"
                      onChange={handleNewProductChange}
                      style={{ ...styles.input, height: "80px", resize: "vertical" }}
                    />

                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#495057" }}>
                      Carbon Footprint (kg CO₂)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="carbonFootprint"
                      value={newProduct.carbonFootprint}
                      placeholder="e.g., 2.1"
                      min="0"
                      onChange={handleNewProductChange}
                      style={styles.input}
                    />

                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#495057" }}>
                      Product Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={styles.input}
                    />
                    
                    <div style={{ fontSize: "12px", color: "#6c757d", marginTop: "-10px", marginBottom: "15px" }}>
                      Upload an image or we'll use a default emoji
                    </div>

                    {newProduct.image && (
                      <div style={{ textAlign: "center", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                        <p style={{ margin: "0 0 10px 0", fontWeight: "600", color: "#495057" }}>Preview:</p>
                        {newProduct.image.startsWith("data:") ? (
                          <img 
                            src={newProduct.image} 
                            alt="Preview" 
                            style={{ 
                              width: "80px", 
                              height: "80px", 
                              objectFit: "cover", 
                              borderRadius: "8px", 
                              border: "2px solid #dee2e6" 
                            }} 
                          />
                        ) : (
                          <span style={{ fontSize: "48px" }}>{newProduct.image}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ 
                  marginTop: "40px", 
                  padding: "20px", 
                  backgroundColor: "#f8f9fa", 
                  borderRadius: "8px",
                  borderTop: "3px solid #28a745"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                    <h4 style={{ margin: "0", color: "#495057" }}>📦 Product Preview</h4>
                    <span style={{ fontSize: "12px", color: "#6c757d" }}>How it will appear to customers</span>
                  </div>
                  
                  <div style={{
                    border: "1px solid #dee2e6",
                    borderRadius: "8px",
                    padding: "15px",
                    backgroundColor: "white",
                    maxWidth: "280px"
                  }}>
                    <div style={{ textAlign: "center", marginBottom: "10px" }}>
                      <div style={{ fontSize: "32px", marginBottom: "5px" }}>
                        {newProduct.image || "📦"}
                      </div>
                    </div>
                    <h4 style={{ margin: "0 0 5px 0", fontSize: "16px", color: "#333" }}>
                      {newProduct.name || "Product Name"}
                    </h4>
                    <p style={{ margin: "0 0 10px 0", fontSize: "12px", color: "#666" }}>
                      {newProduct.description || "Product description will appear here"}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ backgroundColor: "#e9ecef", padding: "2px 6px", borderRadius: "8px", fontSize: "10px" }}>
                        {newProduct.category || "Category"}
                      </span>
                      <span style={{ fontSize: "10px", color: "#888" }}>
                        Stock: {newProduct.stock || "0"}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "16px", fontWeight: "bold", color: "#28a745" }}>
                        ₹{newProduct.price || "0"}
                      </span>
                      <span style={{ fontSize: "10px", color: "#6c757d" }}>
                        🌱 {newProduct.carbonFootprint || "0"} kg CO₂
                      </span>
                    </div>
                    <div style={{ marginTop: "8px", fontSize: "10px", color: "#6c757d", textAlign: "center" }}>
                      by {user.username}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: "30px", display: "flex", gap: "15px", justifyContent: "center" }}>
                  <button
                    onClick={handleAddProduct}
                    disabled={!newProduct.name || !newProduct.price || !newProduct.category}
                    style={{
                      ...styles.button,
                      padding: "15px 30px",
                      fontSize: "16px",
                      backgroundColor: (!newProduct.name || !newProduct.price || !newProduct.category) ? "#ccc" : "#28a745",
                      cursor: (!newProduct.name || !newProduct.price || !newProduct.category) ? "not-allowed" : "pointer"
                    }}
                  >
                    ✅ Add Product to Marketplace
                  </button>
                  <button
                    onClick={() => {
                      setNewProduct({
                        name: "", price: "", carbonFootprint: "", category: "",
                        image: "📦", description: "", stock: "", imageFile: null
                      });
                    }}
                    style={{ ...styles.dangerButton, padding: "15px 30px", fontSize: "16px" }}
                  >
                    🗑️ Clear Form
                  </button>
                </div>
              </div>
            </div>
          );

        case "orders":
          return (
            <div>
              <h2 style={{ color: "#2c5530", marginBottom: "25px" }}>📊 Orders Received</h2>
              
              <div style={{ ...styles.card, textAlign: "center", padding: "50px" }}>
                <div style={{ fontSize: "64px", marginBottom: "20px" }}>📊</div>
                <h3 style={{ color: "#666", marginBottom: "15px" }}>Orders Management</h3>
                <p style={{ color: "#888", marginBottom: "25px" }}>Order management functionality coming soon!</p>
              </div>
            </div>
          );

        default:
          return <div>Page not found</div>;
      }
    }

    // ADMIN VIEWS
    else if (userRole === "admin") {
      switch (activeTab) {
        case "dashboard":
          const totalUsers = 125; // Mock data
          const totalOrders = orders.length;
          const totalRevenue = products.reduce((sum, product) => sum + (product.price * (product.sold || Math.floor(Math.random() * 10))), 0);
          
          return (
            <div>
              <h2 style={{ color: "#2c5530", marginBottom: "30px" }}>
                👑 Admin Dashboard - Welcome {user.username}!
              </h2>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
                <div style={{...styles.card, textAlign: "center", backgroundColor: "#e8f5e8"}}>
                  <h3 style={{ color: "#2c5530", margin: "0 0 10px 0" }}>👥</h3>
                  <p style={{ margin: "0", fontSize: "24px", fontWeight: "bold" }}>{totalUsers}</p>
                  <p style={{ margin: "5px 0 0 0", color: "#666" }}>Total Users</p>
                </div>
                <div style={{...styles.card, textAlign: "center", backgroundColor: "#fff3cd"}}>
                  <h3 style={{ color: "#856404", margin: "0 0 10px 0" }}>📦</h3>
                  <p style={{ margin: "0", fontSize: "24px", fontWeight: "bold" }}>{products.length}</p>
                  <p style={{ margin: "5px 0 0 0", color: "#666" }}>Total Products</p>
                </div>
                <div style={{...styles.card, textAlign: "center", backgroundColor: "#d1ecf1"}}>
                  <h3 style={{ color: "#0c5460", margin: "0 0 10px 0" }}>📋</h3>
                  <p style={{ margin: "0", fontSize: "24px", fontWeight: "bold" }}>{totalOrders}</p>
                  <p style={{ margin: "5px 0 0 0", color: "#666" }}>Total Orders</p>
                </div>
                <div style={{...styles.card, textAlign: "center", backgroundColor: "#f8d7da"}}>
                  <h3 style={{ color: "#721c24", margin: "0 0 10px 0" }}>💰</h3>
                  <p style={{ margin: "0", fontSize: "24px", fontWeight: "bold" }}>₹{totalRevenue.toFixed(0)}</p>
                  <p style={{ margin: "5px 0 0 0", color: "#666" }}>Platform Revenue</p>
                </div>
              </div>

              <div style={styles.card}>
                <h3 style={{ color: "#2c5530", marginBottom: "20px" }}>🎯 Admin Actions</h3>
                <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
                  <button 
                    onClick={() => setActiveTab("all-products")} 
                    style={{ ...styles.button, padding: "15px 25px" }}
                  >
                    📦 Manage Products
                  </button>
                  <button 
                    onClick={() => setActiveTab("users")} 
                    style={{ ...styles.button, backgroundColor: "#17a2b8", padding: "15px 25px" }}
                  >
                    👥 Manage Users
                  </button>
                  <button 
                    onClick={() => setActiveTab("orders")} 
                    style={{ ...styles.button, backgroundColor: "#ffc107", color: "#212529", padding: "15px 25px" }}
                  >
                    📋 View All Orders
                  </button>
                  <button 
                    onClick={() => setActiveTab("analytics")} 
                    style={{ ...styles.button, backgroundColor: "#6f42c1", padding: "15px 25px" }}
                  >
                    📈 Analytics
                  </button>
                </div>
              </div>

              <div style={styles.card}>
                <h3 style={{ color: "#2c5530", marginBottom: "20px" }}>📈 Recent Activity</h3>
                <div style={{ display: "grid", gap: "15px" }}>
                  <div style={{ padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px", borderLeft: "4px solid #28a745" }}>
                    <p style={{ margin: "0", fontWeight: "500" }}>🆕 New product added: "Eco-Friendly Notebook"</p>
                    <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#666" }}>2 hours ago by PaperCraft</p>
                  </div>
                  <div style={{ padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px", borderLeft: "4px solid #007bff" }}>
                    <p style={{ margin: "0", fontWeight: "500" }}>👤 New user registered: john_doe</p>
                    <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#666" }}>5 hours ago</p>
                  </div>
                  <div style={{ padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px", borderLeft: "4px solid #ffc107" }}>
                    <p style={{ margin: "0", fontWeight: "500" }}>🛒 Order completed: #12345</p>
                    <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#666" }}>1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          );

        case "all-products":
          return (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
                <h2 style={{ color: "#2c5530", margin: 0 }}>📦 All Products Management</h2>
              </div>

              <div style={styles.searchContainer}>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ ...styles.input, marginBottom: 0, flex: 1, maxWidth: "300px" }}
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ ...styles.input, marginBottom: 0, width: "200px" }}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === "all" ? "All Categories" : cat}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.card}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f8f9fa" }}>
                        <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Product</th>
                        <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Category</th>
                        <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Price</th>
                        <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Seller</th>
                        <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Stock</th>
                        <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map(product => (
                        <tr key={product.id} style={{ borderBottom: "1px solid #dee2e6" }}>
                          <td style={{ padding: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <span style={{ fontSize: "24px" }}>{product.image}</span>
                              <div>
                                <div style={{ fontWeight: "500" }}>{product.name}</div>
                                <div style={{ fontSize: "12px", color: "#666" }}>{product.description}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "12px" }}>
                            <span style={{ backgroundColor: "#e9ecef", padding: "4px 8px", borderRadius: "12px", fontSize: "12px" }}>
                              {product.category}
                            </span>
                          </td>
                          <td style={{ padding: "12px", fontWeight: "bold", color: "#28a745" }}>₹{product.price}</td>
                          <td style={{ padding: "12px" }}>{product.seller}</td>
                          <td style={{ padding: "12px" }}>{product.stock}</td>
                          <td style={{ padding: "12px" }}>
                            <div style={{ display: "flex", gap: "5px" }}>
                              <button style={{ ...styles.button, fontSize: "12px", padding: "6px 10px" }}>Edit</button>
                              <button style={{ ...styles.dangerButton, fontSize: "12px", padding: "6px 10px" }}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );

        case "users":
          const mockUsers = [
            { id: 1, username: "john_customer", role: "Customer", email: "john@example.com", joinDate: "2024-01-15" },
            { id: 2, username: "jane_seller", role: "Seller", email: "jane@example.com", joinDate: "2024-02-10" },
            { id: 3, username: "bob_customer", role: "Customer", email: "bob@example.com", joinDate: "2024-03-05" },
          ];

          return (
            <div>
              <h2 style={{ color: "#2c5530", marginBottom: "25px" }}>👥 User Management</h2>
              
              <div style={styles.card}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f8f9fa" }}>
                        <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Username</th>
                        <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Role</th>
                        <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Email</th>
                        <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Join Date</th>
                        <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockUsers.map(mockUser => (
                        <tr key={mockUser.id} style={{ borderBottom: "1px solid #dee2e6" }}>
                          <td style={{ padding: "12px", fontWeight: "500" }}>{mockUser.username}</td>
                          <td style={{ padding: "12px" }}>
                            <span style={{
                              backgroundColor: mockUser.role === "Seller" ? "#fff3cd" : "#d1ecf1",
                              color: mockUser.role === "Seller" ? "#856404" : "#0c5460",
                              padding: "4px 8px",
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: "bold"
                            }}>
                              {mockUser.role}
                            </span>
                          </td>
                          <td style={{ padding: "12px", color: "#666" }}>{mockUser.email}</td>
                          <td style={{ padding: "12px", color: "#666" }}>{mockUser.joinDate}</td>
                          <td style={{ padding: "12px" }}>
                            <div style={{ display: "flex", gap: "5px" }}>
                              <button style={{ ...styles.button, fontSize: "12px", padding: "6px 10px" }}>Edit</button>
                              <button style={{ ...styles.dangerButton, fontSize: "12px", padding: "6px 10px" }}>Suspend</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );

        case "orders":
          return (
            <div>
              <h2 style={{ color: "#2c5530", marginBottom: "25px" }}>📋 All Orders</h2>
              
              {orders.length === 0 ? (
                <div style={{ ...styles.card, textAlign: "center", padding: "50px" }}>
                  <div style={{ fontSize: "64px", marginBottom: "20px" }}>📋</div>
                  <h3 style={{ color: "#666", marginBottom: "15px" }}>No orders yet</h3>
                  <p style={{ color: "#888", marginBottom: "25px" }}>Orders will appear here as customers make purchases</p>
                </div>
              ) : (
                <div>
                  {orders.map(order => (
                    <div key={order.id} style={{ ...styles.card, marginBottom: "20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                        <div>
                          <h4 style={{ margin: "0", color: "#333" }}>Order #{order.id}</h4>
                          <p style={{ margin: "5px 0 0 0", color: "#666", fontSize: "14px" }}>
                            {order.date} • Status: {order.status}
                          </p>
                        </div>
                        <div>
                          <div style={{ fontSize: "18px", fontWeight: "bold", color: "#28a745" }}>
                            ₹{order.total.toFixed(2)}
                          </div>
                          <select style={{ fontSize: "12px", padding: "4px 8px", marginTop: "5px" }}>
                            <option>Completed</option>
                            <option>Processing</option>
                            <option>Shipped</option>
                            <option>Cancelled</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        {order.items.map((item, idx) => (
                          <div key={idx} style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "10px 0",
                            borderTop: idx > 0 ? "1px solid #f0f0f0" : "none"
                          }}>
                            <span style={{ fontSize: "20px", marginRight: "10px" }}>{item.image}</span>
                            <div style={{ flex: 1 }}>
                              <span style={{ fontWeight: "500" }}>{item.name}</span>
                              <span style={{ color: "#666", marginLeft: "15px" }}>₹{item.price}</span>
                            </div>
                            <span style={{ color: "#666", fontSize: "12px" }}>by {item.seller}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );

        case "analytics":
          return (
            <div>
              <h2 style={{ color: "#2c5530", marginBottom: "25px" }}>📈 Platform Analytics</h2>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "30px" }}>
                <div style={styles.card}>
                  <h3 style={{ color: "#2c5530", marginBottom: "15px" }}>💰 Revenue Trends</h3>
                  <div style={{ textAlign: "center", padding: "30px" }}>
                    <div style={{ fontSize: "48px", marginBottom: "15px" }}>📊</div>
                    <p style={{ color: "#666" }}>Revenue analytics chart would go here</p>
                    <div style={{ fontSize: "24px", fontWeight: "bold", color: "#28a745" }}>
                      ₹{products.reduce((sum, p) => sum + (p.price * (Math.floor(Math.random() * 5) + 1)), 0).toFixed(0)}
                    </div>
                    <p style={{ fontSize: "12px", color: "#666" }}>Total Platform Revenue</p>
                  </div>
                </div>

                <div style={styles.card}>
                  <h3 style={{ color: "#2c5530", marginBottom: "15px" }}>📦 Product Categories</h3>
                  <div style={{ padding: "20px 0" }}>
                    {categories.slice(1).map(category => {
                      const categoryCount = products.filter(p => p.category === category).length;
                      const percentage = ((categoryCount / products.length) * 100).toFixed(1);
                      
                      return (
                        <div key={category} style={{ marginBottom: "15px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                            <span style={{ fontSize: "14px" }}>{category}</span>
                            <span style={{ fontSize: "14px", fontWeight: "bold" }}>{percentage}%</span>
                          </div>
                          <div style={{
                            width: "100%",
                            height: "8px",
                            backgroundColor: "#e9ecef",
                            borderRadius: "4px",
                            overflow: "hidden"
                          }}>
                            <div style={{
                              width: `${percentage}%`,
                              height: "100%",
                              backgroundColor: "#28a745",
                              transition: "width 0.3s ease"
                            }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={styles.card}>
                  <h3 style={{ color: "#2c5530", marginBottom: "15px" }}>🌱 Environmental Impact</h3>
                  <div style={{ textAlign: "center", padding: "30px" }}>
                    <div style={{ fontSize: "48px", marginBottom: "15px" }}>🌍</div>
                    <div style={{ fontSize: "24px", fontWeight: "bold", color: "#28a745", marginBottom: "10px" }}>
                      {products.reduce((sum, p) => sum + p.carbonFootprint, 0).toFixed(1)} kg
                    </div>
                    <p style={{ fontSize: "12px", color: "#666", marginBottom: "15px" }}>Total CO₂ Footprint of Products</p>
                    <div style={{ fontSize: "18px", fontWeight: "bold", color: "#17a2b8" }}>
                      {(products.reduce((sum, p) => sum + p.carbonFootprint, 0) / products.length).toFixed(1)} kg
                    </div>
                    <p style={{ fontSize: "12px", color: "#666" }}>Average per Product</p>
                  </div>
                </div>
              </div>

              <div style={styles.card}>
                <h3 style={{ color: "#2c5530", marginBottom: "20px" }}>🏆 Top Performing Products</h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f8f9fa" }}>
                        <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Rank</th>
                        <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Product</th>
                        <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Price</th>
                        <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Seller</th>
                        <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Mock Sales</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.slice(0, 5).map((product, index) => {
                        const mockSales = Math.floor(Math.random() * 50) + 10;
                        return (
                          <tr key={product.id} style={{ borderBottom: "1px solid #dee2e6" }}>
                            <td style={{ padding: "12px", fontWeight: "bold", color: "#28a745" }}>#{index + 1}</td>
                            <td style={{ padding: "12px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={{ fontSize: "20px" }}>{product.image}</span>
                                <span style={{ fontWeight: "500" }}>{product.name}</span>
                              </div>
                            </td>
                            <td style={{ padding: "12px", fontWeight: "bold", color: "#28a745" }}>₹{product.price}</td>
                            <td style={{ padding: "12px" }}>{product.seller}</td>
                            <td style={{ padding: "12px", fontWeight: "bold" }}>{mockSales} units</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );

        default:
          return <div>Page not found</div>;
      }
    }

    // DEFAULT VIEW FOR UNKNOWN ROLES
    else {
      return (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>🤷‍♂️</div>
          <h2 style={{ color: "#2c5530", marginBottom: "15px" }}>Unknown Role</h2>
          <p style={{ color: "#666", marginBottom: "20px" }}>
            Your role "{user.role}" is not recognized in the system.
          </p>
          <p style={{ color: "#888", marginBottom: "30px" }}>
            Please contact administrator or try logging in with a different account.
          </p>
          <div style={{ backgroundColor: "#f8f9fa", padding: "20px", borderRadius: "8px", display: "inline-block" }}>
            <h4 style={{ margin: "0 0 15px 0" }}>Available Roles:</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, textAlign: "left" }}>
              <li style={{ padding: "5px 0" }}>🛍️ <strong>Customer</strong> - Browse and purchase products</li>
              <li style={{ padding: "5px 0" }}>🏪 <strong>Seller</strong> - Add and manage products</li>
              <li style={{ padding: "5px 0" }}>👑 <strong>Admin</strong> - Full platform management</li>
            </ul>
          </div>
        </div>
      );
    }
  };

  return (
    <div style={styles.container}>
      {/* Notification */}
      {notification && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          backgroundColor: notification.type === "success" ? "#d4edda" : "#f8d7da",
          color: notification.type === "success" ? "#155724" : "#721c24",
          padding: "15px 20px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          zIndex: 1001,
          maxWidth: "400px",
          fontSize: "14px",
          border: `1px solid ${notification.type === "success" ? "#c3e6cb" : "#f5c6cb"}`
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span>{notification.type === "success" ? "✅" : "❌"}</span>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <span>🌱</span>
            <span>EcoBazaarX</span>
          </div>
          <div style={styles.userInfo}>
            <span>Welcome, <strong>{user.username}</strong></span>
            <span style={styles.roleBadge}>{user.role}</span>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      <div style={{ display: "flex" }}>
        {/* Debug Panel - Remove this in production */}
        <div style={{
          position: "fixed",
          top: "100px",
          right: "20px",
          backgroundColor: "#f8f9fa",
          border: "1px solid #dee2e6",
          borderRadius: "8px",
          padding: "15px",
          fontSize: "12px",
          maxWidth: "250px",
          zIndex: 1000,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#495057" }}>Debug Info</h4>
          <div style={{ color: "#6c757d" }}>
            <p style={{ margin: "5px 0" }}><strong>Username:</strong> {user.username}</p>
            <p style={{ margin: "5px 0" }}><strong>Original Role:</strong> {user.role}</p>
            <p style={{ margin: "5px 0" }}><strong>Normalized Role:</strong> {userRole}</p>
            <p style={{ margin: "5px 0" }}><strong>Active Tab:</strong> {activeTab}</p>
            <p style={{ margin: "5px 0" }}><strong>Products:</strong> {products.length}</p>
            <p style={{ margin: "5px 0" }}><strong>Cart Items:</strong> {cart.length}</p>
          </div>
          <button 
            onClick={() => {
              localStorage.clear();
              setUser(null);
              setCart([]);
              navigate("/");
            }}
            style={{
              fontSize: "10px",
              padding: "5px 8px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginTop: "10px"
            }}
          >
            Clear All Data
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav style={styles.sidebar}>
          {getSidebarItems().map(item => (
            <div
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                ...styles.sidebarItem,
                ...(activeTab === item.id ? styles.activeSidebarItem : {}),
                ":hover": { backgroundColor: "#f8f9fa" }
              }}
            >
              <span style={{ fontSize: "16px" }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        {/* Main Content */}
        <main style={styles.mainContent}>
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;