import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';

const InvoiceCreate = ({ show, onClose, onAddInvoice, shipmentId }) => {
  const [formData, setFormData] = useState({
    invoiceNo: '',
    customer: '',
    date: '',
    dueDate: '',
    amount: '',
    status: 'Unpaid'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newInvoice = {
      ...formData,
      shipment: shipmentId
    };
    onAddInvoice(newInvoice);
    onClose();
    setFormData({
      invoiceNo: '',
      customer: '',
      date: '',
      dueDate: '',
      amount: '',
      status: 'Unpaid'
    });
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create Invoice</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Group className="mb-3">
            <Form.Label>Invoice No.</Form.Label>
            <Form.Control
              type="text"
              name="invoiceNo"
              value={formData.invoiceNo}
              onChange={handleChange}
              placeholder="Enter invoice number"
              required
            />
          </Form.Group>
            <Form.Label>Customer</Form.Label>
            <Form.Control
              type="text"
              name="customer"
              value={formData.customer}
              onChange={handleChange}
              placeholder="Enter customer name"
              required
            />
          </Form.Group>

          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Invoice Date</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Due Date</Form.Label>
                <Form.Control
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Amount</Form.Label>
            <InputGroup>
              <InputGroup.Text>TZS</InputGroup.Text>
              <Form.Control
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                required
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select name="status" value={formData.status} onChange={handleChange}>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
            </Form.Select>
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={onClose} className="me-2">Cancel</Button>
            <Button type="submit" variant="primary">Save Invoice</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default InvoiceCreate;
