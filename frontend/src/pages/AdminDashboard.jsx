import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ShieldCheck, Database, AlertTriangle, PlusCircle } from 'lucide-react';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('add_product');
    const [products, setProducts] = useState([]);
    const [fakes, setFakes] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Add Product State
    const [newProduct, setNewProduct] = useState({
        serialId: '', name: '', dateOfManufacture: '', origin: '', expiryDate: '', sellerInfo: ''
    });

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('userInfo'));
        if (!user || user.role !== 'admin') {
            navigate('/login');
        } else {
            if (activeTab === 'view_products') fetchProducts();
            if (activeTab === 'view_fakes') fetchFakes();
        }
    }, [activeTab, navigate]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/products');
            setProducts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchFakes = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/fakes');
            setFakes(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            await api.post('/products', newProduct);
            alert('Product Added to Blockchain Successfully!');
            setNewProduct({
                serialId: '', name: '', dateOfManufacture: '', origin: '', expiryDate: '', sellerInfo: ''
            });
            setActiveTab('view_products');
        } catch (err) {
            alert(err.response?.data?.message || 'Error occurred');
        }
    };

    const deleteProduct = async (id) => {
        try {
            await api.delete(`/products/${id}`);
            fetchProducts();
        } catch (err) {
            alert(err.response?.data?.message || 'Error deleting product');
        }
    };

    const activeBtnStyle = { background: 'var(--primary)', color: '#000', border: 'none' };
    const getBtnStyle = (tab) => activeTab === tab ? activeBtnStyle : { background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--glass-border)' };

    return (
        <div className="animate-fade-in" style={{ padding: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2 style={{ color: 'var(--accent)', fontSize: '2rem' }}>Admin Dashboard</h2>
                <p className="text-muted">Manage products safely behind the blockchain integrity layer.</p>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px' }}>
                <button className="btn" style={getBtnStyle('add_product')} onClick={() => setActiveTab('add_product')}><PlusCircle size={18} style={{ marginRight: '8px' }} /> Add Product</button>
                <button className="btn" style={getBtnStyle('view_products')} onClick={() => setActiveTab('view_products')}><Database size={18} style={{ marginRight: '8px' }} /> View Products</button>
                <button className="btn" style={getBtnStyle('view_fakes')} onClick={() => setActiveTab('view_fakes')}><AlertTriangle size={18} style={{ marginRight: '8px' }} /> View Fakes</button>
            </div>

            {activeTab === 'add_product' && (
                <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <h3>Create Blockchain Entry</h3>
                    <form style={{ marginTop: '20px' }} onSubmit={handleAddProduct}>
                        <input type="text" placeholder="Serial ID (e.g., BRCD12345)" required value={newProduct.serialId} onChange={(e) => setNewProduct({ ...newProduct, serialId: e.target.value })} />
                        <input type="text" placeholder="Product Name" required value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
                        <input type="date" placeholder="Date of Manufacture" required value={newProduct.dateOfManufacture} onChange={(e) => setNewProduct({ ...newProduct, dateOfManufacture: e.target.value })} />
                        <input type="text" placeholder="Origin of Product" required value={newProduct.origin} onChange={(e) => setNewProduct({ ...newProduct, origin: e.target.value })} />
                        <input type="date" placeholder="Expiry Date" required value={newProduct.expiryDate} onChange={(e) => setNewProduct({ ...newProduct, expiryDate: e.target.value })} />
                        <input type="text" placeholder="Seller Info" required value={newProduct.sellerInfo} onChange={(e) => setNewProduct({ ...newProduct, sellerInfo: e.target.value })} />

                        <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: '16px' }}>
                            Add to Blockchain <ShieldCheck size={20} style={{ marginLeft: '10px' }} />
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'view_products' && (
                <div className="glass-panel" style={{ overflowX: 'auto' }}>
                    <h3>Authentic Products Catalog</h3>
                    {loading ? <p>Loading...</p> : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Serial ID</th>
                                    <th>Name</th>
                                    <th>Origin</th>
                                    <th>Manufactured</th>
                                    <th>Blockchain Hash</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p._id}>
                                        <td>{p.serialId}</td>
                                        <td>{p.name}</td>
                                        <td>{p.origin}</td>
                                        <td>{new Date(p.dateOfManufacture).toLocaleDateString()}</td>
                                        <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--primary)' }}>{p.blockHash}</td>
                                        <td>
                                            <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => deleteProduct(p._id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {activeTab === 'view_fakes' && (
                <div className="glass-panel" style={{ overflowX: 'auto' }}>
                    <h3>Reported Fake Entries</h3>
                    {loading ? <p>Loading...</p> : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Reported By</th>
                                    <th>Details</th>
                                    <th>Photo Link</th>
                                    <th>Reported At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fakes.map(f => (
                                    <tr key={f._id}>
                                        <td>{f.userId?.name} ({f.userId?.email})</td>
                                        <td>{f.details}</td>
                                        <td>{f.photoUrl ? <a href={f.photoUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>View Photo</a> : 'No photo'}</td>
                                        <td>{new Date(f.reportedAt).toLocaleString()}</td>
                                    </tr>
                                ))}
                                {fakes.length === 0 && (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center' }}>No fake entries reported.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
