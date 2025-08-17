'use client';

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackArrow from '@/components/ui/backarrow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Search,
  Download,
  Eye,
  Pen,
  Trash,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import api from '@/utils/api';

type Customer = {
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
};

const getStatusBadge = (status: string) => (
  <span className={`px-2 py-1 rounded-full text-xs ${
    status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }`}>
    {status}
  </span>
);

export default function CustomersPage({ params }: { params: { shipmentId?: string } }) {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Data + UI state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filter, setFilter] = useState<'All' | 'Active' | 'Dormant'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [count, setCount] = useState(0);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [prevPage, setPrevPage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Form state
  const [formData, setFormData] = useState<Omit<Customer, 'id'>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'Active'
  });

  // Loading states for actions
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  

  // --- Fetch function (respects backend pagination & optional shipment filter)
  const fetchCustomers = async (page = currentPage) => {
    try {
      setIsLoading(true);
      // Build endpoint relative to api.baseURL (api configured with baseURL '/api')
      let endpoint = params?.shipmentId
        ? `/shipments/${params.shipmentId}/customers/`
        : `/customers/`;

      // Add page query param
      endpoint += `?page=${page}`;

      const response = await api.get(endpoint);
      const data = response.data;

      // Expecting DRF paginated response: { results, count, next, previous }
      setCustomers(data.results || []);
      setCount(data.count ?? 0);
      setNextPage(data.next ?? null);
      setPrevPage(data.previous ?? null);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch customers', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch customers',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial + page change fetch
  useEffect(() => {
    fetchCustomers(1);
  }, [params?.shipmentId]);

  // When currentPage changes (e.g., using pagination buttons) fetch that page
  useEffect(() => {
    fetchCustomers(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // --- Add customer
  const handleAddCustomer = async () => {
    setIsAdding(true);
    try {
      // POST to '/customers/' (api baseURL already points to /api)
      const response = await api.post('/customers/', formData);
      // After adding, fetch current page again so pagination counts are accurate
      await fetchCustomers(currentPage);
      setShowCreateModal(false);
      setFormData({ name: '', email: '', phone: '', address: '', status: 'Active' });
      toast({
        title: 'Success',
        description: 'Customer added successfully',
      });
    } catch (error) {
      console.error('Failed to add customer', error);
      toast({
        title: 'Error',
        description: 'Failed to add customer',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  // --- Delete customer (uses selectedCustomer.id)
  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;
    setIsDeleting(true);
    try {
      await api.delete(`/customers/${selectedCustomer.id}/`);
      // After success, refresh current page (keeps pagination consistent)
      await fetchCustomers(currentPage);
      setShowDeleteModal(false);
      setSelectedCustomer(null);
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
    }
  };

  // --- Filter & search applied on client side (you already had this)
  const filteredData = customers
    .filter(c =>
      ['name', 'email', 'phone', 'address', 'status'].some(field =>
        (String((c as any)[field]) || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
    .filter(c => filter === 'All' || c.status === filter);

  // --- Export CSV for filteredData
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

  // --- Helper to parse page number from next/prev links (if needed)
  const getPageFromUrl = (url: string | null) => {
    if (!url) return null;
    try {
      const u = new URL(url);
      const p = u.searchParams.get('page');
      return p ? parseInt(p, 10) : null;
    } catch {
      return null;
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <BackArrow onClick={() => navigate(-1)} />
            <h2 className="text-xl font-semibold">Customers</h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>

            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" /> New Customer
            </Button>
          </div>
        </div>

        <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="mb-6">
          <TabsList>
            <TabsTrigger value="All">All</TabsTrigger>
            <TabsTrigger value="Active">Active</TabsTrigger>
            <TabsTrigger value="Dormant">Dormant</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Parcels</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Invoices Paid</TableHead>
                <TableHead>Shipment Nos</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>{customer.id}</TableCell>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.address}</TableCell>
                    <TableCell>{getStatusBadge(customer.status)}</TableCell>
                    <TableCell>{customer.total_parcels ?? 0}</TableCell>
                    <TableCell>{customer.total_parcel_weight ?? 0} kg</TableCell>
                    <TableCell>{customer.total_invoices_paid ?? 0}</TableCell>
                    <TableCell>{customer.shipment_nos?.join(', ') || 'None'}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/customer/${customer.id}`)}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>

                          <DropdownMenuItem>
                            <Pen className="mr-2 h-4 w-4" /> Edit Customer
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setShowDeleteModal(true);
                            }}
                          >
                            <Trash className="mr-2 h-4 w-4" /> Delete Customer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-4 text-gray-500">
                    No customers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-between items-center mt-4 text-sm">
          <div>
            Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, count)} of {count} entries
          </div>

          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const page = getPageFromUrl(prevPage) ?? Math.max(1, currentPage - 1);
                setCurrentPage(page);
              }}
              disabled={!prevPage && currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>

            {[...Array(Math.ceil(count / 10)).keys()].map(i => (
              <Button
                key={i}
                variant={currentPage === i + 1 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const page = getPageFromUrl(nextPage) ?? currentPage + 1;
                setCurrentPage(page);
              }}
              disabled={!nextPage && currentPage >= Math.ceil(count / 10)}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
     

      {/* Create Customer Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter customer name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter customer email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <Input
                name="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter customer address"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as 'Active' | 'Dormant' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Dormant">Dormant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)} disabled={isAdding}>
              Cancel
            </Button>
            <Button onClick={handleAddCustomer} disabled={isAdding}>
              {isAdding ? 'Adding...' : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>

          <DialogDescription>
            Are you sure you want to delete customer <strong>{selectedCustomer?.name}</strong>?
          </DialogDescription>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDeleteModal(false); setSelectedCustomer(null); }} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCustomer} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
