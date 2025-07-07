import React from 'react';
import { Card, Button, Tabs, Tab, Table } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ParcelPage from '../parcel/parcels';
import InvoiceList from '../invoice/list';
import api from '../../utils/api';

const CustomerDetails = ({}) => {
   const { id } = useParams(); 
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await api.get(`/customers/${id}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCustomer(res.data);
      } catch (error) {
        console.error('Failed to fetch customer details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  if (loading) return <p className="text-center">Loading customer details...</p>;
  if (!customer) return <p className="text-center text-danger">Customer not found.</p>;

  const handleGenerateInvoice = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await api.get(`/customers/${id}/generate-invoice/`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${customer.name}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Failed to generate invoice:', error);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="fs-4 fw-semibold mb-3">Customer Details</h2>

      <div className="row mb-4">
        {/* Left Column - Summary */}
        <div className="col-md-8">
          <Card className="mb-3">
            <Card.Header className="d-flex justify-content-between">
              <span className="text-muted fw-bold">Customer Summary</span>
              <div>
                <Button variant="primary" size="sm" className="me-2" onClick={handleGenerateInvoice}>Generate Invoice</Button>
                <Button variant="link" size="sm">Edit</Button>
              </div>
            </Card.Header>
            <Card.Body>
              <Table bordered responsive style={{ fontSize: '0.9rem' }}>
                <tbody>
                  <tr>
                    <td>Name:</td>
                    <td><strong>{customer.name}</strong></td>
                  </tr>
                  <tr>
                    <td>Email:</td>
                    <td><strong>{customer.email}</strong></td>
                  </tr>
                  <tr>
                    <td>Phone:</td>
                    <td><strong>{customer.phone}</strong></td>
                  </tr>
                  <tr>
                    <td>Address:</td>
                    <td><strong>{customer.address}</strong></td>
                  </tr>
                  <tr>
                    <td>Status:</td>
                    <td><strong>{customer.status}</strong></td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-4">
            <Card>
                <Card.Header>
                    <span className="text-muted fw-bold">Parcel Status Updates</span>
                </Card.Header>
                <Card.Body style={{ fontSize: '0.85rem' }}>
                    <div className="d-flex justify-content-between mb-2" style={{ paddingLeft: '1.5rem', paddingRight: '0.5rem' }}>
                        <span className="text-muted fw-semibold">Status</span>
                        <span className="text-muted fw-semibold">Date</span>
                    </div>

                    <ul className="list-unstyled position-relative" style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                        {[
                        { status: "Parcel registered", date: "01/01" },
                        { status: "At warehouse", date: "01/02" },
                        { status: "Shipped to Tanzania", date: "01/03" },
                        { status: "In Transit", date: "01/05" },
                        ].map((item, idx) => (
                        <li key={idx} className="mb-4 d-flex position-relative">
                            {/* Dot */}
                            <div
                                style={{
                                    width: '10px',
                                    height: '10px',
                                    backgroundColor: '#6c757d',
                                    borderRadius: '50%',
                                    position: 'absolute',
                                    left: 0,
                                    top: '0.35rem'
                                }}
                            ></div>

                            {/* Status Text and Date */}
                            <div className="d-flex justify-content-between w-100 ps-4">
                            <div className="pe-3" style={{ flex: 1, wordBreak: 'break-word' }}>
                                <span style={{ fontWeight: 500 }}>{item.status}</span>
                            </div>
                            <div className="text-muted text-end" style={{ whiteSpace: 'nowrap' }}>{item.date}</div>
                            </div>
                        </li>
                        ))}
                    </ul>

                <Button variant="secondary" size="sm">Add Step</Button>
                </Card.Body>
            </Card>
        </div>

      </div>


        {/* Tabs for Parcels and Invoices */}
      <Tabs defaultActiveKey="parcels" className="mb-3 border-bottom">
        <Tab eventKey="parcels" title="Parcels">
          <ParcelPage customerId={customer.id} />
        </Tab>
        <Tab eventKey="invoices" title="Invoices">
          <InvoiceList customerId={customer.id} />
        </Tab>
      </Tabs>
    </div>
  );
};

export default CustomerDetails;
