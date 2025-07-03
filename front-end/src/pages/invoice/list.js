import React, { useEffect, useState } from 'react';
import InvoiceCreate from './create';
import { Table, Button, Badge, Modal, Form, InputGroup, Pagination, Dropdown } from 'react-bootstrap';
import { FaPlus, FaPen, FaTrash, FaEye, FaSearch, FaFileExport, FaEllipsisH } from 'react-icons/fa';

const getStatusBadge = (status) => (
  <Badge bg={status === 'In Transit' ? 'info' : 'secondary'}>{status}</Badge>
);

const getPaymentBadge = (payment) => (
  <Badge bg={payment === 'Paid' ? 'success' : 'warning'}>{payment}</Badge>
);

const InvoiceList = ({ shipmentId }) => {
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateParcelModal, setShowCreateParcelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (shipmentId) {
      const dummyInvoices = [
        { id: 'INV-04021-1', customer: 'Makuya', shipment: shipmentId, date: '2024-06-10', dueDate: '2024-06-15', amount: '165,000', status: 'Paid' },
        { id: 'INV-04021-2', customer: 'John Doe', shipment: shipmentId, date: '2024-06-12', dueDate: '2024-06-18', amount: '85,000', status: 'Unpaid' }
      ];
      setInvoices(dummyInvoices);
    }
  }, [shipmentId]);

  const handleAddInvoice = (newInvoice) => {
    newInvoice.id = `INV-${shipmentId}-${invoices.length + 1}`;
    setInvoices(prev => [...prev, newInvoice]);
  };

  const handleDeleteClick = (invoice) => {
    setSelectedInvoice(invoice);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setInvoices(invoices.filter(i => i.id !== selectedInvoice.id));
    setShowDeleteModal(false);
    setSelectedInvoice(null);
  };

  const filteredInvoices = invoices.filter(i =>
    Object.values(i).some(val => val.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const paginatedInvoices = filteredInvoices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const exportCSV = () => {
    const headers = ['Invoice No.', 'Customer', 'Shipment', 'Date', 'Due date', 'Amount', 'Status'];
    const rows = filteredInvoices.map(i => [i.id, i.customer, i.shipment, i.date, i.dueDate, i.amount, i.status]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'invoices.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="table-responsive">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold">Invoices for Shipment: <span className="text-primary">{shipmentId}</span></h6>
        <div className="d-flex gap-2">
          <InputGroup size="sm">
            <InputGroup.Text><FaSearch /></InputGroup.Text>
            <Form.Control
              type="search"
              placeholder="Search invoices..."
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
            <FaPlus size={13} className="me-1" />  Add Invoice
          </Button>
        </div>
      </div>

      <Table hover borderless size="sm" className="custom-table align-middle text-center">
        <thead className="table-header-bg">
          <tr>
            <th>Invoice No.</th>
            <th>Customer</th>
            {/* <th>Shipment</th> */}
            <th>Date</th>
            <th>Due date</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedInvoices.map((invoice, idx) => (
            <tr key={idx}>
              <td className="fw-semibold">{invoice.id}</td>
              <td>{invoice.customer}</td>
              {/* <td>{invoice.shipment}</td> */}
              <td>{invoice.date}</td>
              <td>{invoice.dueDate}</td>
              <td>{invoice.amount}</td>
              <td>{getPaymentBadge(invoice.status)}</td>
              <td>
                <Dropdown align="end">
                  <Dropdown.Toggle as="button" className="btn btn-light btn-sm border-0">
                    <FaEllipsisH />
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="small">
                    <Dropdown.Item><FaEye className="me-2" />View</Dropdown.Item>
                    <Dropdown.Item><FaPen className="me-2" />Edit</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleDeleteClick(invoice)} className="text-danger"><FaTrash className="me-2" />Delete</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </td>
            </tr>
          ))}
          {paginatedInvoices.length === 0 && (
            <tr>
              <td colSpan="8" className="text-muted text-center py-3">No invoices found.</td>
            </tr>
          )}
        </tbody>
      </Table>

      {Math.ceil(filteredInvoices.length / itemsPerPage) > 1 && (
        <Pagination className="justify-content-center">
          {[...Array(Math.ceil(filteredInvoices.length / itemsPerPage))].map((_, i) => (
            <Pagination.Item key={i} active={i + 1 === currentPage} onClick={() => setCurrentPage(i + 1)}>{i + 1}</Pagination.Item>
          ))}
        </Pagination>
      )}

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Confirm Deletion</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to delete invoice <strong>{selectedInvoice?.id}</strong>?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>

      {/* Invoice Create Modal */}
      <InvoiceCreate
        show={showCreateParcelModal}
        onClose={() => setShowCreateParcelModal(false)}
        // onAddParcel={handleAddParcel}
      />
    </div>
  );
};

export default InvoiceList;
