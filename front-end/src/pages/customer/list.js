import React, { useEffect, useState } from 'react';
import CustomerCreate from './create';
import { Table, Button, Modal, Form, InputGroup, Pagination, Dropdown, Badge } from 'react-bootstrap';
import { FaPlus, FaPen, FaTrash, FaSearch, FaEye, FaFileExport, FaEllipsisH } from 'react-icons/fa';

const CustomerList = ({ shipmentId }) => {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateCustomerModal, setShowCreateCustomerModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (shipmentId) {
      const dummyCustomers = [
        { id: 1, name: 'Mariam Mussa', email: 'mariam@example.com', phone: '0712345678', address: 'Dar es Salaam' },
        { id: 2, name: 'John Doe', email: 'john@example.com', phone: '0765432109', address: 'Arusha' }
      ];
      setCustomers(dummyCustomers);
    }
  }, [shipmentId]);

  const handleAddCustomer = (newCustomer) => {
    newCustomer.id = customers.length + 1;
    setCustomers(prev => [...prev, newCustomer]);
  };

  const handleDeleteClick = (customer) => {
    setSelectedCustomer(customer);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setCustomers(customers.filter(c => c.id !== selectedCustomer.id));
    setShowDeleteModal(false);
    setSelectedCustomer(null);
  };

  const filteredCustomers = customers.filter(c =>
    Object.values(c).some(val => val.toString().toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Address'];
    const rows = filteredCustomers.map(c => [c.name, c.email, c.phone, c.address]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'customers.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="table-responsive">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold">Customers for Shipment: <span className="text-primary">{shipmentId}</span></h6>
        <div className="d-flex gap-2">
          <InputGroup size="sm">
            <InputGroup.Text><FaSearch /></InputGroup.Text>
            <Form.Control
              type="search"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>

          <Button variant="outline-secondary" size="sm" onClick={exportCSV}><FaFileExport className="me-1" />Export</Button>

          <Button
            variant="primary"
            onClick={() => setShowCreateCustomerModal(true)}
            style={{ height: '50px', fontSize: '0.9rem', padding: '0.1rem' }}
          >
            <FaPlus size={13} className="me-1" /> Add Customer
          </Button>
        </div>
      </div>

      <Table hover borderless size="sm" className="custom-table align-middle text-center">
        <thead className="table-header-bg">
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedCustomers.map((customer, idx) => (
            <tr key={idx}>
              <td className="fw-semibold">{customer.name}</td>
              <td>{customer.email}</td>
              <td>{customer.phone}</td>
              <td>{customer.address}</td>
              <td>
                <Dropdown align="end">
                  <Dropdown.Toggle as="button" className="btn btn-light btn-sm border-0">
                    <FaEllipsisH />
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="small">
                    <Dropdown.Item><FaEye className="me-2" />View</Dropdown.Item>
                    <Dropdown.Item><FaPen className="me-2" />Edit</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleDeleteClick(customer)} className="text-danger">
                      <FaTrash className="me-2" />Delete
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </td>
            </tr>
          ))}
          {paginatedCustomers.length === 0 && (
            <tr>
              <td colSpan="5" className="text-muted text-center py-3">No customers found.</td>
            </tr>
          )}
        </tbody>
      </Table>

      {Math.ceil(filteredCustomers.length / itemsPerPage) > 1 && (
        <Pagination className="justify-content-center">
          {[...Array(Math.ceil(filteredCustomers.length / itemsPerPage))].map((_, i) => (
            <Pagination.Item key={i} active={i + 1 === currentPage} onClick={() => setCurrentPage(i + 1)}>
              {i + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      )}

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Confirm Deletion</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to delete <strong>{selectedCustomer?.name}</strong>?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>

      {/* Create Customer Modal */}
      <CustomerCreate
        show={showCreateCustomerModal}
        onClose={() => setShowCreateCustomerModal(false)}
        onAddCustomer={handleAddCustomer}
      />
    </div>
  );
};

export default CustomerList;
