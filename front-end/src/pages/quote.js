import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Spinner,
  ListGroup,
} from 'react-bootstrap';

function ShippingQuoteCalculator() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    originCountry: '',
    originCity: '',
    originZip: '',
    destinationCountry: '',
    destinationCity: '',
    destinationZip: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    shipmentType: 'standard',
  });
  const [quoteResult, setQuoteResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCalculateQuote = async (e) => {
    e.preventDefault();
    setIsCalculating(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock quote result
    const price = formData.shipmentType === 'express' ? '1,250.00' : '850.00';
    const estimatedDays = formData.shipmentType === 'express' ? '3-5' : '7-10';

    setQuoteResult({
      price,
      currency: 'USD',
      estimatedDays,
      services: [
        'Door-to-door delivery',
        'Customs clearance',
        'Insurance',
        'Tracking',
      ],
    });

    setIsCalculating(false);
    setStep(2);
  };

  const handleReset = () => {
    setFormData({
      originCountry: '',
      originCity: '',
      originZip: '',
      destinationCountry: '',
      destinationCity: '',
      destinationZip: '',
      weight: '',
      length: '',
      width: '',
      height: '',
      shipmentType: 'standard',
    });
    setQuoteResult(null);
    setStep(1);
  };

  return (
    <Container className="py-5">
      {step === 1 ? (
        <Card>
          <Card.Header>
            <h4>Shipping Quote Calculator</h4>
            <p>Fill in the details to get an estimated shipping cost</p>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleCalculateQuote}>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="originCountry">
                    <Form.Label>Origin Country</Form.Label>
                    <Form.Control
                      as="select"
                      name="originCountry"
                      value={formData.originCountry}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select country</option>
                      <option value="tanzania">Tanzania</option>
                      <option value="kenya">Kenya</option>
                      <option value="uganda">Uganda</option>
                      <option value="uae">United Arab Emirates</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="destinationCountry">
                    <Form.Label>Destination Country</Form.Label>
                    <Form.Control
                      as="select"
                      name="destinationCountry"
                      value={formData.destinationCountry}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select country</option>
                      <option value="china">China</option>
                      <option value="turkey">Turkey</option>
                      <option value="usa">United States</option>
                      <option value="uk">United Kingdom</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="originCity">
                    <Form.Label>Origin City</Form.Label>
                    <Form.Control
                      type="text"
                      name="originCity"
                      value={formData.originCity}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="destinationCity">
                    <Form.Label>Destination City</Form.Label>
                    <Form.Control
                      type="text"
                      name="destinationCity"
                      value={formData.destinationCity}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="originZip">
                    <Form.Label>Origin ZIP Code</Form.Label>
                    <Form.Control
                      type="text"
                      name="originZip"
                      value={formData.originZip}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="destinationZip">
                    <Form.Label>Destination ZIP Code</Form.Label>
                    <Form.Control
                      type="text"
                      name="destinationZip"
                      value={formData.destinationZip}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <h5 className="mt-4">Package Details</h5>
              <Row className="mb-3">
                <Col md={3}>
                  <Form.Group controlId="weight">
                    <Form.Label>Weight (kg)</Form.Label>
                    <Form.Control
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      min="0.1"
                      step="0.1"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group controlId="length">
                    <Form.Label>Length (cm)</Form.Label>
                    <Form.Control
                      type="number"
                      name="length"
                      value={formData.length}
                      onChange={handleChange}
                      min="1"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group controlId="width">
                    <Form.Label>Width (cm)</Form.Label>
                    <Form.Control
                      type="number"
                      name="width"
                      value={formData.width}
                      onChange={handleChange}
                      min="1"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group controlId="height">
                    <Form.Label>Height (cm)</Form.Label>
                    <Form.Control
                      type="number"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      min="1"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <h5 className="mt-4">Shipment Type</h5>
              <Form.Group>
                <Form.Check
                  type="radio"
                  label="Standard (7-10 business days)"
                  name="shipmentType"
                  value="standard"
                  checked={formData.shipmentType === 'standard'}
                  onChange={handleChange}
                />
                <Form.Check
                  type="radio"
                  label="Express (3-5 business days)"
                  name="shipmentType"
                  value="express"
                  checked={formData.shipmentType === 'express'}
                  onChange={handleChange}
                />
              </Form.Group>

              <div className="d-flex justify-content-end mt-4">
                <Button variant="primary" type="submit" disabled={isCalculating}>
                  {isCalculating ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />{' '}
                      Calculating...
                    </>
                  ) : (
                    'Calculate Quote'
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Header>
            <h4>Your Shipping Quote</h4>
            <p>Based on the information you provided</p>
          </Card.Header>
          <Card.Body>
            <Row className="mb-3">
              <Col md={6}>
                <h5>Estimated Price</h5>
                <p className="display-6">
                  {quoteResult.currency} {quoteResult.price}
                </p>
              </Col>
              <Col md={6}>
                <h5>Estimated Delivery Time</h5>
                <p className="display-6">{quoteResult.estimatedDays} business days</p>
              </Col>
            </Row>

            <h5>Included Services</h5>
            <ListGroup className="mb-3">
              {quoteResult.services.map((service, index) => (
                <ListGroup.Item key={index}>{service}</ListGroup.Item>
              ))}
            </ListGroup>

            <h5>Quote Details</h5>
            <Row>
              <Col md={6}>
                <p>
                  <strong>Shipment Type:</strong> {formData.shipmentType}
                </p>
              </Col>
              <Col md={6}>
                <p>
                  <strong>Quote Valid Until:</strong> 30 days from today
                </p>
              </Col>
            </Row>
          </Card.Body>
          <Card.Footer className="d-flex justify-content-between">
            <Button variant="outline-secondary" onClick={handleReset}>
              Get Another Quote
            </Button>
            <Button variant="primary">Proceed to Booking</Button>
          </Card.Footer>
        </Card>
      )}
    </Container>
  );
}

export default ShippingQuoteCalculator;
