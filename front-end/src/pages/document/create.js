import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const DocumentCreate = ({ show, onClose, onAddDocument, shipments = [], customers = [], parcels = [] }) => {
  const [formData, setFormData] = useState({
    document_no: '',
    shipment: '',
    customer: '',
    parcel: '',
    document_type: 'invoice',
    file: null,
    description: ''
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'file' ? files[0] : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Prepare form data for file upload
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });

    onAddDocument(data);
    onClose();
    setFormData({
      document_no: '',
      shipment: '',
      customer: '',
      parcel: '',
      document_type: 'invoice',
      file: null,
      description: ''
    });
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add New Document</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit} encType="multipart/form-data">
          <Form.Group className="mb-3">
            <Form.Label>Document No</Form.Label>
            <Form.Control
              type="text"
              name="document_no"
              value={formData.document_no}
              onChange={handleChange}
              placeholder="Enter document number"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Shipment</Form.Label>
            <Form.Select name="shipment" value={formData.shipment} onChange={handleChange} required>
              <option value="">Select Shipment</option>
              {shipments.map((s) => (
                <option key={s.shipment_no} value={s.shipment_no}>{s.shipment_no}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Customer (optional)</Form.Label>
            <Form.Select name="customer" value={formData.customer} onChange={handleChange}>
              <option value="">Select Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Parcel (optional)</Form.Label>
            <Form.Select name="parcel" value={formData.parcel} onChange={handleChange}>
              <option value="">Select Parcel</option>
              {parcels.map((p) => (
                <option key={p.parcel_no} value={p.parcel_no}>{p.parcel_no}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Document Type</Form.Label>
            <Form.Select name="document_type" value={formData.document_type} onChange={handleChange} required>
              <option value="invoice">Invoice</option>
              <option value="bill_of_lading">Bill of Lading</option>
              <option value="customs_clearance">Customs Clearance</option>
              <option value="packing_list">Packing List</option>
              <option value="other">Other</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Upload File</Form.Label>
            <Form.Control
              type="file"
              name="file"
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description (optional)</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </Form.Group>

          <div className="d-flex justify-content-end mt-3">
            <Button variant="secondary" onClick={onClose} className="me-2">Cancel</Button>
            <Button type="submit" variant="primary">Add Document</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default DocumentCreate;
