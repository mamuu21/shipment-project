import React, { useState } from "react";
import { FaPlus, FaTruck, FaSearch, FaFileExport } from "react-icons/fa";
import { Button, Card, ProgressBar, Table, Dropdown, Tabs, Tab, Modal, Form } from "react-bootstrap";

const warehouseItems = [
  { id: "PCL-04021-1", customer: "Abdulswamad Makuya", weight: "230 KGS", volume: "1750", arrivalDate: "06/02/2024", status: "In Storage", type: "Parcel", location: "Zone A, Rack 12" },
  { id: "PCL-04022-2", customer: "John Smith", weight: "450 KGS", volume: "2100", arrivalDate: "10/02/2024", status: "Ready for Pickup", type: "Container", location: "Zone B, Rack 5" },
  { id: "PCL-04023-3", customer: "Maria Garcia", weight: "120 KGS", volume: "850", arrivalDate: "15/02/2024", status: "In Storage", type: "Parcel", location: "Zone A, Rack 8" },
  { id: "PCL-04024-4", customer: "Ahmed Hassan", weight: "780 KGS", volume: "3200", arrivalDate: "18/02/2024", status: "Processing", type: "Container", location: "Zone C, Rack 2" },
  { id: "PCL-04025-5", customer: "Sarah Johnson", weight: "95 KGS", volume: "620", arrivalDate: "22/02/2024", status: "In Storage", type: "Parcel", location: "Zone A, Rack 15" },
];

const WarehousePage = () => {
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

  const filteredItems = warehouseItems.filter((item) => {
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    const matchesSearch =
      searchQuery === "" ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "In Storage": return "bg-info text-white";
      case "Ready for Pickup": return "bg-success text-white";
      case "Processing": return "bg-warning text-white";
      default: return "bg-secondary text-white";
    }
  };

  const handleAddItem = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Customer", "Weight", "Volume", "Arrival Date", "Status", "Type", "Location"];
    const rows = filteredItems.map(item => [
      item.id,
      item.customer,
      item.weight,
      item.volume,
      item.arrivalDate,
      item.status,
      item.type,
      item.location
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "warehouse_items.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container py-4 bg-white rounded shadow">
      <h2 className="fs-3 fw-bold">Warehouse Management</h2>

      <Tabs defaultActiveKey="storage" className="mb-4">
        <Tab eventKey="overview" title="Overview">
          <div className="row mb-3">
            <div className="col-md-4">
              <Card>
                <Card.Body>
                  <Card.Title className="h6">Total Items</Card.Title>
                  <h3 className="h5">{warehouseItems.length}</h3>
                  <small>
                    {warehouseItems.filter((item) => item.type === "Parcel").length} Parcels, {warehouseItems.filter((item) => item.type === "Container").length} Containers
                  </small>
                </Card.Body>
              </Card>
            </div>
            <div className="col-md-4">
              <Card>
                <Card.Body>
                  <Card.Title className="h6">Storage Capacity</Card.Title>
                  <h3 className="h5">75%</h3>
                  <ProgressBar now={75} className="mb-2" />
                  <small className="text-warning">Warning: Approaching maximum capacity</small>
                </Card.Body>
              </Card>
            </div>
            <div className="col-md-4">
              <Card>
                <Card.Body>
                  <Card.Title className="h6">Pending Pickups</Card.Title>
                  <h3 className="h5 mb-1">1</h3>
                  <small>Scheduled for today</small>
                  <FaTruck className="ms-2 text-muted" />
                </Card.Body>
              </Card>
            </div>
          </div>
        </Tab>

        <Tab eventKey="storage" title="Storage Items">
          <div className="d-flex flex-column flex-md-row justify-content-between mb-3">
            <h2 className="h5 mb-3 mb-md-0">Warehouse Items</h2>
            <div className="d-flex gap-2">
              <div className="position-relative">
                <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
                <input
                  type="search"
                  className="form-control ps-5"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline-secondary" onClick={handleExportCSV}>
                <FaFileExport className="me-1" /> Export
              </Button>
              <Button variant="primary" onClick={handleAddItem}>
                <FaPlus className="me-1" /> Add Item
              </Button>
            </div>
          </div>

          <div className="mb-3">
            <Dropdown>
              <Dropdown.Toggle variant="secondary">
                Filter by Status
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {["All", "In Storage", "Ready for Pickup", "Processing"].map((status, idx) => (
                  <Dropdown.Item key={idx} onClick={() => setStatusFilter(status)}>{status}</Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>

          <div style={{ overflowX: "auto" }}>
            {filteredItems.length === 0 ? (
              <p className="text-center text-muted">No items found matching your filter.</p>
            ) : (
              <div className="table-responsive">
                <Table hover borderless size="sm" className="custom-table align-middle text-center">

                  <thead className="table-light">
                    <tr>
                      <th className="fw-bold fs-6">ID</th>
                      <th className="fw-bold fs-6">Customer</th>
                      <th className="fw-bold fs-6">Weight</th>
                      <th className="fw-bold fs-6">Volume</th>
                      <th className="fw-bold fs-6">Arrival Date</th>
                      <th className="fw-bold fs-6">Status</th>
                      <th className="fw-bold fs-6">Type</th>
                      <th className="fw-bold fs-6">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item, idx) => (
                      <tr key={idx} style={{ height: "45px" }}>
                        <td className="py-2">{item.id}</td>
                        <td className="py-2">{item.customer}</td>
                        <td className="py-2">{item.weight}</td>
                        <td className="py-2">{item.volume}</td>
                        <td className="py-2">{item.arrivalDate}</td>
                        <td className="py-2"><span className={`badge ${getStatusColor(item.status)}`}>{item.status}</span></td>
                        <td className="py-2">{item.type}</td>
                        <td className="py-2">{item.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </div>
        </Tab>
      </Tabs>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Customer Name</Form.Label>
              <Form.Control type="text" placeholder="Enter customer name" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Weight</Form.Label>
              <Form.Control type="text" placeholder="e.g. 230 KGS" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Volume</Form.Label>
              <Form.Control type="text" placeholder="e.g. 1750" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Arrival Date</Form.Label>
              <Form.Control type="date" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select>
                <option>In Storage</option>
                <option>Ready for Pickup</option>
                <option>Processing</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select>
                <option>Parcel</option>
                <option>Container</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control type="text" placeholder="e.g. Zone A, Rack 12" />
            </Form.Group>
            <Button variant="primary" type="submit">Save Item</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default WarehousePage;
