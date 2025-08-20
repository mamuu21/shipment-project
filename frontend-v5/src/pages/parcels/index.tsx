import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/utils/api';
import BackArrow from '@/components/ui/backarrow';
import { ParcelTable } from './table';
import { ParcelForm } from './form';
import { DeleteDialog } from './delete';
import { Button } from '@/components/ui/button';
import { Plus, Search, FileUp, } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Parcel } from './type'


interface Shipment {
  shipment_no: string;
}

interface Customer {
  id: string;
  name: string;
}

interface ParcelPageProps {
  customerId?: string;
  shipmentId?: string;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const ITEMS_PER_PAGE = 10;

export const ParcelPage = ({ customerId, shipmentId }: ParcelPageProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [count, setCount] = useState(0);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [prevPage, setPrevPage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState<'All' | 'In-transit' | 'Delivered' | 'Pending'>('All');
  const [isDeleting, setIsDeleting] = useState(false);


  // Fetch parcels with pagination & filters
  useEffect(() => {
    const fetchParcels = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("access_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const url = new URL('/parcels/', 'http://127.0.0.1:8000/api');
        url.searchParams.set('page', currentPage.toString());

        if (customerId) url.searchParams.set('customer', customerId);
        if (shipmentId) url.searchParams.set('shipment', shipmentId);

        const response = await api.get<PaginatedResponse<Parcel>>(url.pathname + url.search, { headers });
        const data = response.data;

        setParcels(Array.isArray(data) ? data : data?.results || []);
        setCount(data?.count || 0);
        setNextPage(data?.next || null);
        setPrevPage(data?.previous || null);
      } catch (err: any) {
        console.error('Failed to fetch parcels:', err);
        setError(err?.response?.data?.detail || 'Failed to load parcels');
      } finally {
        setIsLoading(false);
      }
    };

    fetchParcels();
  }, [customerId, shipmentId, currentPage]);

  // Fetch shipments for dropdown
  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await api.get<PaginatedResponse<Shipment>>('/shipments/', { headers });
        setShipments(response.data.results || []);
      } catch (err) {
        console.error('Failed to fetch shipments:', err);
      }
    };
    fetchShipments();
  }, []);

  // Fetch customers for dropdown
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await api.get<PaginatedResponse<Customer>>('/customers/', { headers });
        setCustomers(response.data.results || []);
      } catch (err) {
        console.error('Failed to fetch customers:', err);
      }
    };
    fetchCustomers();
  }, []);

  const handleExportCSV = () => {
    try {
      const headers = ['Parcel No', 'Shipment', 'Weight', 'Volume', 'Customer', 'Charge', 'Commodity Type'];
      const rows = parcels.map(p => [
        p.parcel_no || '',
        p.shipment || '',
        `${p.weight || 0} ${p.weight_unit || ''}`.trim(),
        `${p.volume || 0} ${p.volume_unit || ''}`.trim(),
        p.customer?.name || '',
        p.charge?.toString() || '',
        p.commodity_type || ''
      ]);
      
      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `parcels_${new Date().toISOString().slice(0,10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to generate export');
    }
  };

  const handleDeleteClick = (parcel: Parcel) => {
    setSelectedParcel(parcel);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedParcel?.parcel_no) {
      console.error('No parcel selected for deletion');
      return;
    }

    setIsDeleting(true);

    try {
      const token = localStorage.getItem('access_token');
      await api.delete(`/parcels/${selectedParcel.parcel_no}/`, {
        headers: { 
          Authorization: `Bearer ${token}`,
        }
      });

      // Update local state
      setParcels(prev => prev.filter(p => p.parcel_no !== selectedParcel.parcel_no));
      setCount(prev => prev - 1);
      
      // Show success notification
      toast({
        title: 'Success',
        description: 'Parcel deleted successfully',
      });

    } catch (err: any) {
      console.error('Delete failed:', err);
      toast({
        title: 'Error',
        description: err?.response?.data?.detail || 'Failed to delete parcel',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setSelectedParcel(null);
    }
  };

  const handleAddParcel = async (formData: Parcel) => {
    setIsSubmitting(true);
    const token = localStorage.getItem('access_token');

    try {
      const payload = {
        parcel_no: formData.parcel_no,
        shipment: formData.shipment,
        customer_id: formData.customer_id,
        weight: Number(formData.weight),
        weight_unit: formData.weight_unit,
        volume: Number(formData.volume),
        volume_unit: formData.volume_unit,
        charge: Number(formData.charge),
        payment: formData.payment,
        commodity_type: formData.commodity_type,
        description: formData.description,
      };

      const response = await api.post<Parcel>('/parcels/', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setParcels(prev => [response.data, ...prev]);
      setCount(prev => prev + 1);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create parcel:', error);
      alert('Failed to create parcel, please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredData = parcels.filter(p => {
    const parcelStatus = p.shipment?.status || 'Pending'; 

    const matchesTab = filter === 'All' || parcelStatus === filter;


    const matchesSearch = !searchQuery || [
      p.parcel_no,
      p.shipment?.shipment_no,
      p.customer?.name,
      p.commodity_type
    ].some(field => (field || '').toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesSearch;
  });



  const totalPages = Math.ceil(count / ITEMS_PER_PAGE) || 1;

  if (isLoading) return (
    <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
        <p>Loading parcels...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
        <p className="mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      {/* Header with back button */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <BackArrow onClick={() => navigate(-1)} />
          <h2 className="text-xl font-semibold">Parcel </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search parcels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={handleExportCSV} disabled={!parcels.length}>
            <FileUp className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Parcel
          </Button>
        </div>
      </div>



      <ParcelTable
        parcels={filteredData}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onDeleteClick={handleDeleteClick}
        onExportCSV={handleExportCSV}
        onCreateClick={() => setShowCreateModal(true)}
        count={count}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        prevPage={prevPage}
        nextPage={nextPage}
        filter={filter}
        setFilter={setFilter}
      />

      <ParcelForm
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleAddParcel}
        shipments={shipments}
        customers={customers}
        isSubmitting={isSubmitting}
      />

      <DeleteDialog
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleDelete}
        itemName={selectedParcel?.parcel_no || ''}
        isDeleting={isDeleting}
      />
    </div>
);
};

export default ParcelPage;
