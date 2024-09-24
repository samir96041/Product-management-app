import React, { useState } from 'react';
import { Button, TextField, FormLayout, Card, Toast } from '@shopify/polaris';

const CreateProductForm = ({ onClose, onProductCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [vendor, setVendor] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null); 
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (event) => {
    setImage(event.target.files[0]); 
  };

  const handleSubmit = async () => {
    const productData = new FormData(); 
    productData.append('title', title);
    productData.append('body_html', description);
    productData.append('vendor', vendor);
    productData.append('variants', JSON.stringify([{ price }]));
    productData.append('image', image); 
    setLoading(true); 
    try {
      const response = await fetch('/api/products/create', {
        method: 'POST',
        body: productData, 
      });

      if (response.ok) {
        setSuccess(true);
        onProductCreated(); 
     
        setTitle('');
        setDescription('');
        setVendor('');
        setPrice('');
        setImage(null);

        // Close the form immediately after creation
        onClose();
      } else {
        console.error('Failed to create product');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <Card title="Create New Product">
      <FormLayout>
        <TextField
          label="Product Title"
          value={title}
          onChange={setTitle}
          required
        />
        <TextField
          label="Description"
          value={description}
          onChange={setDescription}
          multiline
        />
        <TextField
          label="Vendor"
          value={vendor}
          onChange={setVendor}
        />
        <TextField
          label="Price"
          value={price}
          onChange={setPrice}
          type="number"
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          required
        />
        <Button onClick={handleSubmit} loading={loading}>
          Create Product
        </Button>
      </FormLayout>

      {success && (
        <Toast
          content="Product created successfully!"
          onDismiss={() => setSuccess(false)}
        />
      )}
    </Card>
  );
};

export default CreateProductForm;
