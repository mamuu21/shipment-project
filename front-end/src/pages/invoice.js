import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Table, InputGroup, Form, Button, Modal, Pagination, Dropdown, Tabs, Tab } from 'react-bootstrap';
import { FaPlus, FaPen, FaTrash, FaEye, FaSearch, FaFileExport, FaEllipsisH } from 'react-icons/fa';

const getStatusBadge = (status) => {
  const color = {
    Paid: 'success',
    Pending: 'warning',
    Overdue: 'danger',
  }[status] || 'secondary';
  return <span className={`badge bg-${color}`}>{status}</span>;
};

const InvoiceModal = ({ show, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    invoice_no: '',
    customer: '',
    shipment: '',
    total_amount: '',
    issue_date: '',
    due_date: '',
    status: 'Pending'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await api.post('/invoices/', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onAdd(response.data);
      onClose();
      alert('Invoice added successfully!');
    } catch (error) {
      console.error('Error adding invoice:', error);
      alert('Failed to add invoice.');
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Invoice</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {['invoice_no', 'customer', 'shipment', 'total_amount'].map((field) => (
            <Form.Group className="mb-3" key={field}>
              <Form.Label>{field}</Form.Label>
              <Form.Control
                type={field === 'total_amount' ? 'number' : 'text'}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                required
              />
            </Form.Group>
          ))}
          <Form.Group className="mb-3">
            <Form.Label>Issue Date</Form.Label>
            <Form.Control type="date" name="issue_date" value={formData.issue_date} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Due Date</Form.Label>
            <Form.Control type="date" name="due_date" value={formData.due_date} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select name="status" value={formData.status} onChange={handleChange}>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </Form.Select>
          </Form.Group>
          <Button variant="primary" type="submit" className="d-block mx-auto mt-4" style={{ width: '50%' }}>
            Submit
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

const Invoice = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const handleDeleteClick = (invoice) => {
    setSelectedInvoice(invoice);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/invoices/${selectedInvoice.id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvoices(prev => prev.filter(inv => inv.id !== selectedInvoice.id));
      setShowDeleteModal(false);
      setSelectedInvoice(null);
      alert('Invoice deleted successfully!');
    } catch (error) {
      console.error('Failed to delete invoice:', error);
      alert('Failed to delete invoice.');
    }
  };



  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/invoices/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = response.data;
        const invoicesArray = Array.isArray(data) ? data : data.results || [];
        setInvoices(invoicesArray);
      } catch (error) {
        console.error('Failed to fetch invoices:', error);
      }
    };
    fetchInvoices();
  }, []);

  const handleAddInvoice = (newInvoice) => {
    setInvoices(prev => [...prev, newInvoice]);
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchText = ['invoice_no', 'customer', 'shipment'].some(field =>
      (inv[field] || '').toString().toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchStatus = filter === 'All' || inv.status === filter;
    return matchText && matchStatus;
  });

  const paginated = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  const handleExportCSV = () => {
    const csv = ['Invoice No,Customer,Shipment,Date,Due Date,Amount,Status']
      .concat(filteredInvoices.map(inv => (
        `${inv.invoice_no},${inv.customer},${inv.shipment},${inv.issue_date},${inv.due_date},${inv.total_amount},${inv.status}`
      )))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoices.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container-fluid p-3" style={{ backgroundColor: '#f4f7fb', minHeight: '100vh' }}>
      <div className="bg-white p-3 rounded shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="fs-4 fw-semibold">Invoices</h2>
          <div className="d-flex align-items-center gap-2">
            <InputGroup style={{ maxWidth: '250px' }}>
              <InputGroup.Text><FaSearch /></InputGroup.Text>
              <Form.Control
                type="search"
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
            <Button variant="outline-secondary" onClick={handleExportCSV}>
              <FaFileExport /> Export
            </Button>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <FaPlus /> New Invoice
            </Button>
          </div>
        </div>

        <Tabs activeKey={filter} onSelect={(k) => { setFilter(k); setCurrentPage(1); }} className="mb-3 small-tabs">
          <Tab eventKey="All" title="All" />
          <Tab eventKey="Paid" title="Paid" />
          <Tab eventKey="Pending" title="Pending" />
          <Tab eventKey="Overdue" title="Overdue" />
        </Tabs>

        <div className="table-responsive">
          <Table hover borderless size="sm" className="custom-table align-middle text-center">
            <thead className="table-header-bg">
              <tr>
                <th>Invoice No</th>
                <th>Customer</th>
                <th>Shipment</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((inv) => (
                <tr key={inv.id || inv.invoice_no}>
                  <td>{inv.invoice_no}</td>
                  <td>{inv.customer}</td>
                  <td>{inv.shipment}</td>
                  <td>{inv.issue_date}</td>
                  <td>{inv.due_date}</td>
                  <td>{inv.total_amount}</td>
                  <td>{getStatusBadge(inv.status)}</td>
                  <td>
                    <Dropdown align="end">
                      <Dropdown.Toggle as="button" className="btn btn-light btn-sm border-0">
                        <FaEllipsisH />
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="small">
                        <Dropdown.Item
                          onClick={() => console.log('View Invoice', inv)}
                          style={{ fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                          <FaEye className="me-2" /> View Details
                        </Dropdown.Item>

                        <Dropdown.Item
                          onClick={() => console.log('Edit Invoice', inv)}
                          style={{ fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                          <FaPen className="me-2" /> Edit Parcel
                        </Dropdown.Item>

                        <Dropdown.Item
                          onClick={() => handleDeleteClick(inv)}
                          className="text-danger"
                          style={{ fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                          <FaTrash className="me-2" /> Delete Invoice
                        </Dropdown.Item>
                      </Dropdown.Menu>

                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {totalPages > 1 && (
          <Pagination className="justify-content-center mt-3">
            {[...Array(totalPages)].map((_, i) => (
              <Pagination.Item key={i + 1} active={currentPage === i + 1} onClick={() => setCurrentPage(i + 1)}>
                {i + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        )}
        
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete invoice <strong>{selectedInvoice?.invoice_no}</strong>?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleConfirmDelete}>Delete</Button>
          </Modal.Footer>
        </Modal>


        <InvoiceModal show={showModal} onClose={() => setShowModal(false)} onAdd={handleAddInvoice} />
      </div>
    </div>
  );
};

export default Invoice;
