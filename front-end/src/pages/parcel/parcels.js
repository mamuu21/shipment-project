import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import ParcelCreate from './create';
import { Table, InputGroup, Form, Button, Modal, Pagination, Dropdown, Tabs, Tab } from 'react-bootstrap';
import { FaPlus, FaPen, FaTrash, FaEye, FaSearch, FaFileExport, FaEllipsisH } from 'react-icons/fa';

const ParcelPage = ({ customerId, shipmentId }) => {
  const [parcels, setParcels] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [count, setCount] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUrl, setCurrentUrl] = useState("/parcels/");


  useEffect(() => { 
    const fetchParcels = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const headers = { Authorization: `Bearer ${token}` };

        let fetchUrl = '/parcels/';
        const queryParams = [];

        if (customerId) {
          queryParams.push(`customer=${customerId}`);
        }

        if (shipmentId) {
          queryParams.push(`shipment=${shipmentId}`);
        }

        if (queryParams.length > 0) {
          fetchUrl += `?${queryParams.join('&')}`;
        }

        const response = await api.get(fetchUrl, { headers });
        const data = response.data;

        setParcels(Array.isArray(data) ? data : data.results || []);
        setCount(data.count);
        setNextPage(data.next);
        setPrevPage(data.previous);

        const parsedUrl = new URL(currentUrl, window.location.origin);
        const page = parseInt(parsedUrl.searchParams.get("page") || "1");
        setCurrentPage(page);
        
      } catch (error) {
        console.error('Failed to fetch parcels:', error);
      }
    };

    fetchParcels();
  }, [customerId, shipmentId, currentUrl]); 


  const handleExportCSV = () => {
    const headers = ['Parcel No', 'Shipment', 'Weight', 'Volume', 'Customer', 'Charge', 'Commodity Type'];
    const rows = parcels.map(p => [
      p.parcel_no,
      p.shipment,
      `${p.weight} ${p.weight_unit}`,
      `${p.volume} ${p.volume_unit}`,
      p.customer,
      p.charge,
      p.commodity_type
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'parcels.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredData = parcels.filter(p =>
    ['parcel_no', 'shipment', 'customer', 'commodity_type'].some(field =>
      (p[field] || '').toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );


  const handleDeleteClick = (parcel) => {
    setSelectedParcel(parcel);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    setParcels(prev => prev.filter(p => p.parcel_no !== selectedParcel.parcel_no));
    setShowDeleteModal(false);
    setSelectedParcel(null);
  };

  return (
    <div className="container-fluid p-3" style={{ backgroundColor: '#f4f7fb', minHeight: '100vh' }}>
      <div className="bg-white p-3 rounded shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="fs-4 fw-semibold">Parcels</h2>
          <div className="d-flex align-items-center gap-2">
            <InputGroup style={{ maxWidth: '250px' }}>
              <InputGroup.Text><FaSearch /></InputGroup.Text>
              <Form.Control
                type="search"
                placeholder="Search parcels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
            <Button variant="outline-secondary" onClick={handleExportCSV}>
              <FaFileExport /> Export
            </Button>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <FaPlus /> New Parcel
            </Button>
          </div>
        </div>

        <div className="table-responsive">
          <Table hover borderless size="sm" className="custom-table align-middle text-center">
            <thead className="table-header-bg">
              <tr>
                <th>Parcel No</th>
                <th>Customer</th>
                <th>Shipment</th>
                <th>Weight</th>
                <th>Volume</th>
                <th>Charge</th>
                <th>Payment</th>
                <th>Commodity Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? filteredData.map(p => (
                <tr key={p.parcel_no}>
                  <td>{p.parcel_no}</td>
                  <td>{p.customer?.name}</td>
                  <td>{p.shipment}</td>
                  <td>{p.weight} {p.weight_unit}</td>
                  <td>{p.volume} {p.volume_unit}</td>
                  <td>{p.charge}</td>
                  <td>{p.payment}</td>
                  <td>{p.commodity_type}</td>
                  <td>
                    <Dropdown align='end'>
                      <Dropdown.Toggle as="button" className="btn btn-light btn-sm border-0">
                        <FaEllipsisH />
                      </Dropdown.Toggle>

                      <Dropdown.Menu className="small">
                        <Dropdown.Item
                            onClick={() => console.log('View Parcel', p)}
                            style={{ fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                            <FaEye className="me-2" /> View Details
                        </Dropdown.Item>

                        <Dropdown.Item
                            onClick={() => console.log('Edit Parcel', p)}
                            style={{ fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                            <FaPen className="me-2" /> Edit Parcel
                        </Dropdown.Item>

                        <Dropdown.Item
                            onClick={() => handleDeleteClick(p)}
                            className="text-danger"
                            style={{ fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                            <FaTrash className="me-2" /> Delete Parcel
                        </Dropdown.Item>
                      </Dropdown.Menu>

                    </Dropdown>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="8" className="text-center text-muted py-3">No parcels found.</td></tr>
              )}
            </tbody>
          </Table>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3" style={{ fontSize: "0.85rem" }}>
          {/* Showing X to Y of Z entries */}
          <div>
            Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, count)} of {count} entries
          </div>

          {/* Bootstrap Pagination */}
          <Pagination>
            <Pagination.Prev
              onClick={() => prevPage && setCurrentUrl(prevPage)}
              disabled={!prevPage}
            >
              Previous
            </Pagination.Prev>

            {[...Array(Math.ceil(count / 10))].map((_, i) => (
              <Pagination.Item
                key={i}
                active={currentPage === i + 1}
                onClick={() => setCurrentUrl(`/parcels/?page=${i + 1}`)}
              >
                {i + 1}
              </Pagination.Item>
            ))}

            <Pagination.Next
              onClick={() => nextPage && setCurrentUrl(nextPage)}
              disabled={!nextPage}
            >
              Next
            </Pagination.Next>
          </Pagination>
        </div>


        <ParcelCreate
          show={showCreateModal} 
          onClose={() => setShowCreateModal(false)} 
          onAddParcel={(newParcel) => setParcels(prev => [...prev, newParcel])}
        />


        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete parcel <strong>{selectedParcel?.parcel_no}</strong>?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleConfirmDelete}>Delete</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default ParcelPage;
