import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ---- Simulated UPI Payment Component ----
function UPIPaymentDemo({ amount }) {
  const [paymentDone, setPaymentDone] = useState(false)

  const handlePaymentSimulate = () => {
    setTimeout(() => {
      setPaymentDone(true)
    }, 1000)
  }

  return (
    <div style={{ margin: "32px 0", textAlign: "center" }}>
      <h3>Scan & Pay via UPI</h3>
      <p>Amount: ₹{amount}</p>
      <img 
        src={`https://api.qrserver.com/v1/create-qr-code/?data=upi://pay?pa=your-upi-id&am=${amount}`}
        alt="UPI QR Code"
        style={{ width: 200, height: 200, margin: 16 }}
      />
      {!paymentDone ? (
        <>
          <p>Open your UPI app and scan above QR. Then click the button below.</p>
          <button className="btn-primary" onClick={handlePaymentSimulate}>
            I've Paid
          </button>
        </>
      ) : (
        <div style={{ color: "green", fontWeight: "bold", fontSize: 20 }}>
          ✅ Payment Successful! Thank you for your purchase.
        </div>
      )}
    </div>
  )
}

// ---- Initial sample eco-friendly products data ----
const sampleProducts = [
  { id: 1, name: "Bamboo Toothbrush Set", price: 15.99, carbonFootprint: 0.2, category: "Personal Care", image: "🦷" },
  { id: 2, name: "Organic Cotton T-Shirt", price: 29.99, carbonFootprint: 2.1, category: "Clothing", image: "👕" },
  { id: 3, name: "Solar Power Bank", price: 45.99, carbonFootprint: 1.8, category: "Electronics", image: "🔋" },
  { id: 4, name: "Reusable Water Bottle", price: 22.99, carbonFootprint: 0.5, category: "Lifestyle", image: "🍶" }
]

function Dashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('ecobazaar_user'))
  
  // Product list state (initially sampleProducts)
  const [products, setProducts] = useState(sampleProducts)
  const [activeTab, setActiveTab] = useState('overview')
  const [cart, setCart] = useState([])
  const [showGoToPayment, setShowGoToPayment] = useState(false)

  // Add Product form toggle state
  const [showAddProductForm, setShowAddProductForm] = useState(false)

  // New product state (including image)
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    carbonFootprint: '',
    category: '',
    image: '',
    imageFile: null
  })

  if (!user) return null

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('ecobazaar_user')
    navigate('/login')
  }

  // Handle Add Product form inputs
  const handleNewProductChange = (e) => {
    const { name, value } = e.target
    setNewProduct(prev => ({ ...prev, [name]: value }))
  }

  // Handle image file input and convert to base64 for preview/storage
  const handleImageChange = e => {
    const file = e.target.files[0]
    setNewProduct(prev => ({ ...prev, imageFile: file }))

    const reader = new FileReader()
    reader.onloadend = () => {
      setNewProduct(prev => ({ ...prev, image: reader.result }))
    }
    if (file) {
      reader.readAsDataURL(file)
    }
  }

  // On submitting a new product
  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      alert("Please fill product name, price and category")
      return
    }
    setProducts(prev => [
      ...prev,
      {
        id: prev.length + 1,
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        carbonFootprint: parseFloat(newProduct.carbonFootprint) || 0,
        category: newProduct.category,
        image: newProduct.image
      }
    ])

    // Clear form and hide it
    setNewProduct({
      name: '',
      price: '',
      carbonFootprint: '',
      category: '',
      image: '',
      imageFile: null
    })
    setShowAddProductForm(false)
    alert("Product added successfully!")
  }

  // Cart functions
  const addToCart = product => {
    setCart([...cart, product])
    setShowGoToPayment(true)
  }

  const removeFromCart = index => {
    const newCart = [...cart]
    newCart.splice(index, 1)
    setCart(newCart)

    if (newCart.length === 0) {
      setShowGoToPayment(false)
      setActiveTab('products')
    }
  }

  const totalCartAmount = cart.reduce((sum, item) => sum + item.price, 0)

  // Customer Dashboard
  const renderCustomerDashboard = () => (
    <div className="dashboard-content">
      <div className="tabs">
        <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>📊 Overview</button>
        <button className={`tab ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>🛒 Eco Products</button>
        <button className={`tab ${activeTab === 'payment' ? 'active' : ''}`} onClick={() => setActiveTab('payment')}>💳 Payment</button>
        <button className={`tab ${activeTab === 'impact' ? 'active' : ''}`} onClick={() => setActiveTab('impact')}>🌍 My Impact</button>
      </div>

      {activeTab === 'overview' && (
        <div className="tab-content">
          <h3>Your Eco Shopping Journey</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>🛍️ Orders</h4>
              <p className="stat-number">12</p>
              <p className="stat-desc">This month</p>
            </div>
            <div className="stat-card">
              <h4>🌱 CO₂ Saved</h4>
              <p className="stat-number">24.5kg</p>
              <p className="stat-desc">Total reduction</p>
            </div>
            <div className="stat-card">
              <h4>♻️ Eco Score</h4>
              <p className="stat-number">85</p>
              <p className="stat-desc">Excellent!</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="tab-content">
          <h3>Eco-Friendly Products</h3>
          <div className="products-grid">
            {products.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  {product.image && product.image.startsWith('data:image') ? (
                    <img src={product.image} alt={product.name} style={{ width: 100, height: 100, objectFit: 'cover' }} />
                  ) : (
                    <span>{product.image || '📦'}</span>
                  )}
                </div>
                <h4>{product.name}</h4>
                <p className="category">{product.category}</p>
                <p className="price">${product.price}</p>
                <p className="carbon-footprint">
                  🌍 Carbon: {product.carbonFootprint}kg CO₂
                </p>
                <button className="btn-secondary" onClick={() => addToCart(product)}>
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
          {cart.length > 0 && (
            <div className="checkout-section">
              <h4>Your Cart</h4>
              <ul>
                {cart.map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', maxWidth: 400, margin: 'auto', alignItems: 'center' }}>
                    <span>{item.name} – ${item.price}</span>
                    <button
                      className="btn-secondary"
                      style={{ backgroundColor: '#e53e3e', fontSize: '14px', padding: '4px 8px' }}
                      onClick={() => removeFromCart(idx)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
              <p><b>Total: ₹{totalCartAmount.toFixed(2)}</b></p>
              {showGoToPayment && (
                <button className="btn-primary" onClick={() => setActiveTab('payment')}>
                  Go to Payment
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'payment' && (
        <div className="tab-content">
          <h3>Payment Method</h3>
          {cart.length === 0 ? (
            <p>Your cart is empty. Please add items first.</p>
          ) : (
            <UPIPaymentDemo amount={totalCartAmount.toFixed(2)} />
          )}
        </div>
      )}

      {activeTab === 'impact' && (
        <div className="tab-content">
          <h3>Your Environmental Impact</h3>
          <div className="impact-summary">
            <p>🎉 Great job! You've made eco-conscious choices that have:</p>
            <ul>
              <li>✅ Reduced CO₂ emissions by 24.5kg</li>
              <li>✅ Saved 15L of water</li>
              <li>✅ Prevented 2.1kg of waste</li>
              <li>✅ Supported 8 sustainable brands</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )

  // Admin dashboard
  const renderAdminDashboard = () => (
    <div className="dashboard-content">
      <h3>🔧 Admin Control Panel</h3>
      <div className="admin-grid">
        <div className="admin-card">
          <h4>👥 User Management</h4>
          <p>Manage registered users</p>
          <button className="btn-secondary">View Users</button>
        </div>
        <div className="admin-card">
          <h4>🏪 Seller Approval</h4>
          <p>Review seller applications</p>
          <button className="btn-secondary">Review Applications</button>
        </div>
        <div className="admin-card">
          <h4>📈 Analytics</h4>
          <p>Platform performance metrics</p>
          <button className="btn-secondary">View Analytics</button>
        </div>
        <div className="admin-card">
          <h4>🌍 Carbon Tracking</h4>
          <p>Monitor platform's carbon impact</p>
          <button className="btn-secondary">View Reports</button>
        </div>
      </div>
    </div>
  )

  // Seller dashboard with form toggle
  const renderSellerDashboard = () => (
    <div className="dashboard-content">
      <h3>🏪 Seller Workspace</h3>
      
      <button className="btn-primary" onClick={() => setShowAddProductForm(prev => !prev)}>
        {showAddProductForm ? 'Cancel' : 'Add Product'}
      </button>

      {showAddProductForm && (
        <div className="add-product-form" style={{ marginTop: 20 }}>
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={newProduct.name}
            onChange={handleNewProductChange}
            style={{ marginRight: 8 }}
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={newProduct.price}
            onChange={handleNewProductChange}
            style={{ marginRight: 8 }}
          />
          <input
            type="number"
            step="0.01"
            name="carbonFootprint"
            placeholder="Carbon Footprint (kg CO₂)"
            value={newProduct.carbonFootprint}
            onChange={handleNewProductChange}
            style={{ marginRight: 8 }}
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={newProduct.category}
            onChange={handleNewProductChange}
            style={{ marginRight: 8 }}
          />
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
            style={{ marginRight: 8 }} 
          />
          <button className="btn-primary" onClick={handleAddProduct}>
            Submit Product
          </button>
        </div>
      )}
      
      <div className="seller-stats" style={{ marginTop: 20 }}>
        <div className="stat-card">
          <h4>📦 Products</h4>
          <p className="stat-number">{products.length}</p>
        </div>
        <div className="stat-card">
          <h4>💰 Revenue</h4>
          <p className="stat-number">$1,245</p>
        </div>
        <div className="stat-card">
          <h4>🌱 Impact</h4>
          <p className="stat-number">45kg CO₂</p>
        </div>
      </div>
      <div className="seller-actions">
        <button className="btn-secondary">📊 View Sales</button>
        <button className="btn-secondary">🌍 Carbon Reports</button>
        <button className="btn-secondary">⚙️ Store Settings</button>
      </div>
    </div>
  )

  // Main return - Render dashboards based on user role
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🌱 EcoBazaarX Dashboard</h1>
          <div className="user-info">
            <span>Welcome, <strong>{user.name}</strong></span>
            <span className="role-badge">{user.role}</span>
            <button onClick={handleLogout} className="logout-btn">
              🚪 Logout
            </button>
          </div>
        </div>
      </header>
      <main className="dashboard-main">
        {user.role === 'customer' && renderCustomerDashboard()}
        {user.role === 'admin' && renderAdminDashboard()}
        {user.role === 'seller' && renderSellerDashboard()}
      </main>
    </div>
  );
}

export default Dashboard;
