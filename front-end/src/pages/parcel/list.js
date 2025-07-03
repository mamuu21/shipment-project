import React, { useEffect, useState } from 'react';
import ParcelCreate from './create';
import { Table, Button, Badge, Modal, Form, InputGroup, Pagination, Dropdown } from 'react-bootstrap';
import { FaPlus, FaPen, FaTrash, FaEye, FaSearch, FaFileExport, FaEllipsisH } from 'react-icons/fa';

const getStatusBadge = (status) => (
  <Badge bg={status === 'In Transit' ? 'info' : 'secondary'}>{status}</Badge>
);

const getPaymentBadge = (payment) => (
  <Badge bg={payment === 'Paid' ? 'success' : 'warning'}>{payment}</Badge>
);

const ParcelList = ({ shipmentId }) => {
  const [parcels, setParcels] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateParcelModal, setShowCreateParcelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (shipmentId) {
      const dummyParcels = [
        { id: 'PCL-04021-1', weight: '230 KGS', volume: '1750', recipient: 'Makuya', charge: '165,000', commodity: 'Electronics', payment: 'Paid', status: 'In Transit' },
        { id: 'PCL-04021-2', weight: '110 KGS', volume: '1200', recipient: 'John Doe', charge: '85,000', commodity: 'Furniture', payment: 'Unpaid', status: 'Pending' }
      ];
      setParcels(dummyParcels);
    }
  }, [shipmentId]);

  const handleAddParcel = (newParcel) => {
    // Auto-generate parcel ID if not provided
    newParcel.id = `PCL-${shipmentId}-${parcels.length + 1}`;
    setParcels(prev => [...prev, newParcel]);
  };

  const handleDeleteClick = (parcel) => {
    setSelectedParcel(parcel);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setParcels(parcels.filter(p => p.id !== selectedParcel.id));
    setShowDeleteModal(false);
    setSelectedParcel(null);
  };

  const filteredParcels = parcels.filter(p =>
    Object.values(p).some(val => val.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const paginatedParcels = filteredParcels.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const exportCSV = () => {
    const headers = ['Parcel No.', 'Weight', 'Volume', 'Recipient', 'Charge', 'Commodity', 'Payment', 'Status'];
    const rows = filteredParcels.map(p => [p.id, p.weight, p.volume, p.recipient, p.charge, p.commodity, p.payment, p.status]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'parcels.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="table-responsive">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold">Parcels for Shipment: <span className="text-primary">{shipmentId}</span></h6>
        <div className="d-flex gap-2">
          <InputGroup size="sm">
            <InputGroup.Text><FaSearch /></InputGroup.Text>
            <Form.Control
              type="search"
              placeholder="Search parcels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>

          <Button 
            variant="outline-secondary" size="sm" 
            onClick={exportCSV}><FaFileExport className="me-1" />
              Export
          </Button>

          <Button
            variant="primary"
            onClick={() => setShowCreateParcelModal(true)}
            style={{ height: '50px', fontSize: '0.9rem', padding: '0.1rem' }}
          >
            <FaPlus size={13} className="me-1" />  Add Parcel
          </Button>
        </div>
      </div>

      <Table hover borderless size="sm" className="custom-table align-middle text-center">
        <thead className="table-header-bg">
          <tr>
            <th>Parcel No.</th>
            <th>Weight</th>
            <th>Volume</th>
            <th>Recipient</th>
            <th>Charge</th>
            <th>Commodity</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedParcels.map((parcel, idx) => (
            <tr key={idx}>
              <td className="fw-semibold">{parcel.id}</td>
              <td>{parcel.weight}</td>
              <td>{parcel.volume}</td>
              <td>{parcel.recipient}</td>
              <td>{parcel.charge}</td>
              <td>{parcel.commodity}</td>
              <td>{getPaymentBadge(parcel.payment)}</td>
              <td>{getStatusBadge(parcel.status)}</td>
              <td>
                <Dropdown align="end">
                  <Dropdown.Toggle as="button" className="btn btn-light btn-sm border-0">
                    <FaEllipsisH />
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="small">
                    <Dropdown.Item><FaEye className="me-2" />View</Dropdown.Item>
                    <Dropdown.Item><FaPen className="me-2" />Edit</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleDeleteClick(parcel)} className="text-danger"><FaTrash className="me-2" />Delete</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </td>
            </tr>
          ))}
          {paginatedParcels.length === 0 && (
            <tr>
              <td colSpan="9" className="text-muted text-center py-3">No parcels found.</td>
            </tr>
          )}
        </tbody>
      </Table>

      {Math.ceil(filteredParcels.length / itemsPerPage) > 1 && (
        <Pagination className="justify-content-center">
          {[...Array(Math.ceil(filteredParcels.length / itemsPerPage))].map((_, i) => (
            <Pagination.Item key={i} active={i + 1 === currentPage} onClick={() => setCurrentPage(i + 1)}>{i + 1}</Pagination.Item>
          ))}
        </Pagination>
      )}

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Confirm Deletion</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to delete parcel <strong>{selectedParcel?.id}</strong>?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>

      {/* Parcel Create Modal */}
      <ParcelCreate
        show={showCreateParcelModal}
        onClose={() => setShowCreateParcelModal(false)}
        onAddParcel={handleAddParcel}
      />
    </div>
  );
};

export default ParcelList;
