import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';

const ShipmentCreate = ({ show, onClose, onAddShipment }) => {
    const [formData, setFormData] = useState({
        shipment_no: '',
        transport: '',
        vessel: '',
        weight: '',
        weightunit: 'kg',     
        volume: '',
        volumeunit: 'm3',     
        origin: '',
        destination: '',
        status: '',
      });
      

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value.trimStart() }));
  };
  

  const handleSubmit = (e) => {
    e.preventDefault();
  
    // List of required fields
    const requiredFields = ["shipment_no", "vessel", "weight", "volume", "origin", "destination", "status"];
  
    const missingFields = requiredFields.filter(field => !formData[field]?.toString().trim());
  
    if (missingFields.length > 0) {
      alert(`Please fill in the following fields: ${missingFields.join(", ")}`);
      return;
    }
  
    // All fields valid — add shipment
    onAddShipment(formData);
  
    // Reset form
    setFormData({
      shipment_no: '',
      transport: '',
      vessel: '',
      weight: '',
      weightunit: 'kg',
      volume: '',
      volumeunit: 'm3',
      origin: '',
      destination: '',
      status: '',
    });
  
    onClose();
  };
  

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add New Shipment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
            <Form.Label>Shipment No</Form.Label>
            <Form.Control
            type="text"
            name="shipment_no"
            value={formData.shipment_no}
            onChange={handleChange}
            placeholder="Enter shipment number"
            required
            />
        </Form.Group>

        <Form.Group className="mb-3">
            <Form.Label>Transport Mode</Form.Label>
            <Form.Select
            name="transport"
            value={formData.transport}
            onChange={handleChange}
            required
            >
            <option value="" disabled hidden>Select transport mode</option>
            <option value="Air">Air</option>
            <option value="Sea">Sea</option>
            <option value="Road">Road</option>
            </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
            <Form.Label>Vessel</Form.Label>
            <Form.Control
            type="text"
            name="vessel"
            value={formData.vessel}
            onChange={handleChange}
            placeholder="Enter vessel name"
            required
            />
        </Form.Group>

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
                    placeholder="Enter weight"
                    required
                />
                <Form.Select
                    name='weightunit'
                    value={formData.weightunit}
                    onChange={handleChange}
                    style={{ maxWidth: '6rem' }}
                >
                    <option value='kg'>kg</option>
                    <option value='lb'>lb</option>
                    <option value='ton'>ton</option>
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
                    placeholder="Enter volume"
                    required
                />
                <Form.Select
                    name='volumeunit'
                    value={formData.volumeunit}
                    onChange={handleChange}
                    style={{ maxWidth: '6rem' }}
                >
                    <option value='m3'>m³</option>
                    <option value='ft3'>ft³</option>
                    <option value='L'>L</option>
                </Form.Select>
                </InputGroup>
            </Form.Group>
            </Col>
        </Row>

        <Form.Group className="mb-3">
            <Form.Label>Origin</Form.Label>
            <Form.Control
            type="text"
            name="origin"
            value={formData.origin}
            onChange={handleChange}
            placeholder="Enter origin location"
            required
            />
        </Form.Group>

        <Form.Group className="mb-3">
            <Form.Label>Destination</Form.Label>
            <Form.Control
            type="text"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            placeholder="Enter destination location"
            required
            />
        </Form.Group>

        <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
            >
                <option value="">Select status</option>
                <option value="In-transit">In-transit</option>
                <option value="Delivered">Delivered</option>
            </Form.Select>
        </Form.Group>


        <Button
            type="submit"
            variant="primary"
            className="d-block mx-auto"
            style={{ width: '50%' }}
            >
            Submit
        </Button>

    </Form>

      </Modal.Body>
    </Modal>
  );
};

export default ShipmentCreate;
