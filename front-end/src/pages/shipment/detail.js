import React from 'react';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, Button, Nav, Table, Tabs, Tab } from 'react-bootstrap';
import api from '../../utils/api';
import ParcelList from "../parcel/parcels";
import CustomerList from "../customer/customers";
import { getCurrentUser } from '../../utils/auth';


const ShipmentDetails = () => {
  const { id } = useParams(); 
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    const fetchShipment = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await api.get(`/shipments/${id}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setShipment(res.data);
      } catch (error) {
        console.error('Failed to fetch shipment:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShipment();
  }, [id]);

  if (loading) return <p className="text-center">Loading shipment details...</p>;
  if (!shipment) return <p className="text-center text-danger">Shipment not found.</p>;


  return (
    <div className="container py-4">
      <h2 className="fs-4 fw-semibold mb-3">Shipment Details</h2>

      <div className="row mb-4">
        <div className="col-md-8">
          <Card className="mb-3">
            <Card.Header className="d-flex justify-content-between">
              <span className="text-muted fw-bold">Shipment Summary</span>
              <Button variant="link" size="sm">Edit</Button>
            </Card.Header>
            
            <Card.Body style={{ minHeight: '250px' }}>
              <div className="px-3" style={{ maxWidth: '100%', borderRadius: '12px', overflow: 'hidden', background: 'white' }}>
                <Table 
                  bordered 
                  responsive 
                  className="w-100 mb-0 bg-white"
                  style={{ 
                    fontSize: '0.9rem',
                    borderCollapse: 'collapse' 
                  }}
                >
                  <tbody>
                    <tr>
                      <td style={{ padding: '8px' }}>
                        Shipment no: &nbsp; <span style={{ fontWeight: 500 }}>{shipment.shipment_no}</span>
                      </td>
                      <td style={{ padding: '8px' }}>
                        Admin Person: &nbsp;<span style={{ fontWeight: 500 }}>{currentUser?.username || 'N/A'}</span>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} style={{ padding: '16px' }}>
                        Address: &nbsp; <span style={{ fontWeight: 500 }}>{shipment.origin} → {shipment.destination}</span>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} style={{ padding: '16px' }}>
                        Shipping Details: &nbsp;
                        <span style={{ fontWeight: 500 }}>{shipment.transport}</span>
                        <span style={{ marginLeft: '230px' }}>
                          Vessel: &nbsp;<span style={{ fontWeight: 500 }}>{shipment.vessel}</span>
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} style={{ padding: '16px' }}>
                        Documents: &nbsp; <span style={{ fontWeight: 500 }}>{shipment.documents?.length || 0} Uploaded</span>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} style={{ padding: '16px' }}>
                        Container Details: &nbsp;
                        <span style={{ fontWeight: 500 }}>
                          {shipment.weight} {shipment.weight_unit}&nbsp;&nbsp;&nbsp;&nbsp;{shipment.volume} {shipment.volume_unit}
                        </span>
                        <span style={{ marginLeft: '130px' }}>
                          Percentage fill: &nbsp;<span style={{ fontWeight: 500 }}>{shipment.percentage_fill || 'N/A'}% filled</span>
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-4">
          <Card>
            <Card.Header><span className="text-muted fw-bold">Status Updates</span></Card.Header>
            <Card.Body style={{ fontSize: '0.85rem' }}>
              {/* Column titles */}
              <div className="d-flex justify-content-between mb-2" style={{ paddingLeft: '1.5rem', paddingRight: '0.5rem' }}>
                <span className="text-muted fw-semibold">Status</span>
                <span className="text-muted fw-semibold">Date</span>
              </div>

              <ul className="list-unstyled position-relative" style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                {(shipment.status_updates || []).map((item, idx) => (
                  <li key={idx} className="mb-4 d-flex position-relative">
                    {/* Timeline marker */}
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

                    {/* Content wrapper */}
                    <div className="d-flex justify-content-between w-100 ps-4">
                      {/* Status Text */}
                      <div className="pe-3" style={{ flex: 1, wordBreak: 'break-word' }}>
                        <span style={{ fontWeight: 500 }}>{item.status}</span>
                      </div>
                      {/* Date */}
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

      <Tabs defaultActiveKey="parcels" className="mb-3 border-bottom">
        <Tab eventKey="parcels" title="Parcels">
          <ParcelList shipmentId={shipment.shipment_no} />
        </Tab>
        <Tab eventKey="customers" title="Customers">
          <CustomerList shipmentId={shipment.shipment_no} />
        </Tab>
        {/* <Tab eventKey="invoices" title="Invoices">
          <InvoiceList shipmentId={shipment} />
        </Tab>
        <Tab eventKey="documents" title="Documents">
          <DocumentList shipmentId={shipment} />
        </Tab> */}
        <Tab eventKey="gps" title="Live GPS"></Tab>
      </Tabs>
    </div>
  );
};

export default ShipmentDetails;
