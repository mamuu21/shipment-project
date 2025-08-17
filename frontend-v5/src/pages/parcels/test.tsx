import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/utils/api';
import { 
  Plus, Pen, Trash2, Eye, Search, FileUp, MoreHorizontal
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import BackArrow from '@/components/ui/backarrow';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea'; 
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

interface Parcel {
  parcel_no: string;
  shipment: string;
  customer_id: string;   
  weight: number | '';  
  weight_unit: 'kg' | 'lbs' | 'tons';
  volume: number | '';
  volume_unit: 'm³' | 'ft³';
  charge: number | '';
  payment: 'Paid' | 'Unpaid';
  commodity_type: 'Box' | 'Parcel' | 'Envelope';
  description: string;
  customer?: { name?: string }; 
}

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

const ITEMS_PER_PAGE = 10;

const ParcelPage = ({ customerId, shipmentId }: ParcelPageProps) => {
  const navigate = useNavigate();

  // Main data state
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

  // Form data state (use formData everywhere)
  const [formData, setFormData] = useState<Parcel>({
    parcel_no: '',
    shipment: '',
    customer_id: '',
    weight: '',
    weight_unit: 'kg',
    volume: '',
    volume_unit: 'm³',
    charge: '',
    payment: 'Unpaid',
    commodity_type: 'Box',
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'weight' || name === 'volume' || name === 'charge') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? '' : Number(value),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

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

        const response = await api.get(url.pathname + url.search, { headers });
        const data = response.data;

        setParcels(Array.isArray(data) ? data : data?.results || []);
        setCount(data?.count || 0);
        setNextPage(data?.next || null);
        setPrevPage(data?.previous || null);
        setCurrentPage(parseInt(url.searchParams.get("page") || "1"));
      } catch (err: any) {
        console.error('Failed to fetch parcels:', err);
        setError(err?.response?.data?.detail || 'Failed to load parcels');
      } finally {
        setIsLoading(false);
      }
    };

    fetchParcels();
  }, [customerId, shipmentId, currentPage]);

  // Fetch shipments for dropdown (call once)
  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await api.get('/shipments/', { headers });
        setShipments(response.data.results || []);
      } catch (err) {
        console.error('Failed to fetch shipments:', err);
      }
    };
    fetchShipments();
  }, []);

  // Fetch customers for dropdown (call once)
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await api.get('/customers/', { headers });
        setCustomers(response.data.results || []);
      } catch (err) {
        console.error('Failed to fetch customers:', err);
      }
    };
    fetchCustomers();
  }, []);

  // Export CSV handler (no changes)
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

  // Filtered parcels by search
  const filteredData = parcels.filter(p => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return [
      p.parcel_no,
      p.shipment,
      p.customer?.name,
      p.commodity_type
    ].some(field => (field || '').toLowerCase().includes(query));
  });

  // Delete parcel handlers
  const handleDeleteClick = (parcel: Parcel) => {
    setSelectedParcel(parcel);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedParcel?.parcel_no) return;
    
    try {
      const token = localStorage.getItem('access_token');
      await api.delete(`/parcels/${selectedParcel.parcel_no}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setParcels(prev => prev.filter(p => p.parcel_no !== selectedParcel.parcel_no));
      setCount(prev => prev - 1);
      setShowDeleteModal(false);
    } catch (err: any) {
      console.error('Delete failed:', err);
      alert(err?.response?.data?.detail || 'Failed to delete parcel');
    }
  };

  // Add parcel handler
  const handleAddParcel = async () => {
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

      const response = await api.post('/parcels/', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setParcels(prev => [response.data, ...prev]);
      setCount(prev => prev + 1);

      alert('Parcel added successfully!');
      setShowCreateModal(false);

      setFormData({
        parcel_no: '',
        shipment: '',
        customer_id: '',
        weight: '',
        weight_unit: 'kg',
        volume: '',
        volume_unit: 'm³',
        charge: '',
        payment: 'Unpaid',
        commodity_type: 'Box',
        description: '',
      });
    } catch (error) {
      console.error('Failed to create parcel:', error);
      alert('Failed to create parcel, please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPages = Math.ceil(count / ITEMS_PER_PAGE) || 1;
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startItem = (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(safeCurrentPage * ITEMS_PER_PAGE, count);

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
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <BackArrow onClick={() => navigate(-1)} />
            <h2 className="text-xl font-semibold">Parcels</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
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

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                {['Parcel No', 'Customer', 'Shipment', 'Weight', 'Volume', 'Charge', 'Payment', 'Commodity Type', 'Actions'].map((header) => (
                  <TableHead key={header} className="text-center">{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? filteredData.map(p => (
                <TableRow key={p.parcel_no}>
                  <TableCell className="text-center">{p.parcel_no || '-'}</TableCell>
                  <TableCell className="text-center">{p.customer?.name || '-'}</TableCell>
                  <TableCell className="text-center">{p.shipment || '-'}</TableCell>
                  <TableCell className="text-center">{p.weight} {p.weight_unit}</TableCell>
                  <TableCell className="text-center">{p.volume} {p.volume_unit}</TableCell>
                  <TableCell className="text-center">{p.charge || '-'}</TableCell>
                  <TableCell className="text-center">{p.payment || '-'}</TableCell>
                  <TableCell className="text-center">{p.commodity_type || '-'}</TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => navigate(`/parcels/${p.parcel_no}`)}>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/parcels/${p.parcel_no}/edit`)}>
                          <Pen className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600" 
                          onClick={() => handleDeleteClick(p)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-gray-500 py-6">
                    {searchQuery ? 'No matching parcels' : 'No parcels available'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6 text-sm">
          <div className="text-gray-600">
            Showing {startItem} to {endItem} of {count} entries
          </div>
          
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => prevPage && setCurrentPage(currentPage - 1)} 
                  disabled={!prevPage} 
                />
              </PaginationItem>
              
              {[...Array(Math.ceil(count / ITEMS_PER_PAGE))].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={currentPage === i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => nextPage && setCurrentPage(currentPage + 1)}
                  disabled={!nextPage}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>

        {/* Delete Dialog */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogDescription>
                Delete parcel <strong>{selectedParcel?.parcel_no}</strong>? This cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Parcel Dialog */}
  

        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-h-[90vh] overflow-y-auto w-[600px] sm:w-[700px]">
            <DialogHeader>
              <DialogTitle>Add New Parcel</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Parcel no</label>
                <Input
                placeholder="parcel_no"
                name="parcel_no"
                value={formData.parcel_no}
                onChange={handleChange}
                required
              />
            </div>
              
              {/* Shipment select */}
              <div>
                <label className="block text-sm font-medium mb-1">Shipment no</label>
                <Select
                  name="shipment"
                  value={formData.shipment}
                  onValueChange={(value) => handleChange({ target: { name: 'shipment', value } } as any)}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Shipment" />
                  </SelectTrigger>
                  <SelectContent>
                    {shipments.map((s) => (
                      <SelectItem key={s.shipment_no} value={s.shipment_no}>
                        {s.shipment_no}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Customer select */}
              <div>
                <label className="block text-sm font-medium mb-1">Customer name</label>
                <Select
                  name="customer_id"
                  value={formData.customer_id}
                  onValueChange={(value) => handleChange({ target: { name: 'customer_id', value } } as any)}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              

              {/* Weight input and unit select */}
              <div className="flex gap-3">
                <Input
                  type="number"
                  placeholder="Weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                />
                <Select
                  name="weight_unit"
                  value={formData.weight_unit}
                  onValueChange={(value) => handleChange({ target: { name: 'weight_unit', value } } as any)}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="lbs">lbs</SelectItem>
                    <SelectItem value="tons">tons</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Volume input and unit select */}
              <div className="flex gap-3">
                <Input
                  type="number"
                  placeholder="Volume"
                  name="volume"
                  value={formData.volume}
                  onChange={handleChange}
                  required
                />
                <Select
                  name="volume_unit"
                  value={formData.volume_unit}
                  onValueChange={(value) => handleChange({ target: { name: 'volume_unit', value } } as any)}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="m³">m³</SelectItem>
                    <SelectItem value="ft³">ft³</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Input
                type="number"
                placeholder="Charge (TZS)"
                name="charge"
                value={formData.charge}
                onChange={handleChange}
                required
              />

              <Select
                name="payment"
                value={formData.payment}
                onValueChange={(value) => handleChange({ target: { name: 'payment', value } } as any)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>

              <Select
                name="commodity_type"
                value={formData.commodity_type}
                onValueChange={(value) => handleChange({ target: { name: 'commodity_type', value } } as any)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Box">Box</SelectItem>
                  <SelectItem value="Parcel">Parcel</SelectItem>
                  <SelectItem value="Envelope">Envelope</SelectItem>
                </SelectContent>
              </Select>

              <Textarea
                placeholder="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button onClick={handleAddParcel} disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Parcel'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>


      </div>
  );
};

export default ParcelPage;
