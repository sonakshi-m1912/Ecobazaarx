import React, { useState } from 'react';
import axios from 'axios';

const AddProduct = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [featured, setFeatured] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('/api/products/add', { name, price, featured });
    setName('');
    setPrice('');
    setFeatured(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Product name" required />
      <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="Price" required />
      <label>
        <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} />
        Featured
      </label>
      <button type="submit">Add Product</button>
    </form>
  );
};

export default AddProduct;
