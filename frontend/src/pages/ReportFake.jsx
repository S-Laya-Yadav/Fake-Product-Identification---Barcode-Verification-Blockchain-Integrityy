import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const ReportFake = () => {
    const [details, setDetails] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.state?.scanResult) {
            setDetails(`Scanned fake ID: ${location.state.scanResult}\n\nAdditional Details: `);
        }
    }, [location.state]);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setMessage('');
            setError('');
            await api.post('/fakes', { details, photoUrl });
            setMessage('Fake product reported successfully. Thank you for your report.');
            setTimeout(() => navigate('/'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', marginTop: '40px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--danger)' }}>
                Report Fake Product
            </h2>
            {message && <div style={{ background: 'rgba(74,222,128,0.2)', color: 'var(--primary)', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>{message}</div>}
            {error && <div style={{ background: 'rgba(239,68,68,0.2)', color: 'var(--danger)', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>{error}</div>}
            
            <form onSubmit={submitHandler}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Incident Details</label>
                    <textarea 
                        rows="5"
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        required
                        placeholder="Describe where and when you found this fake product..."
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Photo Evidence URL (Optional)</label>
                    <input 
                        type="text" 
                        value={photoUrl}
                        onChange={(e) => setPhotoUrl(e.target.value)}
                        placeholder="https://example.com/photo.jpg"
                    />
                </div>
                <button type="submit" className="btn btn-danger" style={{ width: '100%' }} disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Report'}
                </button>
            </form>
        </div>
    );
};

export default ReportFake;
