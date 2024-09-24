import React, { useState } from 'react';
import { Button, Modal, Spinner } from '@shopify/polaris';

const DeleteProduct = ({ product, onDelete, onClose, open }) => {
  const [loading, setLoading] = useState(false); 

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        console.log('Product deleted successfully');
        onDelete(); 
        onClose(); 
      } else {
        const errorData = await response.json();
        console.error('Failed to delete product:', errorData);
      }
    } catch (error) {
      console.error('Error during deletion:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Confirm Deletion"
      primaryAction={{
        content: loading ? <Spinner size="small" /> : 'Delete Product',
        onAction: handleDelete,
        destructive: true,
        disabled: loading, // Disable button during loading
      }}
      secondaryActions={[
        {
          content: 'Cancel',
          onAction: onClose,
          disabled: loading,
        },
      ]}
    >
      <Modal.Section>
        <p>Are you sure you want to delete the product "{product.title}"?</p>
      </Modal.Section>
    </Modal>
  );
};

export default DeleteProduct;
