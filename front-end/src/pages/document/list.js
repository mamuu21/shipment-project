import React, { useEffect, useState } from 'react';
import DocumentCreate from './create';
import { Table, Button, Badge, Modal, Form, InputGroup, Pagination, Dropdown } from 'react-bootstrap';
import { FaPlus, FaPen, FaTrash, FaEye, FaSearch, FaFileExport, FaEllipsisH } from 'react-icons/fa';

const getTypeBadge = (type) => (
  <Badge bg="primary">{type.replace('_', ' ')}</Badge>
);

const DocumentList = ({ shipmentId }) => {
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDocumentModal, setShowCreateDocumentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (shipmentId) {
      const dummyDocuments = [
        {
          document_no: 'DOC0001',
          document_type: 'invoice',
          file: 'invoice1.pdf',
          issued_date: '2024-01-01',
          description: 'Invoice for shipment',
        },
        {
          document_no: 'DOC0002',
          document_type: 'packing_list',
          file: 'packinglist.pdf',
          issued_date: '2024-01-02',
          description: 'Packing list for shipment',
        }
      ];
      setDocuments(dummyDocuments);
    }
  }, [shipmentId]);

  const handleAddDocument = (newDoc) => {
    newDoc.document_no = `DOC000${documents.length + 1}`;
    setDocuments(prev => [...prev, newDoc]);
  };

  const handleDeleteClick = (doc) => {
    setSelectedDocument(doc);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setDocuments(documents.filter(d => d.document_no !== selectedDocument.document_no));
    setShowDeleteModal(false);
    setSelectedDocument(null);
  };

  const filteredDocuments = documents.filter(d =>
    Object.values(d).some(val => val.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const paginatedDocuments = filteredDocuments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const exportCSV = () => {
    const headers = ['Document No.', 'Type', 'File', 'Issued Date', 'Description'];
    const rows = filteredDocuments.map(d => [d.document_no, d.document_type, d.file, d.issued_date, d.description]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'documents.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="table-responsive">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold">Documents for Shipment: <span className="text-primary">{shipmentId}</span></h6>
        <div className="d-flex gap-2">
          <InputGroup size="sm">
            <InputGroup.Text><FaSearch /></InputGroup.Text>
            <Form.Control
              type="search"
              placeholder="Search documents..."
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
            onClick={() => setShowCreateDocumentModal(true)}
            style={{ height: '50px', fontSize: '0.9rem', padding: '0.1rem' }}
          >
            <FaPlus size={13} className="me-1" />  Add Document
          </Button>
        </div>
      </div>

      <Table hover borderless size="sm" className="custom-table align-middle text-center">
        <thead className="table-header-bg">
          <tr>
            <th>Document No.</th>
            <th>Type</th>
            <th>File</th>
            <th>Issued Date</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedDocuments.map((doc, idx) => (
            <tr key={idx}>
              <td className="fw-semibold">{doc.document_no}</td>
              <td>{getTypeBadge(doc.document_type)}</td>
              <td>{doc.file}</td>
              <td>{doc.issued_date}</td>
              <td>{doc.description}</td>
              <td>
                <Dropdown align="end">
                  <Dropdown.Toggle as="button" className="btn btn-light btn-sm border-0">
                    <FaEllipsisH />
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="small">
                    <Dropdown.Item><FaEye className="me-2" />View</Dropdown.Item>
                    <Dropdown.Item><FaPen className="me-2" />Edit</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleDeleteClick(doc)} className="text-danger"><FaTrash className="me-2" />Delete</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </td>
            </tr>
          ))}
          {paginatedDocuments.length === 0 && (
            <tr>
              <td colSpan="6" className="text-muted text-center py-3">No documents found.</td>
            </tr>
          )}
        </tbody>
      </Table>

      {Math.ceil(filteredDocuments.length / itemsPerPage) > 1 && (
        <Pagination className="justify-content-center">
          {[...Array(Math.ceil(filteredDocuments.length / itemsPerPage))].map((_, i) => (
            <Pagination.Item key={i} active={i + 1 === currentPage} onClick={() => setCurrentPage(i + 1)}>{i + 1}</Pagination.Item>
          ))}
        </Pagination>
      )}

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Confirm Deletion</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to delete document <strong>{selectedDocument?.document_no}</strong>?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>

      {/* Document Create Modal */}
      <DocumentCreate
        show={showCreateDocumentModal}
        onClose={() => setShowCreateDocumentModal(false)}
        onAddDocument={handleAddDocument}
      />
    </div>
  );
};

export default DocumentList;
