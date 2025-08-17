import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import BackArrow from '@/components/ui/backarrow';
import { ShipmentForm } from './form';
import { ShipmentTable } from './table';
import api from '@/utils/api';

type Shipment = {
  shipment_no: string;
  transport: 'Air' | 'Sea' | 'Road' | string;
  vessel: string;
  status: 'Delivered' | 'In-transit' | string;
  customer_count: number;
  parcel_count: number;
  weight: number;
  weight_unit: string;
  volume: number;
  volume_unit: string;
  origin: string;
  destination: string;
  steps: number;
  documents: number;
};

export const ShipmentPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [count, setCount] = useState(0);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [prevPage, setPrevPage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  const baseUrl = "http://127.0.0.1:8000/api/shipments/";

  const refreshShipments = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await api.get(baseUrl + `?page=${currentPage}`, { headers });
      const data = response.data;

      setShipments(data.results);
      setCount(data.count);
      setNextPage(data.next);
      setPrevPage(data.previous);
    } catch (error) {
      console.error("Failed to fetch shipments", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshShipments();
  }, [currentPage]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <BackArrow onClick={() => navigate(-1)} />
          <h2 className="text-xl font-semibold">All Shipments</h2>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Shipment
        </Button>
      </div>

      <ShipmentTable
        shipments={shipments}
        count={count}
        nextPage={nextPage}
        prevPage={prevPage}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        filter={filter}
        setFilter={setFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        refreshShipments={refreshShipments}
        isLoading={isLoading}
      />

      <ShipmentForm
        showCreateModal={showCreateModal}
        setShowCreateModal={setShowCreateModal}
        refreshShipments={refreshShipments}
      />
    </div>
  );
};

export default ShipmentPage;
