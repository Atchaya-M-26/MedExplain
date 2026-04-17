import React, { useState, useContext, useEffect } from 'react';
import { Container, Card, Row, Col, Button, Badge, Spinner, Modal, Form, Dropdown } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const imageTypeLabels = {
  'chest-xray': 'Chest X-ray',
  'ct-scan': 'CT Scan',
  'mri': 'MRI'
};

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const [deletedItems, setDeletedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);

  // Change Password Modal
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changePasswordData, setChangePasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState('');
  const [changePasswordSuccess, setChangePasswordSuccess] = useState('');

  // Forgot Password Modal
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');

  // Delete Account Modal
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deleteAccountPassword, setDeleteAccountPassword] = useState('');
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState('');
  const [deleteAccountConfirm, setDeleteAccountConfirm] = useState(false);

  // Permanent Delete Modal
  const [showPermanentDeleteModal, setShowPermanentDeleteModal] = useState(false);
  const [permanentDeleteItem, setPermanentDeleteItem] = useState(null);
  const [permanentDeleteLoading, setPermanentDeleteLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadDeletedHistory();
      loadDeletedReports();
      loadQRCode();
    }
  }, [user]);

  const loadDeletedReports = () => {
    try {
      const stored = localStorage.getItem('deletedReports');
      // Note: In a real app, you'd fetch actual report data from backend
      // For now, we just track the IDs
      if (stored) {
        const reportIds = JSON.parse(stored);
        setDeletedItems(prev => [...prev, ...reportIds.map(id => ({
          _id: id,
          imageType: 'report',
          prediction: 'General Checkup',
          riskLevel: 'Low',
          deletedAt: new Date()
        }))]);
      }
    } catch (err) {
      console.error('Error loading deleted reports:', err);
    }
  };

  const loadQRCode = async () => {
    try {
      if (!user?.patientId) return;
      
      setQrLoading(true);
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${API_URL}/qr/${user.patientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setQrCode(response.data.qr);
    } catch (err) {
      console.error('Error loading QR code:', err);
    } finally {
      setQrLoading(false);
    }
  };

  const loadDeletedHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      // Fetch both deleted analyses and deleted reports
      try {
        const [analysesRes, reportsRes] = await Promise.all([
          axios.get(`${API_URL}/image-analysis/deleted/history`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/reports/deleted/history`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
        
        // Combine and merge deleted items
        const deletedAnalyses = analysesRes.data.analyses || [];
        const deletedReports = reportsRes.data.data || [];
        
        // Convert reports to same format as analyses for consistency
        const formattedReports = deletedReports.map(report => ({
          ...report,
          imageType: 'report',
          fileName: report.fileName,
          uploadDate: report.deletedAt,
          status: 'completed'
        }));
        
        // Combine and sort by deletion date
        const combined = [...deletedAnalyses, ...formattedReports]
          .sort((a, b) => new Date(b.uploadDate || b.deletedAt) - new Date(a.uploadDate || a.deletedAt));
        
        setDeletedItems(combined);
        setError('');
      } catch (apiError) {
        console.error('API Error loading deleted history:', apiError.response?.data || apiError.message);
        // Even if one fails, try to load whatever we can
        try {
          const analysesRes = await axios.get(`${API_URL}/image-analysis/deleted/history`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setDeletedItems(analysesRes.data.analyses || []);
          setError('');
          return;
        } catch (e) {
          console.error('Fallback error:', e);
          throw apiError;
        }
      }
    } catch (err) {
      console.error('Error loading deleted history:', err);
      setError('Failed to load deleted items');
      setDeletedItems([]);
    } finally {
      setLoading(false);
    }
  };

  const restoreAnalysis = async (analysisId, itemType) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      if (itemType === 'report') {
        // Restore deleted report
        await axios.patch(`${API_URL}/reports/${analysisId}/restore`, {}, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        // Restore deleted analysis/scan
        await axios.patch(`${API_URL}/image-analysis/${analysisId}/restore`, {}, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      
      // Remove from deleted list
      setDeletedItems(deletedItems.filter(item => item._id !== analysisId));
    } catch (err) {
      console.error('Error restoring item:', err);
      alert('Failed to restore item');
    }
  };

  const handlePermanentDelete = async () => {
    if (!permanentDeleteItem) return;

    setPermanentDeleteLoading(true);
    try {
      const { analysisId, itemType } = permanentDeleteItem;
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      if (itemType === 'report') {
        // Permanently delete report from backend
        await axios.delete(`${API_URL}/reports/${analysisId}/permanent`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        // Permanently delete scan from backend
        await axios.delete(`${API_URL}/image-analysis/${analysisId}/permanent`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      
      // Remove from deleted list
      setDeletedItems(deletedItems.filter(item => item._id !== analysisId));
      setShowPermanentDeleteModal(false);
      setPermanentDeleteItem(null);
    } catch (err) {
      console.error('Error permanently deleting item:', err);
      alert('Failed to permanently delete item');
    } finally {
      setPermanentDeleteLoading(false);
    }
  };

  if (!user) {
    return (
      <Container className="mt-5">
        <p>Loading user information...</p>
      </Container>
    );
  }

  const handleChangePassword = async () => {
    setChangePasswordError('');
    setChangePasswordSuccess('');

    if (!changePasswordData.currentPassword || !changePasswordData.newPassword || !changePasswordData.confirmPassword) {
      setChangePasswordError('All fields are required');
      return;
    }

    if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
      setChangePasswordError('New passwords do not match');
      return;
    }

    setChangePasswordLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      await axios.post(`${API_URL}/auth/change-password`, {
        currentPassword: changePasswordData.currentPassword,
        newPassword: changePasswordData.newPassword
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setChangePasswordSuccess('Password changed successfully!');
      setChangePasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setShowChangePassword(false);
        setChangePasswordSuccess('');
      }, 2000);
    } catch (err) {
      setChangePasswordError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setChangePasswordLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setForgotPasswordError('');
    setForgotPasswordSuccess('');

    if (!forgotPasswordEmail) {
      setForgotPasswordError('Please enter your email address');
      return;
    }

    setForgotPasswordLoading(true);
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      await axios.post(`${API_URL}/auth/forgot-password`, {
        email: forgotPasswordEmail
      });

      setForgotPasswordSuccess('Password reset email sent! Check your inbox.');
      setForgotPasswordEmail('');
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotPasswordSuccess('');
      }, 3000);
    } catch (err) {
      setForgotPasswordError(err.response?.data?.error || 'Failed to send reset email');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteAccountError('');

    if (!deleteAccountPassword) {
      setDeleteAccountError('Please enter your password to confirm deletion');
      return;
    }

    if (!deleteAccountConfirm) {
      setDeleteAccountError('Please confirm you want to delete your account');
      return;
    }

    setDeleteAccountLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      await axios.delete(`${API_URL}/auth/account`, {
        data: { password: deleteAccountPassword },
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Log out user
      logout();
      window.location.href = '/login';
    } catch (err) {
      setDeleteAccountError(err.response?.data?.error || 'Failed to delete account');
    } finally {
      setDeleteAccountLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', paddingBottom: '2rem' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #2b7a8e 0%, #1e5a6b 100%)', padding: '2rem 0', marginBottom: '2rem' }}>
        <Container>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ color: 'white', fontWeight: 'bold', marginBottom: '0.5rem' }}>My Profile</h1>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 0 }}>View and manage your account information</p>
            </div>
            <Dropdown>
              <Dropdown.Toggle variant="light" id="settings-dropdown" style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ⚙️
              </Dropdown.Toggle>

              <Dropdown.Menu align="end">
                <Dropdown.Item onClick={() => setShowChangePassword(true)}>
                  🔐 Change Password
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setShowForgotPassword(true)}>
                  🔑 Forgot Password
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={() => setShowDeleteAccount(true)} style={{ color: '#dc3545' }}>
                  🗑️ Delete Account
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Container>
      </div>

      <Container>
        <Row>
          {/* User Info Card */}
          <Col lg={6} className="mb-4">
            <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Card.Header style={{ background: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
                <Card.Title className="mb-0">Account Information</Card.Title>
              </Card.Header>
              <Card.Body>
                {/* Profile Picture */}
                {user.picture && (
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <img 
                      src={user.picture} 
                      alt={user.name}
                      style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        border: '3px solid #2b7a8e',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                )}

                {/* Name */}
                <div className="mb-4">
                  <small style={{ color: '#6c757d', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    Full Name
                  </small>
                  <h5 style={{ marginBottom: 0 }}>{user.name}</h5>
                </div>

                {/* Email */}
                <div className="mb-4">
                  <small style={{ color: '#6c757d', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    Email Address
                  </small>
                  <p style={{ marginBottom: 0, wordBreak: 'break-all' }}>{user.email}</p>
                </div>

                {/* Patient ID */}
                {user.patientId && (
                  <div className="mb-4">
                    <small style={{ color: '#6c757d', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                      Patient ID
                    </small>
                    <p style={{ marginBottom: 0 }}>
                      <Badge bg="primary">{user.patientId}</Badge>
                    </p>
                  </div>
                )}

                {/* Role */}
                <div className="mb-4">
                  <small style={{ color: '#6c757d', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    Account Type
                  </small>
                  <Badge bg={user.role === 'doctor' ? 'success' : 'info'}>
                    {user.role === 'doctor' ? 'Healthcare Provider' : 'Patient'}
                  </Badge>
                </div>

                {/* Language */}
                <div className="mb-4">
                  <small style={{ color: '#6c757d', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    Preferred Language
                  </small>
                  <p style={{ marginBottom: 0, textTransform: 'capitalize' }}>
                    {user.language || 'English'}
                  </p>
                </div>

                {/* Joined Date */}
                <div>
                  <small style={{ color: '#6c757d', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    Member Since
                  </small>
                  <p style={{ marginBottom: 0 }}>
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Account Stats */}
          <Col lg={6} className="mb-4">
            <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Card.Header style={{ background: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
                <Card.Title className="mb-0">QR Code</Card.Title>
              </Card.Header>
              <Card.Body style={{ textAlign: 'center', padding: '2rem' }}>
                {qrLoading ? (
                  <div style={{ padding: '2rem' }}>
                    <Spinner animation="border" variant="primary" size="sm" />
                    <p style={{ marginTop: '1rem', color: '#6c757d' }}>Generating QR code...</p>
                  </div>
                ) : qrCode ? (
                  <div>
                    <img 
                      src={qrCode} 
                      alt="Patient QR Code"
                      style={{
                        maxWidth: '200px',
                        border: '2px solid #dee2e6',
                        padding: '1rem',
                        borderRadius: '8px'
                      }}
                    />
                    <p style={{ marginTop: '1rem', color: '#6c757d', fontSize: '0.9rem' }}>
                      Share this QR code with healthcare providers to give them access to your medical records
                    </p>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = qrCode;
                        link.download = `patient-${user?.patientId}-qr.png`;
                        link.click();
                      }}
                    >
                      Download QR Code
                    </Button>
                  </div>
                ) : (
                  <div style={{ padding: '2rem' }}>
                    <p style={{ color: '#6c757d' }}>QR code not available</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Modals */}

        {/* Change Password Modal */}
        <Modal show={showChangePassword} onHide={() => setShowChangePassword(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Change Password</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {changePasswordError && (
              <div style={{ background: '#fee2e2', color: '#9b1c1c', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
                {changePasswordError}
              </div>
            )}
            {changePasswordSuccess && (
              <div style={{ background: '#d1fae5', color: '#065f46', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
                {changePasswordSuccess}
              </div>
            )}
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Current Password</Form.Label>
                <Form.Control 
                  type="password" 
                  value={changePasswordData.currentPassword}
                  onChange={(e) => setChangePasswordData({ ...changePasswordData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control 
                  type="password" 
                  value={changePasswordData.newPassword}
                  onChange={(e) => setChangePasswordData({ ...changePasswordData, newPassword: e.target.value })}
                  placeholder="Enter new password"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Confirm New Password</Form.Label>
                <Form.Control 
                  type="password" 
                  value={changePasswordData.confirmPassword}
                  onChange={(e) => setChangePasswordData({ ...changePasswordData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowChangePassword(false)}>Cancel</Button>
            <Button 
              variant="primary" 
              onClick={handleChangePassword}
              disabled={changePasswordLoading}
            >
              {changePasswordLoading ? 'Changing...' : 'Change Password'}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Forgot Password Modal */}
        <Modal show={showForgotPassword} onHide={() => setShowForgotPassword(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Reset Password</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {forgotPasswordError && (
              <div style={{ background: '#fee2e2', color: '#9b1c1c', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
                {forgotPasswordError}
              </div>
            )}
            {forgotPasswordSuccess && (
              <div style={{ background: '#d1fae5', color: '#065f46', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
                {forgotPasswordSuccess}
              </div>
            )}
            <p style={{ color: '#6c757d', marginBottom: '1rem' }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control 
                  type="email" 
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowForgotPassword(false)}>Cancel</Button>
            <Button 
              variant="primary" 
              onClick={handleForgotPassword}
              disabled={forgotPasswordLoading}
            >
              {forgotPasswordLoading ? 'Sending...' : 'Send Reset Email'}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Account Modal */}
        <Modal show={showDeleteAccount} onHide={() => setShowDeleteAccount(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Delete Account</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {deleteAccountError && (
              <div style={{ background: '#fee2e2', color: '#9b1c1c', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
                {deleteAccountError}
              </div>
            )}
            <div style={{ background: '#fef3c7', color: '#92400e', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
              <strong>⚠️ Warning:</strong> This action cannot be undone. Your account and all associated data will be permanently deleted.
            </div>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Enter your password to confirm</Form.Label>
                <Form.Control 
                  type="password" 
                  value={deleteAccountPassword}
                  onChange={(e) => setDeleteAccountPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Check 
                  type="checkbox" 
                  id="confirm-delete"
                  label="I understand that this will permanently delete my account and cannot be recovered"
                  checked={deleteAccountConfirm}
                  onChange={(e) => setDeleteAccountConfirm(e.target.checked)}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteAccount(false)}>Cancel</Button>
            <Button 
              variant="danger" 
              onClick={handleDeleteAccount}
              disabled={deleteAccountLoading || !deleteAccountConfirm || !deleteAccountPassword}
            >
              {deleteAccountLoading ? 'Deleting...' : 'Delete Account'}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Permanent Delete Item Modal */}
        <Modal show={showPermanentDeleteModal} onHide={() => setShowPermanentDeleteModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Permanently Delete Item</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div style={{ background: '#fee2e2', color: '#9b1c1c', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
              <strong>⚠️ Warning:</strong> This action will permanently delete this item from your account and cannot be recovered.
            </div>
            <p style={{ marginBottom: '1rem', color: '#6c757d' }}>
              Are you sure you want to permanently delete this item? This action cannot be undone.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPermanentDeleteModal(false)}>Cancel</Button>
            <Button 
              variant="danger" 
              onClick={handlePermanentDelete}
              disabled={permanentDeleteLoading}
            >
              {permanentDeleteLoading ? 'Deleting...' : 'Yes, Delete Permanently'}
            </Button>
          </Modal.Footer>
        </Modal>

        <Row>
          <Col>
            <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Card.Header style={{ background: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
                <Card.Title className="mb-0">Deleted History</Card.Title>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <Spinner animation="border" variant="primary" size="sm" />
                    <p style={{ marginTop: '1rem', color: '#6c757d' }}>Loading deleted items...</p>
                  </div>
                ) : error ? (
                  <div style={{ color: '#dc3545', padding: '1rem', background: '#fee2e2', borderRadius: '4px' }}>
                    {error}
                  </div>
                ) : deletedItems.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗑️</div>
                    <p style={{ color: '#6c757d', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      No deleted items yet
                    </p>
                    <p style={{ color: '#adb5bd', marginBottom: 0, fontSize: '0.85rem' }}>
                      When you delete reports or scan analyses, they will appear here
                    </p>
                  </div>
                ) : (
                  <div>
                    {deletedItems.map((item) => (
                      <div 
                        key={item._id} 
                        style={{
                          padding: '1rem',
                          background: '#f8f9fa',
                          borderRadius: '4px',
                          marginBottom: '1rem',
                          border: '1px solid #dee2e6',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                            {item.imageType === 'report' ? 'General Checkup' : (imageTypeLabels[item.imageType] || item.imageType)}
                          </div>
                          <small style={{ color: '#6c757d' }}>
                            Deleted: {formatDate(item.deletedAt)}
                          </small>
                          <div style={{ marginTop: '0.5rem' }}>
                            <Badge bg="danger" style={{ marginRight: '0.5rem' }}>
                              {item.riskLevel}
                            </Badge>
                            <Badge bg="secondary">
                              {item.prediction}
                            </Badge>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => restoreAnalysis(item._id, item.imageType)}
                          >
                            Restore
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => {
                              setPermanentDeleteItem({ analysisId: item._id, itemType: item.imageType });
                              setShowPermanentDeleteModal(true);
                            }}
                          >
                            Delete Permanently
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Profile;
