import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Pen, Trash2, Eye, MoreHorizontal } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

import type { Parcel } from './type'


interface ParcelTableProps {
  parcels: Parcel[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onDeleteClick: (parcel: Parcel) => void;
  onExportCSV: () => void;
  onCreateClick: () => void;
  count: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  prevPage: string | null;
  nextPage: string | null;
  filter: 'All' | 'In-transit' | 'Delivered' | 'Pending';
  setFilter: React.Dispatch<React.SetStateAction<'All' | 'In-transit' | 'Delivered' | 'Pending'>>;

  onView?: (parcel: Parcel) => void;
  onEdit?: (parcel: Parcel) => void;
  onDelete?: (parcel: Parcel) => void;
}

export const ParcelTable = ({
  parcels,
  searchQuery,
  onDeleteClick,
  count,
  currentPage,
  totalPages,
  onPageChange,
  prevPage,
  nextPage
}: ParcelTableProps) => {
  const navigate = useNavigate();
  const startItem = (currentPage - 1) * 10 + 1;
  const endItem = Math.min(currentPage * 10, count);



  const [filter, setFilter] = useState<'All' | 'In-transit' | 'Delivered'>('All');

  const filteredData = parcels.filter(p => {
    // Match tab filter
    const matchesTab = filter === 'All' || p.shipment_status === filter;
    
    // Match search query
    const matchesSearch = !searchQuery || [
      p.parcel_no,
      // p.shipment.shipment_no,
      p.customer?.name,
      p.commodity_type
    ].some(field => (field || '').toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesSearch;
  });


  const getStatusBadge = (status: string) => {
    const base = 'inline-block px-2 py-1 text-xs font-medium rounded-full';
    switch (status) {
      case 'Delivered':
        return <span className={`${base} bg-green-100 text-green-800`}>{status}</span>;
      case 'In-transit':
        return <span className={`${base} bg-yellow-100 text-yellow-800`}>{status}</span>;
      default:
        return <span className={`${base} bg-gray-100 text-gray-800`}>{status}</span>;
    }
  };

  return (
  <div className="space-y-4">
    {/* Table */}
    <div className="border rounded-lg overflow-hidden">
      <Tabs value={filter} onValueChange={(value: string) => setFilter(value as 'All' | 'In-transit' | 'Delivered')}>
        <TabsList>
          <TabsTrigger value="All">All</TabsTrigger>
          <TabsTrigger value="Delivered">Delivered</TabsTrigger>
          <TabsTrigger value="In-transit">In-transit</TabsTrigger>
        </TabsList>
      </Tabs>
      <Table>
        <TableHeader className="bg-gray-100">
          <TableRow>
            {['Parcel No', 'Customer', 'Shipment', 'Weight', 'Volume', 'Charge', 'Payment', 'Commodity Type', 'Status','Actions'].map((header) => (
              <TableHead key={header}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.length > 0 ? filteredData.map(p => (
            <TableRow key={p.parcel_no}>
              <TableCell>{p.parcel_no || '-'}</TableCell>
              <TableCell>{p.customer?.name || '-'}</TableCell>
              <TableCell>{p.shipment_vessel || '-'}</TableCell>
              <TableCell>{p.weight} {p.weight_unit}</TableCell>
              <TableCell>{p.volume} {p.volume_unit}</TableCell>
              <TableCell>{p.charge || '-'}</TableCell>
              <TableCell>{p.payment || '-'}</TableCell>
              <TableCell>{p.commodity_type || '-'}</TableCell>
              <TableCell>
                {p.shipment_status && getStatusBadge(p.shipment_status)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/parcels/${p.parcel_no}`)}>
                      <Eye className="mr-2 h-4 w-4" /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Pen className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDeleteClick(p);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-4 text-gray-500">
                {searchQuery ? 'No matching parcels' : 'No parcels available'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>

    {/* Pagination */}
    <div className="flex justify-between items-center mt-4 text-sm">
      <div>
        Showing {startItem} to {endItem} of {count} entries
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => prevPage && onPageChange(currentPage - 1)} 
              className={!prevPage ? 'opacity-50 pointer-events-none' : ''}

            />
          </PaginationItem>
          
          {[...Array(totalPages)].map((_, i) => (
            <PaginationItem key={i}>
              <PaginationLink
                isActive={currentPage === i + 1}
                onClick={() => onPageChange(i + 1)}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() => nextPage && onPageChange(currentPage + 1)}
              className={!nextPage ? 'opacity-50 pointer-events-none' : ''}

            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  </div>
);
};