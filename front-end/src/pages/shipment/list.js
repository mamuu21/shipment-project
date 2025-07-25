import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";

import api from '../../utils/api';
import ShipmentCreate from './create';

import { Button, Table, Tabs, Tab, InputGroup, Form, Pagination, Modal, Dropdown } from 'react-bootstrap';
import { FaPlus, FaPen, FaTrash, FaEye, FaSearch, FaFileExport, FaEllipsisH } from 'react-icons/fa';

const getStatusBadge = (status) => (
  <span className="plain-badge">{status}</span>
);

const DeleteModal = ({ show, onClose, onConfirm, shipment }) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Deletion</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to delete shipment <strong>{shipment?.id}</strong>?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const ShipmentList = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [shipments, setShipments] = useState([])
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [currentUrl, setCurrentUrl] = useState('/shipments/');
  const [count, setCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);


  useEffect(() => {
    const fetchshipments = async () => {
      try {
        const response = await api.get(currentUrl);
        const data = response.data;

        setShipments(Array.isArray(data) ? data : data.results || []);
        setCount(data.count);
        setNextPage(data.next);
        setPrevPage(data.previous);

        const url = new URL(currentUrl, window.location.origin);
        const page = parseInt(url.searchParams.get("page") || "1");
        setCurrentPage(page);

      } catch (error) {
        console.error('Failed to fetch shipments', error);
      }
    };

    fetchshipments();
  }, [currentUrl]);

  const handleAddShipment = async (newShipment) => {
    try {
      const token = localStorage.getItem('token');

      console.log("Submitting shipment:", newShipment);

      const response = await api.post('/shipments/', newShipment, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const savedShipment = response.data;

      setShipments(prev => [...prev, savedShipment]);
      alert("Shipment successfully created!");

    } catch (error) {
      console.error("Failed to add shipment", error.response?.data );
      alert("Failed to add shipment. Please check your input and try again.");
    }
  };

  const handleDeleteShipment = (id) => {
    const updated = shipments.filter(shipment => shipment.id !== id);
    setShipments(updated);
  };

  const filteredData = shipments.filter((shipment) => {
    const matchesFilter = filter === "All" || shipment.status === filter;
    const matchesSearch = ["shipment_no", "origin", "destination", 'vessel'].some(key =>
      (shipment[key] ?? "").toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesFilter && matchesSearch;
  });


  const handleExportCSV = () => {
    if (filteredData.length === 0) return;

    const headers = [
      'Shipment No',
      'Transport',
      'Vessel',
      'Weight',
      'Volume',
      'Origin',
      'Destination',
      'Status'
    ];

    const rows = filteredData.map(shipment => [
      shipment.shipment_no,
      shipment.transport,
      shipment.vessel,
      `${shipment.weight} ${shipment.weightunit}`,
      `${shipment.volume} ${shipment.volumeunit}`,
      shipment.origin,
      shipment.destination,
      shipment.status
    ]);

    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'shipments.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteClick = (shipment) => {
    setSelectedShipment(shipment);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (selectedShipment) {
      handleDeleteShipment(selectedShipment.id);
      setShowDeleteModal(false);
      setSelectedShipment(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedShipment(null);
  };



  return (
    <div className="container-fluid p-3" style={{ backgroundColor: "#f4f7fb", minHeight: "100vh", fontSize: "0.78rem" }}>
      <div className="bg-white p-3 rounded shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
          <h2 className="fs-4 fw-semibold mb-3">All Shipments</h2>

          <div className="d-flex align-items-center gap-2">
            <InputGroup style={{ maxWidth: '250px', height: '38px' }}>
              <InputGroup.Text><FaSearch /></InputGroup.Text>
              <Form.Control
                type="search"
                placeholder="Search shipments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ height: '38px' }}
              />
            </InputGroup>

            <Button onClick={handleExportCSV} variant="outline-secondary" style={{ height: '38px' }}>
              <FaFileExport className="me-1" /> Export
            </Button>

            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              style={{ height: '38px', fontSize: '0.9rem', padding: '0 1rem' }}>
              <FaPlus size={13} className="me-2" /> New Shipment
            </Button>
          </div>
        </div>

        <Tabs
          activeKey={filter}
          onSelect={(k) => {
            setFilter(k);
            setCurrentUrl('/shipments/');
          }}
          className="mb-3 small-tabs"
        >
          <Tab eventKey="All" title="All" />
          <Tab eventKey="Delivered" title="Delivered" />
          <Tab eventKey="In-transit" title="In-transit" />
        </Tabs>

        <div className="table-responsive">
          <Table hover borderless size="sm" className="custom-table align-middle text-center">
            <thead className="table-header-bg">
              <tr>
                <th>Shipment No.</th>
                <th>Transport</th>
                <th>Vessel</th>
                <th>Customers</th>
                <th>Parcels</th>
                <th>Weight</th>
                <th>Volume</th>
                <th>Origin</th>
                <th>Destination</th>
                <th>Steps</th>
                <th>Documents</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.shipment_no}</td>
                    <td>{item.transport}</td>
                    <td>{item.vessel}</td>
                    <td>{item.customer_count}</td>
                    <td>{item.parcel_count}</td>
                    <td>{item.weight} {item.weight_unit}</td>
                    <td>{item.volume} {item.volume_unit}</td>
                    <td>{item.origin}</td>
                    <td>{item.destination}</td>
                    <td>{item.steps}</td>
                    <td>{item.documents}</td>
                    <td>{getStatusBadge(item.status)}</td>
                    <td>
                        <Dropdown align="end">
                            <Dropdown.Toggle
                                as="button"
                                className="btn btn-light btn-sm border-0"
                                style={{ boxShadow: 'none', fontSize: '0.85rem' }}
                            >
                                <FaEllipsisH />
                            </Dropdown.Toggle>

                            <Dropdown.Menu className='small'>
                                <Dropdown.Item
                                  onClick={() => navigate(`/shipment/${item.shipment_no}`)}
                                  style={{ fontSize: '0.8rem', cursor: 'pointer' }}>
                                    <FaEye className="me-2" /> View Details
                                </Dropdown.Item>

                                <Dropdown.Item 
                                  onClick={() => console.log('Edit shipment', item)} 
                                  style={{ fontSize: '0.8rem' }}>
                                    <FaPen className="me-2" /> Edit Shipment
                                </Dropdown.Item> 

                                <Dropdown.Item 
                                  onClick={() => handleDeleteClick(item)} 
                                  className="text-danger" 
                                  style={{ fontSize: '0.8rem' }}>
                                    <FaTrash className="me-2" /> Delete Shipment
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="13" className="text-muted text-center py-3">No shipments found.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3" style={{ fontSize: '0.85rem' }}>
          {/* Left text */}
          <div>
            Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, count)} of {count} entries
          </div>

          {/* Right pagination */}
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
                onClick={() => setCurrentUrl(`/shipments/?page=${i + 1}`)}
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


        <ShipmentCreate
          show={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onAddShipment={handleAddShipment}
        />

        <DeleteModal
          show={showDeleteModal}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          shipment={selectedShipment}
        />
      </div>
    </div>
  );
};

export default ShipmentList;
