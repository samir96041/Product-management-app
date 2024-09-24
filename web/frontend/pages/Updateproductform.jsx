import React, { useState } from 'react';
import { Modal, Button, TextField, Spinner } from '@shopify/polaris';

const UpdateProductForm = ({ product, onUpdate, onClose }) => {
  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(product.price);
  const [vendor, setVendor] = useState(product.vendor);
  const [loading, setLoading] = useState(false); 

  const handleSubmit = async () => {
    setLoading(true); 
    const response = await fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        body_html: description,
        vendor,
        variants: [{ price }], 
      }),
    });

    setLoading(false); 

    if (response.ok) {
      onUpdate();
      onClose(); 
    } else {
      console.error('Failed to update product');
    }
  };

  return (
    <Modal open={true} onClose={onClose} title="Update Product">
      <Modal.Section>
        {loading ? (
          <Spinner size="large" /> 
        ) : (
          <>
            <TextField label="Product Title" value={title} onChange={setTitle} />
            <TextField label="Description" value={description} onChange={setDescription} />
            <TextField label="Price" value={price} onChange={setPrice} />
            <TextField label="Vendor" value={vendor} onChange={setVendor} />
            <Button onClick={handleSubmit} primary>Update Product</Button>
          </>
        )}
      </Modal.Section>
    </Modal>
  );
};

export default UpdateProductForm;
