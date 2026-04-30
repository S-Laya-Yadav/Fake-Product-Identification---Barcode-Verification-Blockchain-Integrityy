import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ShieldCheck, ShieldAlert, AlertCircle, Search } from 'lucide-react';

const Home = () => {
    const [scanResult, setScanResult] = useState(null);
    const [productDetails, setProductDetails] = useState(null);
    const [errorStatus, setErrorStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [manualInput, setManualInput] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        let scanner = null;
        if (!scanResult && !errorStatus && !productDetails) {
            scanner = new Html5QrcodeScanner('reader', {
                fps: 10,
                qrbox: {
                    width: 250,
                    height: 250,
                },
            }, false);

            scanner.render(
                (result) => {
                    if (scanner) {
                        scanner.clear().catch(console.error);
                    }
                    setScanResult(result);
                    verifyProduct(result);
                },
                (error) => {
                    // Ignored quiet scan failures
                }
            );
        }

        return () => {
            if (scanner) {
                scanner.clear().catch(error => console.error("Failed to clear scanner", error));
            }
        };
    }, [scanResult, errorStatus, productDetails]);

    const verifyProduct = async (serialId) => {
        if (!serialId) return;
        setLoading(true);
        setErrorStatus(null);
        setProductDetails(null);
        setScanResult(serialId);

        try {
            const user = JSON.parse(localStorage.getItem('userInfo'));
            if (!user) {
                navigate('/login');
                return;
            }

            const { data } = await api.get(`/products/${serialId}`);
            setProductDetails(data);
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setErrorStatus('NOT_FOUND');
            } else {
                setErrorStatus('SERVER_ERROR');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        verifyProduct(manualInput);
    };

    const resetScan = () => {
        setScanResult(null);
        setProductDetails(null);
        setErrorStatus(null);
        setManualInput('');
    };

    return (
        <div className="home-container animate-fade-in" style={{ padding: '20px 0' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'linear-gradient(90deg, #4ade80, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Blockchain Product Verification
                </h1>
                <p className="text-muted">Scan the barcode or enter the Serial ID to verify authenticity.</p>
            </div>

            {!scanResult && !productDetails && !errorStatus && (
                <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                    <div className="glass-panel" style={{ textAlign: 'center', marginBottom: '1rem' }}>
                        <div id="reader" style={{ width: '100%', marginBottom: '1rem', backgroundColor: 'var(--glass-bg)', borderRadius: '8px' }}></div>
                        <p className="text-muted" style={{ fontSize: '0.85rem' }}>Hold the camera steady over the barcode.</p>
                    </div>

                    <div className="glass-panel" style={{ textAlign: 'center' }}>
                        <p style={{ marginBottom: '10px' }}>Or enter Barcode ID manually:</p>
                        <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="text"
                                placeholder="e.g. HACKATHON-123"
                                value={manualInput}
                                onChange={(e) => setManualInput(e.target.value)}
                                style={{ marginBottom: 0 }}
                            />
                            <button type="submit" className="btn btn-primary" style={{ padding: '0 16px' }} disabled={!manualInput}>
                                <Search size={20} />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {loading && (
                <div style={{ textAlign: 'center', margin: '4rem 0' }}>
                    <h2 className="text-muted">Verifying on Blockchain...</h2>
                </div>
            )}

            {productDetails && !loading && (
                <div className="glass-panel animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        {productDetails.authentic ? (
                            <ShieldCheck size={64} color="#4ade80" style={{ margin: '0 auto' }} />
                        ) : (
                            <ShieldAlert size={64} color="#ef4444" style={{ margin: '0 auto' }} />
                        )}
                        <h2 style={{ marginTop: '1rem', color: productDetails.authentic ? 'var(--primary)' : 'var(--danger)' }}>
                            {productDetails.authentic ? 'Authentic Product' : 'Tampered Data Detected'}
                        </h2>
                        {!productDetails.authentic && (
                            <p className="text-muted">{productDetails.message}</p>
                        )}
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '16px' }}>
                        <p><strong>Product Name:</strong> {productDetails.product.name}</p>
                        <p><strong>Serial ID:</strong> {productDetails.product.serialId}</p>
                        <p><strong>Origin:</strong> {productDetails.product.origin}</p>
                        <p><strong>Mfg Date:</strong> {new Date(productDetails.product.dateOfManufacture).toLocaleDateString()}</p>
                        <p><strong>Expiry Date:</strong> {new Date(productDetails.product.expiryDate).toLocaleDateString()}</p>
                        <p><strong>Seller Info:</strong> {productDetails.product.sellerInfo}</p>
                        <p style={{ marginTop: '10px' }}>
                            <strong>Blockchain Hash:</strong>
                            <br /><span style={{ fontSize: '0.75rem', wordBreak: 'break-all', color: 'var(--accent)' }}>{productDetails.product.blockHash}</span>
                        </p>
                    </div>

                    <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} onClick={resetScan}>
                        Scan Another Product
                    </button>
                </div>
            )}

            {errorStatus === 'NOT_FOUND' && !loading && (
                <div className="glass-panel animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                    <AlertCircle size={64} color="#ef4444" style={{ margin: '0 auto' }} />
                    <h2 style={{ marginTop: '1rem', color: 'var(--danger)' }}>Product Not Found!</h2>
                    <p className="text-muted" style={{ marginBottom: '2rem' }}>
                        The scanned barcode/ID <strong>{scanResult}</strong> does not match any authentic product in our blockchain. This product is likely fake.
                    </p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button className="btn btn-accent" onClick={() => navigate('/report', { state: { scanResult } })}>
                            Report Fake Product
                        </button>
                        <button className="btn btn-primary" onClick={resetScan}>
                            Try Again
                        </button>
                    </div>
                </div>
            )}

            {errorStatus === 'SERVER_ERROR' && !loading && (
                <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                    <h3 style={{ color: 'var(--danger)' }}>Failed to verify. Please try logging in or try again later.</h3>
                    <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={resetScan}>Try Again</button>
                </div>
            )}
        </div>
    );
};

export default Home;
