import React, { useState } from "react";

const AddProduct = ({ onAddProduct }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    carbonFootprint: "",
    image: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddProduct(form);
    setForm({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      carbonFootprint: "",
      image: "",
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Product Name"
        required
      />
      <input
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
        required
      />
      <input
        type="number"
        name="price"
        value={form.price}
        onChange={handleChange}
        placeholder="Price"
        required
      />
      <input
        name="category"
        value={form.category}
        onChange={handleChange}
        placeholder="Category"
      />
      <input
        type="number"
        name="stock"
        value={form.stock}
        onChange={handleChange}
        placeholder="Stock Quantity"
      />
      <input
        type="number"
        name="carbonFootprint"
        value={form.carbonFootprint}
        onChange={handleChange}
        placeholder="Carbon Footprint"
      />
      <input
        name="image"
        value={form.image}
        onChange={handleChange}
        placeholder="Image URL or Emoji"
      />
      <button type="submit">Add Product</button>
    </form>
  );
};

export default AddProduct;
