import React, { useState } from 'react';
import { reportService } from '../services/api';
import { Form, Button, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const FileUpload = ({ onUpload }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError(t('dashboard.noFileChosen'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await reportService.uploadReport(file);
      onUpload(response.data.report);
      setFile(null);
      // Clear file input
      e.target.reset();
    } catch (err) {
      setError(err.response?.data?.error || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form.Group className="mb-3">
        <Form.Label>{t('dashboard.selectReport')}</Form.Label>
        <Form.Control
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.tiff"
          onChange={handleFileChange}
          disabled={loading}
        />
        <Form.Text className="text-muted">
          {t('dashboard.supports')}
        </Form.Text>
      </Form.Group>
      <Button
        variant="primary"
        type="submit"
        className="w-100"
        disabled={loading || !file}
      >
        {loading ? t('common.loading') : t('dashboard.upload')}
      </Button>
    </Form>
  );
};

export default FileUpload;
