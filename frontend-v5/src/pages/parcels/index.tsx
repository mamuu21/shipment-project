import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/utils/api';
import BackArrow from '@/components/ui/backarrow';
import { ParcelTable } from './table';
import { ParcelForm } from './form';
import { DeleteDialog } from './delete';
import { ParcelDetailDrawer } from './drawer';
import { Button } from '@/components/ui/button';
import { Plus, Search, FileUp, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [isDeleting, setIsDeleting] = useState(false);

  const [drawerParcelNo, setDrawerParcelNo] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [commodityFilter, setCommodityFilter] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('all');

  const commodityTypes = useMemo(() => {
    const types = new Set<string>();
    parcels.forEach(p => {
      if (p.commodity_type) types.add(p.commodity_type);
    });
    return Array.from(types).sort();
  }, [parcels]);

  const customerNames = useMemo(() => {
    const seen = new Map<string, string>();
    parcels.forEach(p => {
      if (p.customer?.id && p.customer?.name) {
        seen.set(p.customer.id, p.customer.name);
      }
    });
    return Array.from(seen.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [parcels]);

  const hasActiveFilters = commodityFilter !== 'all' || customerFilter !== 'all';

  const clearFilters = () => {
    setCommodityFilter('all');
    setCustomerFilter('all');
  };

  useEffect(() => {
    const fetchParcels = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("access_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const url = new URL('/parcels/', 'http://127.0.0.1:8000');
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

      setParcels(prev => prev.filter(p => p.parcel_no !== selectedParcel.parcel_no));
      setCount(prev => prev - 1);
      
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
    const matchesCommodity = commodityFilter === 'all' || p.commodity_type === commodityFilter;
    const matchesCustomer = customerFilter === 'all' || p.customer?.id === customerFilter;

    const matchesSearch = !searchQuery || [
      p.parcel_no,
      p.shipment?.shipment_no,
      p.customer?.name,
      p.commodity_type
    ].some(field => (field || '').toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCommodity && matchesCustomer && matchesSearch;
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

      {/* Filter dropdowns */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Select value={commodityFilter} onValueChange={setCommodityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Commodity Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Commodities</SelectItem>
            {commodityTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={customerFilter} onValueChange={setCustomerFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Customer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            {customerNames.map(([id, name]) => (
              <SelectItem key={id} value={id}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
            <X className="mr-1 h-4 w-4" /> Clear
          </Button>
        )}
      </div>

      {/* Active filter badges */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {commodityFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Commodity: {commodityFilter}
              <button onClick={() => setCommodityFilter('all')} className="ml-0.5 hover:text-blue-900" aria-label="Clear commodity filter">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {customerFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Customer: {customerNames.find(([id]) => id === customerFilter)?.[1] ?? customerFilter}
              <button onClick={() => setCustomerFilter('all')} className="ml-0.5 hover:text-blue-900" aria-label="Clear customer filter">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}

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
        onViewParcel={(parcelNo) => {
          setDrawerParcelNo(parcelNo);
          setDrawerOpen(true);
        }}
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

      <ParcelDetailDrawer
        parcelNo={drawerParcelNo}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setDrawerParcelNo(null);
        }}
      />
    </div>
  );
};

export default ParcelPage;
