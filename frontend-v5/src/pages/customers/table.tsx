import { useNavigate } from 'react-router-dom';
import { Search, Download, Eye, Pen, Trash, MoreHorizontal } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

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

interface CustomerTableProps {
  customers: Customer[];
  count: number;
  nextPage: string | null;
  prevPage: string | null;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  filter: 'All' | 'Active' | 'Dormant';
  setFilter: (filter: 'All' | 'Active' | 'Dormant') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  refreshCustomers: () => void;
  isLoading: boolean;
  onDeleteClick: (customer: Customer) => void;
  onViewDetails: (customerId: string) => void;
}

const getStatusBadge = (status: string) => (
  <span className={`px-2 py-1 rounded-full text-xs ${
    status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }`}>
    {status}
  </span>
);

export const CustomerTable = ({
  customers,
  count,
  nextPage,
  prevPage,
  currentPage,
  setCurrentPage,
  filter,
  setFilter,
  searchQuery,
  setSearchQuery,
  isLoading,
  onDeleteClick,
  onViewDetails
}: CustomerTableProps) => {
  const navigate = useNavigate();

  const filteredData = customers.filter((customer) => {
    const matchesFilter = filter === 'All' || customer.status === filter;
    const matchesSearch = ['name', 'email', 'phone', 'address', 'shipment_nos'].some(key =>
      (customer[key as keyof Customer] ?? '').toString().toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesFilter && matchesSearch;
  });

  const handleExportCSV = () => {
    if (filteredData.length === 0) return;

    const headers = ['ID', 'Name', 'Email', 'Phone', 'Address', 'Status', 'Parcels', 'Weight', 'Invoices Paid', 'Shipment Nos'];
    const rows = filteredData.map(c => [
      c.id,
      c.name,
      c.email,
      c.phone,
      c.address,
      c.status,
      c.total_parcels || 0,
      `${c.total_parcel_weight || 0} kg`,
      c.total_invoices_paid || 0,
      c.shipment_nos?.join(', ') || 'None'
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers.csv';
    a.click();
    URL.revokeObjectURL(url);
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
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <Tabs value={filter} onValueChange={(value) => setFilter(value as 'All' | 'Active' | 'Dormant')}>
          <TabsList>
            <TabsTrigger value="All">All</TabsTrigger>
            <TabsTrigger value="Active">Active</TabsTrigger>
            <TabsTrigger value="Dormant">Dormant</TabsTrigger>
          </TabsList>
        </Tabs>
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
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-100">
            <TableRow>
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
            {filteredData.length > 0 ? filteredData.map(customer => (
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
                <TableCell>
                  {customer.shipment_nos && customer.shipment_nos.length > 0
                    ? customer.shipment_nos.join(', ')
                    : 'None'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewDetails(customer.id)}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/customers/${customer.id}/edit`)}>
                        <Pen className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => onDeleteClick(customer)}
                      >
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-4 text-gray-500">
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
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => prevPage && setCurrentPage(currentPage - 1)}
                className={!prevPage ? 'opacity-50 pointer-events-none' : ''}
              />
            </PaginationItem>
            {[...Array(Math.ceil(count / 10))].map((_, i) => (
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
                className={!nextPage ? 'opacity-50 pointer-events-none' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};