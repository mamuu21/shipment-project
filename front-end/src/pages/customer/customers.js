import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Table, InputGroup, Form, Button, Modal, Pagination, Dropdown, Tabs, Tab } from 'react-bootstrap';
import { FaPlus, FaPen, FaTrash, FaEye, FaSearch, FaFileExport, FaEllipsisH } from 'react-icons/fa';
import { Divide } from 'lucide-react';


const getStatusBadge = (status) => (
  <span className="plain-badge">{status}</span>
);


const DeleteModal = ({show, onClose, onConfirm, customer }) => (
    <Modal show={show} onHide={onClose} centered>
        <Modal.Header closeButton>
            <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            Are you sure you want to delete customer <strong>{customer?.name}</strong>?
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="danger" onClick={onConfirm}>Delete</Button>
        </Modal.Footer>
    </Modal>
);


const Create = ({show, onClose, onAddCustomer}) => {
    const [formData, setFormData] = useState({name:'', email:'', phone:'', address:'', status:'Active'});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await api.post('/customers/', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      onAddCustomer(response.data);
      onClose();
      alert("Customer added successfully!");
    } catch (error) {
      console.error("Failed to add customer", error.response?.data);
      alert("Failed to add customer. Please check your input.");
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
        <Modal.Header closeButton>
            <Modal.Title>Add Customer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form onSubmit={handleSubmit}>
                <Form.Group className='mb-3'>
                    <Form.Label>Name</Form.Label>
                    <Form.Control 
                        type='text'
                        name='name'
                        value={formData.name}
                        onChange={handleChange}
                        placeholder='Enter customer name'
                        required
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                       type='text'
                        name='email'
                        value={formData.email}
                        onChange={handleChange}
                        placeholder='Enter customer email'
                        required 
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                        type='text'
                        name='phone'
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder='Enter phone number'
                        required
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                        type='text'
                        name='address'
                        value={formData.address}
                        onChange={handleChange}
                        placeholder='Enter customer address'
                        required
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Status</Form.Label>
                    <Form.Select name='status' value={formData.status} onChange={handleChange}>
                        <option value='Active'>Active</option>
                        <option value='Dormant'>Dormant</option>
                    </Form.Select>
                </Form.Group>

                <Button
                    type="submit"
                    variant="primary"
                    className="d-block mx-auto mt-5"
                    style={{ width: '50%' }}
                    >
                    Submit
                </Button>
                
            </Form>
        </Modal.Body>
    </Modal>
  );
};


const Customer = () => {
    const [filter, setFilter] = useState('All');
    const [customers, setCustomers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await api.get('/customers/', {
                    headers: {Authorization: `Bearer ${token}`}
                });
                const data = response.data;
                console.log("Fetched customers:", data);

                setCustomers(Array.isArray(data) ? data : data.results || []);
            } catch(error) {
                console.error('Failed to fetch customers:', error)
            }
        };
        fetchCustomers();
    }, []);

    const handleAddCustomer = (newCustomer) => {
        setCustomers(prev => [...prev, newCustomer]);
    };

    const handleDeleteCustomer = () => {
        if (setSelectedCustomer){
            setCustomers(prev => prev.filter(c => c.id !== selectedCustomer.id));
            setSelectedCustomer(null);
            setShowDeleteModal(false);
        }
    };

    const filteredData = customers.filter(cust =>
        ['name', 'email', 'phone', 'address', 'status'].some(field => 
            (cust[field] || '').toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    const filteredCustomers = customers.filter((c) => {
        if (filter === "All") return true;
        return c.status === filter;
    });

    const paginatedData = filteredCustomers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const handleExportCSV = () => {
        const headers = ['Name', 'Email', 'Phone', 'Address', 'Status'];
        const rows = filteredData.map(c => [c.name, c.email, c.phone, c.address, c.status]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'customers.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDeleteClick = (customer) => {
        setSelectedCustomer(customer);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        if (selectedCustomer) {
            handleDeleteCustomer(selectedCustomer.id);
            setShowDeleteModal(false);
            setSelectedCustomer(null);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setSelectedCustomer(null);
    };

    return (
        <div className="container-fluid p-3" style={{ backgroundColor: "#f4f7fb", minHeight: "100vh" }}>
            <div className="bg-white p-3 rounded shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="fs-4 fw-semibold">Customers</h2>
                    <div className="d-flex align-items-center gap-2">
                        <InputGroup style={{ maxWidth: '250px' }}>
                        <InputGroup.Text><FaSearch /></InputGroup.Text>
                        <Form.Control
                            type="search"
                            placeholder="Search customers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        </InputGroup>
                        <Button 
                            variant="outline-secondary" 
                            onClick={handleExportCSV}
                        >
                            <FaFileExport /> Export
                        </Button>
                        <Button
                            variant="primary" 
                            onClick={() => setShowCreateModal(true)}
                        >
                            <FaPlus /> New Customer
                        </Button>
                    </div>
                </div>

                <Tabs
                    activeKey={filter}
                    onSelect={(k) => {
                    setFilter(k);
                    setCurrentPage(1);
                    }}
                    className="mb-3 small-tabs"
                >
                    <Tab eventKey="All" title="All" />
                    <Tab eventKey="Active" title="Active" />
                    <Tab eventKey="Dormant" title="Dormant" />
                </Tabs>

                <div className="table-responsive">
                    <Table hover borderless size="sm" className="custom-table align-middle text-center">
                        <thead className="table-header-bg">
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Address</th>
                                <th>Status</th>
                                <th>Parcels</th>
                                <th>Weight</th>
                                {/* <th>Shipments</th> */}
                                <th>Invoices Paid</th>
                                <th>Shipment Nos</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.length > 0 ? paginatedData.map((c, i) => (
                                <tr key={c.id}>
                                    <td>{c.id}</td>
                                    <td>{c.name}</td>
                                    <td>{c.email}</td>
                                    <td>{c.phone}</td>
                                    <td>{c.address}</td>
                                    <td>{getStatusBadge(c.status)}</td>
                                    <td>{c.total_parcels}</td>
                                    <td>{c.total_parcel_weight}</td>
                                    {/* <td>{c.total_shipments}</td> */}
                                    <td>{c.total_invoices_paid}</td>
                                    <td>
                                        {c.shipment_nos && c.shipment_nos.length > 0
                                        ? c.shipment_nos.join(', ')
                                        : 'None'}
                                    </td>
                                    <td>
                                        <Dropdown align='end'>
                                            <Dropdown.Toggle
                                                as="button"
                                                className="btn btn-light btn-sm border-0"
                                                style={{ boxShadow: 'none', fontSize: '0.85rem' }}
                                            >
                                                <FaEllipsisH/>
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu className='small'>
                                                <Dropdown.Item 
                                                    // onClick={() => handleViewDetails(i)}
                                                    style={{ fontSize: '0.8rem', cursor: 'pointer' }}>
                                                    <FaEye className="me-2" /> View Details
                                                </Dropdown.Item>
                
                                                <Dropdown.Item 
                                                    onClick={() => console.log('Edit Customer', i)} 
                                                    style={{ fontSize: '0.8rem' }}>
                                                    <FaPen className="me-2" /> Edit Customer
                                                </Dropdown.Item> 
                                            
                                                <Dropdown.Item 
                                                    onClick={() => handleDeleteClick(i)} 
                                                    className="text-danger" 
                                                    style={{ fontSize: '0.8rem' }}>
                                                    <FaTrash className="me-2" /> Delete Customer
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="6" className="text-center text-muted py-3">No customers found.</td></tr>
                            )}
                        </tbody>
                    </Table>
                </div>

                {totalPages > 1 && (
                    <Pagination className="justify-content-center mt-3">
                        {[...Array(totalPages)].map((_, i) => (
                            <Pagination.Item key={i} active={currentPage === i + 1} onClick={() => setCurrentPage(i + 1)}>
                                {i + 1}
                            </Pagination.Item>
                        ))}
                    </Pagination>
                )}

                <Create 
                    show={showCreateModal} 
                    onClose={() => setShowCreateModal(false)} 
                    onAddCustomer={handleAddCustomer} 
                />
                <DeleteModal 
                    show={showDeleteModal} 
                    onClose={handleCancelDelete} 
                    onConfirm={handleConfirmDelete} 
                    customer={selectedCustomer}
                />
            </div>
        </div>
    );
};

export default Customer;