import React, { useEffect, useState } from 'react';
import { DataTable, Spinner, Page, Button } from '@shopify/polaris';
import CreateProductForm from './Productform';
import DeleteProduct from './Deleteproduct';
import UpdateProductForm from './Updateproductform';

const Product = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [showForm, setShowForm] = useState(false);

  const [deleteProduct, setDeleteProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [selectedProduct, setSelectedProduct] = useState(null); // Selected product for updating
  const [showUpdateForm, setShowUpdateForm] = useState(false); // Update form visibility

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Network response not ok');
      }
      const data = await response.json();
      setProducts(data.products);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner size="large" />;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }

  const rows = products.map((product) => [
    product.title,
    product.description,
    <img src={product.image} alt={product.title} style={{ width: '50px' }} />,
    product.price,
    product.vendor,
    <>
      <Button onClick={() => handleEditClick(product)}>Edit</Button> {/* Edit button */}
      <Button onClick={() => handleDeleteClick(product)}>Delete</Button> {/* Delete button */}
    </>
  ]);

  const handleToggleForm = () => {
    setShowForm((prev) => !prev);
  };

  const handleDeleteClick = (product) => {
    setDeleteProduct(product);
    setShowDeleteModal(true);
  };

  const handleDeleteClose = () => {
    setShowDeleteModal(false);
    setDeleteProduct(null);
  };

  const handleDeleteSuccess = () => {
    setProducts((prevProducts) => prevProducts.filter(p => p.id !== deleteProduct.id));
    handleDeleteClose();
  };

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setShowUpdateForm(true);
  };

  return (
    <>
      <Page title="Products" style={{ maxWidth: '1200px' }}> {/* Increased width */}
        <div style={{ marginBottom: '20px' }}> {/* Wrapped button in a div with margin */}
          <Button onClick={handleToggleForm}>
            {showForm ? 'Cancel' : 'Add Product'}
          </Button>
        </div>

        {showForm && <CreateProductForm onClose={() => setShowForm(false)} onProductCreated={fetchProducts} />}

        <DataTable 
          columnContentTypes={['text', 'text', 'text', 'text', 'text', 'text']}
          headings={['Product Title', 'Description', 'Image', 'Price', 'Vendor', 'Actions']}
          rows={rows}
          footerContent={`${products.length} products found`}
          style={{ width: '100%' }} 
        />
      </Page>

      {showDeleteModal && (
        <DeleteProduct
          product={deleteProduct}
          onDelete={handleDeleteSuccess}
          onClose={handleDeleteClose}
          open={showDeleteModal}
        />
      )}

      {showUpdateForm && (
        <UpdateProductForm
          product={selectedProduct}
          onUpdate={() => {
            fetchProducts();
            setShowUpdateForm(false);
          }}
          onClose={() => setShowUpdateForm(false)}
        />
      )}
    </>
  );
};

export default Product;
