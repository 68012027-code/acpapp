import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [error, setError] = useState('');

  // State สำหรับการลบ
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItemToDelete, setSelectedItemToDelete] = useState(null);

  // Fetch inventory items
  const fetchInventory = async () => {
    try {
      const res = await fetch('http://localhost:8001/api/inventory');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      setError('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Add new inventory item
  const handleAddItem = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:8001/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          quantity: parseInt(quantity),
          unit_price: parseFloat(unitPrice),
        }),
      });

      if (res.ok) {
        setName('');
        setCategory('');
        setQuantity('');
        setUnitPrice('');
        fetchInventory();
      } else {
        const data = await res.json();
        setError(data.detail || 'An error occurred while adding the item');
      }
    } catch (err) {
      setError('Unable to connect to the server');
    }
  };

  // Modal ลบ
  const promptDelete = (item) => {
    setSelectedItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedItemToDelete) return;
    try {
      const res = await fetch(`http://localhost:8001/api/inventory/${selectedItemToDelete.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchInventory();
      } else {
        alert('Failed to delete item');
      }
    } catch (err) {
      alert('Failed to delete item');
    } finally {
      setDeleteModalOpen(false);
      setSelectedItemToDelete(null);
    }
  };

  // สถิติสรุป
  const totalItems = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const lowStockItems = items.filter(i => i.quantity < 10).length;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0f1d',
      backgroundImage: 'radial-gradient(circle at 50% 0%, #1e293b 0%, #0a0f1d 70%)',
      color: '#e2e8f0',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      padding: '40px 20px'
    }}>
      <Head>
        <title>MedStock - Smart Medical Inventory</title>
      </Head>

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header */}
        <header style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '20px'
        }}>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span>🩺</span> MedStock
            </h1>
            <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>
              Medical & Pharmaceuticals Management System
            </p>
          </div>
          <Link href="/" style={{
            color: '#38bdf8',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
            padding: '8px 16px',
            borderRadius: '8px',
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            transition: 'all 0.2s'
          }}>
            ← Back to Portal
          </Link>
        </header>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={{
            background: 'rgba(30, 41, 59, 0.6)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '20px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <span style={{ fontSize: '32px', background: 'rgba(56, 189, 248, 0.1)', padding: '10px', borderRadius: '10px' }}>💊</span>
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Categories</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f8fafc' }}>{items.length}</div>
            </div>
          </div>

          <div style={{
            background: 'rgba(30, 41, 59, 0.6)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '20px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <span style={{ fontSize: '32px', background: 'rgba(52, 211, 153, 0.1)', padding: '10px', borderRadius: '10px' }}>📦</span>
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Units</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#34d399' }}>{totalItems}</div>
            </div>
          </div>

          <div style={{
            background: 'rgba(30, 41, 59, 0.6)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '20px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <span style={{ fontSize: '32px', background: 'rgba(248, 113, 113, 0.1)', padding: '10px', borderRadius: '10px' }}>⚠️</span>
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Low Stock Alert</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: lowStockItems > 0 ? '#f87171' : '#f8fafc' }}>{lowStockItems}</div>
            </div>
          </div>
        </div>

        {/* Add Item Form */}
        <section style={{
          background: 'rgba(30, 41, 59, 0.5)',
          backdropFilter: 'blur(16px)',
          padding: '28px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
          marginBottom: '36px'
        }}>
          <h2 style={{
            marginTop: 0,
            marginBottom: '20px',
            fontSize: '18px',
            fontWeight: '600',
            color: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>🧪</span> Register New Medicine / Equipment
          </h2>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleAddItem} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Item Name</label>
              <input
                type="text"
                placeholder="e.g., Paracetamol 500mg"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#fff',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Category</label>
              <input
                type="text"
                placeholder="e.g., Analgesics, Antibiotics"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#fff',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Stock Quantity</label>
              <input
                type="number"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#fff',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Unit Price (฿)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#fff',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                gridColumn: 'span 2',
                padding: '14px',
                background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '15px',
                marginTop: '8px',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                transition: 'transform 0.1s ease'
              }}
            >
              ➕ Save Item to Inventory
            </button>
          </form>
        </section>

        {/* Inventory List Table */}
        <section style={{
          background: 'rgba(30, 41, 59, 0.5)',
          backdropFilter: 'blur(16px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>💉</span> Inventory List
            </h2>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading medical inventory...</div>
          ) : items.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No inventory items found.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: 'rgba(15, 23, 42, 0.8)', color: '#94a3b8', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px' }}>
                    <th style={{ padding: '16px 20px' }}>ID</th>
                    <th style={{ padding: '16px 20px' }}>Item Name</th>
                    <th style={{ padding: '16px 20px' }}>Category</th>
                    <th style={{ padding: '16px 20px' }}>Stock Quantity</th>
                    <th style={{ padding: '16px 20px' }}>Unit Price</th>
                    <th style={{ padding: '16px 20px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '16px 20px', color: '#64748b' }}>#{item.id}</td>
                      <td style={{ padding: '16px 20px', fontWeight: '600', color: '#f8fafc' }}>
                        💊 {item.name}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          background: 'rgba(56, 189, 248, 0.1)',
                          color: '#38bdf8',
                          fontSize: '12px'
                        }}>
                          {item.category}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        {item.quantity < 10 ? (
                          <span style={{ color: '#f87171', fontWeight: '600', background: 'rgba(248, 113, 113, 0.1)', padding: '4px 8px', borderRadius: '6px' }}>
                            {item.quantity} (Low Stock)
                          </span>
                        ) : (
                          <span style={{ color: '#34d399' }}>{item.quantity} units</span>
                        )}
                      </td>
                      <td style={{ padding: '16px 20px', fontWeight: '500', color: '#e2e8f0' }}>
                        ฿{parseFloat(item.unit_price).toFixed(2)}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <button
                          onClick={() => promptDelete(item)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: '#f87171',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Custom Glassmorphism Modal */}
        {deleteModalOpen && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(5, 8, 16, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              padding: '30px',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              maxWidth: '420px',
              width: '90%',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🛑</div>
              <h3 style={{ marginTop: 0, color: '#f8fafc', fontSize: '20px' }}>Confirm Deletion</h3>
              <p style={{ color: '#94a3b8', margin: '12px 0 24px 0', fontSize: '14px', lineHeight: '1.5' }}>
                Are you sure you want to remove <strong style={{ color: '#f87171' }}>"{selectedItemToDelete?.name}"</strong> from inventory?
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#e2e8f0',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#ef4444',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
                  }}
                >
                  Delete Item
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}