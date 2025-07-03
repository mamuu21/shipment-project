import React, { useState } from "react";
import { Search, Package, Truck, Ship, Plane } from "lucide-react";

export default function TrackShipment () {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!trackingNumber) return;

    setIsSearching(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const upper = trackingNumber.toUpperCase();
    if (upper === "SHP-001" || upper === "SHP-002") {
      setSearchResult({
        id: upper,
        status: upper === "SHP-001" ? "Delivered" : "In-transit",
        origin: "Dar es salaam, Tanzania",
        destination: upper === "SHP-001" ? "Turkey" : "China",
        carrier: upper === "SHP-001" ? "Hapag-Lloyd" : "KLM Cargo",
        type: upper === "SHP-001" ? "Sea" : "Air",
        updates: [
          {
            date: "10/04/2023",
            status: upper === "SHP-001" ? "Delivered" : "In-transit",
            location: upper === "SHP-001" ? "Turkey" : "Dubai, UAE",
          },
          {
            date: "05/04/2023",
            status: "Customs cleared",
            location: upper === "SHP-001" ? "Turkey" : "Dubai, UAE",
          },
          {
            date: "01/04/2023",
            status: "Departed",
            location: "Dar es salaam, Tanzania",
          },
          {
            date: "28/03/2023",
            status: "Processing",
            location: "Dar es salaam, Tanzania",
          },
        ],
      });
    } else {
      setSearchResult(null);
    }
    setIsSearching(false);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "success";
      case "in-transit":
        return "primary";
      case "customs cleared":
        return "warning";
      case "departed":
        return "info";
      default:
        return "secondary";
    }
  };

  const getTransportIcon = (type) => {
    switch (type.toLowerCase()) {
      case "sea":
        return <Ship size={20} />;
      case "air":
        return <Plane size={20} />;
      default:
        return <Truck size={20} />;
    }
  };

  return (
    <div className="container py-4">
      {/* <h1 className="h4 mb-4">Track Shipment</h1> */}
      <h2 className="fs-3 fw-bold">Track Shipment</h2>

      <div className="card mb-4">
        <div className="card-header">Enter Tracking Number</div>
        <div className="card-body">
          <ul className="nav nav-tabs mb-3">
            <li className="nav-item">
              <a className="nav-link active" data-bs-toggle="tab" href="#tracking">Tracking Number</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" data-bs-toggle="tab" href="#reference">Reference Number</a>
            </li>
          </ul>
          <div className="tab-content">
            <div className="tab-pane fade show active" id="tracking">
              <form onSubmit={handleSearch} className="row g-2">
                <div className="col-md">
                  <div className="input-group">
                    <span className="input-group-text">
                      <Search size={16} />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter tracking number (e.g., SHP-001)"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-auto">
                  <button type="submit" className="btn btn-primary" disabled={isSearching || !trackingNumber}>
                    {isSearching ? "Searching..." : "Track"}
                  </button>
                </div>
              </form>
              <small className="text-muted mt-2 d-block">
                Try using SHP-001 or SHP-002 for demo purposes
              </small>
            </div>
            <div className="tab-pane fade" id="reference">
              <form onSubmit={handleSearch} className="row g-2">
                <div className="col-md">
                  <div className="input-group">
                    <span className="input-group-text">
                      <Search size={16} />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter reference number"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-auto">
                  <button type="submit" className="btn btn-primary" disabled={isSearching || !trackingNumber}>
                    {isSearching ? "Searching..." : "Track"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {searchResult ? (
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">Shipment Information</div>
              <div className="card-body">
                <p><strong>Tracking Number:</strong> {searchResult.id}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={`badge bg-${getStatusColor(searchResult.status)}`}>{searchResult.status}</span>
                </p>
                <p>
                  <strong>Carrier:</strong> {getTransportIcon(searchResult.type)} {searchResult.carrier} ({searchResult.type})
                </p>
                <p>
                  <strong>Route:</strong> {searchResult.origin} → {searchResult.destination}
                </p>
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="card">
              <div className="card-header">Tracking History</div>
              <div className="card-body">
                <ul className="timeline">
                  {searchResult.updates.map((update, index) => (
                    <li key={index} className="mb-4">
                      <div className="d-flex justify-content-between">
                        <h5>{update.status}</h5>
                        <small className="text-muted">{update.date}</small>
                      </div>
                      <p className="text-muted">{update.location}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : trackingNumber && !isSearching ? (
        <div className="card text-center mt-4">
          <div className="card-body">
            <Package size={48} className="text-muted mb-3" />
            <h5>No shipment found</h5>
            <p className="text-muted">
              We couldn't find any shipment with the tracking number "{trackingNumber}". Please check the number and try again.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
