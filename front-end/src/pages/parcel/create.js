import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import api from '../../utils/api';

const ParcelCreate = ({ show, onClose, onAddParcel }) => {
  const [shipments, setShipments] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [formData, setFormData] = useState({
    parcel_no: '',
    shipment: '',
    customer_id: '',
    weight: '',
    weight_unit: 'kg',
    volume: '',
    volume_unit: 'm³',
    charge: '',
    payment: 'Unpaid',
    commodity_type: 'Box',
    description: '',
  });

  useEffect(() => {
    const fetchOptions = async () => {
      const token = localStorage.getItem('token');
      try {
        const [shipmentRes, customerRes] = await Promise.all([
          api.get('/shipments/', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/customers/', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setShipments(shipmentRes.data.results || shipmentRes.data);
        setCustomers(customerRes.data.results || customerRes.data);
      } catch (error) {
        console.error('Error loading shipments or customers:', error);
      }
    };
    fetchOptions();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    // 👇 Properly structured payload for your Django model
    const payload = {
      parcel_no: formData.parcel_no,
      shipment: formData.shipment, // this should be shipment_no (e.g., "SHP-001")
      customer_id: formData.customer_id, // this should be customer ID (e.g., 1)
      weight: parseFloat(formData.weight),
      weight_unit: formData.weight_unit,
      volume: parseFloat(formData.volume),
      volume_unit: formData.volume_unit,
      charge: formData.charge,
      payment: formData.payment,
      commodity_type: formData.commodity_type,
      description: formData.description,
    };

    try {
      const response = await api.post('/parcels/', payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      onAddParcel(response.data);
      onClose();
      alert('Parcel added successfully!');

      // Reset form
      setFormData({
        parcel_no: '',
        shipment: '',
        customer_id: '',
        weight: '',
        weight_unit: 'kg',
        volume: '',
        volume_unit: 'm³',
        charge: '',
        payment: 'Unpaid',
        commodity_type: 'Box',
        description: ''
      });

    } catch (error) {
      console.error('Failed to create parcel:', error.response?.data || error);
      alert('Failed to create parcel. Please check your input.');
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add New Parcel</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Parcel No</Form.Label>
            <Form.Control
              type="text"
              name="parcel_no"
              value={formData.parcel_no}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Shipment</Form.Label>
                <Form.Select
                  name="shipment"
                  value={formData.shipment}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Shipment</option>
                  {shipments.map((s) => (
                    <option key={s.shipment_no} value={s.shipment_no}>
                      {s.shipment_no}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-2">
                <Form.Label>Customer</Form.Label>
                <Form.Select
                  name="customer_id"
                  value={formData.customer_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map((cust) => (
                    <option key={cust.id} value={cust.id}>
                      {cust.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

            </Col>
          </Row>

          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Weight</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    required
                  />
                  <Form.Select
                    name="weight_unit"
                    value={formData.weight_unit}
                    onChange={handleChange}
                  >
                    <option value="kg">kg</option>
                    <option value="lbs">lbs</option>
                    <option value="tons">tons</option>
                  </Form.Select>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Volume</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="number"
                    name="volume"
                    value={formData.volume}
                    onChange={handleChange}
                    required
                  />
                  <Form.Select
                    name="volume_unit"
                    value={formData.volume_unit}
                    onChange={handleChange}
                  >
                    <option value="m³">m³</option>
                    <option value="ft³">ft³</option>
                  </Form.Select>
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Charge (TZS)</Form.Label>
            <Form.Control
              type="number"
              name="charge"
              value={formData.charge}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Payment</Form.Label>
            <Form.Select
              name="payment"
              value={formData.payment}
              onChange={handleChange}
            >
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
            </Form.Select>
          </Form.Group>


          <Form.Group className="mb-3">
            <Form.Label>Commodity Type</Form.Label>
            <Form.Select
              name="commodity_type"
              value={formData.commodity_type}
              onChange={handleChange}
            >
              <option value="Box">Box</option>
              <option value="Parcel">Parcel</option>
              <option value="Envelope">Envelope</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              name="description"
              value={formData.description}
              onChange={handleChange}
              as="textarea"
              rows={2}
            />
          </Form.Group>

          <div className="d-flex justify-content-end mt-4">
            <Button variant="secondary" onClick={onClose} className="me-2">
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Parcel
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ParcelCreate;
