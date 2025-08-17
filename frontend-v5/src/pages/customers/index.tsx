import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import api from '@/utils/api';
import BackArrow from '@/components/ui/backarrow';
import { CustomerTable } from './table';
import { CustomerForm } from './form';
import { DeleteDialog } from './delete';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'Active' | 'Dormant';
  total_parcels?: number;
  total_parcel_weight?: number;
  total_invoices_paid?: number;
  shipment_nos?: string[];
}

interface Shipment {
  id: string;
  shipment_no: string;
}

interface Parcel {
  id: string;
  parcel_no: string;
}

interface CustomersPageProps {
  shipmentId?: string;
}

export const CustomersPage = ({ shipmentId }: CustomersPageProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Data state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [filter, setFilter] = useState<'All' | 'Active' | 'Dormant'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [count, setCount] = useState(0);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [prevPage, setPrevPage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Main data fetching function
  const fetchCustomers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const url = new URL('/customers/', 'http://127.0.0.1:8000/api');
      url.searchParams.set('page', currentPage.toString());

      if (shipmentId) url.searchParams.set('parcels__shipment__shipment_no', shipmentId);
      if (filter !== 'All') url.searchParams.set('status', filter);
      if (searchQuery) url.searchParams.set('search', searchQuery);

      const response = await api.get(url.pathname + url.search, { headers });
      const data = response.data;

      setCustomers(Array.isArray(data) ? data : data?.results || []);
      setCount(data?.count || 0);
      setNextPage(data?.next || null);
      setPrevPage(data?.previous || null);
    } catch (err: any) {
      console.error('Failed to fetch customers:', err);
      setError(err?.response?.data?.detail || 'Failed to load customers');
      toast({
        title: 'Error',
        description: 'Failed to fetch customers',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch shipments for dropdown (similar to parcels page)
  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await api.get('/shipments/', { headers });
        setShipments(response.data.results || []);
      } catch (err) {
        console.error('Failed to fetch shipments:', err);
        toast({
          title: 'Error',
          description: 'Failed to load shipment data',
          variant: 'destructive',
        });
      }
    };
    fetchShipments();
  }, []);

  // Fetch parcels for dropdown (similar to parcels page)
  useEffect(() => {
    const fetchParcels = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await api.get('/parcels/', { headers });
        setParcels(response.data.results || []);
      } catch (err) {
        console.error('Failed to fetch parcels:', err);
        toast({
          title: 'Error',
          description: 'Failed to load parcel data',
          variant: 'destructive',
        });
      }
    };
    fetchParcels();
  }, []);

  // Fetch customers when dependencies change
  useEffect(() => {
    fetchCustomers();
  }, [shipmentId, currentPage, filter, searchQuery]);

  const refreshCustomers = async () => {
    await fetchCustomers();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('access_token');
      await api.delete(`/customers/${selectedCustomer.id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh data after deletion
      await refreshCustomers();
      
      toast({
        title: 'Success',
        description: 'Customer deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete customer', error);
      toast({
        title: 'Error',
        description: 'Failed to delete customer',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setSelectedCustomer(null);
    }
  };

  if (isLoading) return (
    <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
        <p>Loading customers...</p>
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
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <BackArrow onClick={() => navigate(-1)} />
          <h2 className="text-xl font-semibold">
            {shipmentId ? 'Shipment Customers' : 'All Customers'}
          </h2>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Customer
        </Button>
      </div>

      <CustomerTable
        customers={customers}
        count={count}
        nextPage={nextPage}
        prevPage={prevPage}
        currentPage={currentPage}
        setCurrentPage={handlePageChange}
        filter={filter}
        setFilter={setFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        refreshCustomers={refreshCustomers}
        isLoading={isLoading}
        onDeleteClick={(customer) => {
          setSelectedCustomer(customer);
          setShowDeleteModal(true);
        }}
        onViewDetails={(customerId) => navigate(`/customers/${customerId}`)}
      />

      <CustomerForm
        showCreateModal={showCreateModal}
        setShowCreateModal={setShowCreateModal}
        refreshCustomers={refreshCustomers}
        shipmentId={shipmentId}
        shipments={shipments}
        parcels={parcels}
      />

      <DeleteDialog
        open={showDeleteModal}
        setOpen={setShowDeleteModal}
        onConfirm={handleDeleteCustomer}
        itemName={selectedCustomer?.name || ''}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default CustomersPage;