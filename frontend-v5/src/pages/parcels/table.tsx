import { useNavigate } from 'react-router-dom';
import { Pen, Trash2, Eye, Search, FileUp, MoreHorizontal } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

interface Parcel {
  parcel_no: string;
  shipment_vessel: string;
  customer_id: string;   
  weight: number | '';  
  weight_unit: 'kg' | 'lbs' | 'tons';
  volume: number | '';
  volume_unit: 'm³' | 'ft³';
  charge: number | '';
  payment: 'Paid' | 'Unpaid';
  commodity_type: 'Box' | 'Parcel' | 'Envelope';
  shipment_status: string;  
  description: string;
  customer?: { name?: string }; 
}

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
}

export const ParcelTable = ({
  parcels,
  searchQuery,
  onSearchChange,
  onDeleteClick,
  onExportCSV,
  onCreateClick,
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
    {/* Search and Actions */}
    <div className="flex justify-between items-center flex-wrap gap-4">
      
      
      
    </div>

    {/* Table */}
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-100">
          <TableRow>
            {['Parcel No', 'Customer', 'Shipment', 'Weight', 'Volume', 'Charge', 'Payment', 'Commodity Type', 'Status','Actions'].map((header) => (
              <TableHead key={header}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {parcels.length > 0 ? parcels.map(p => (
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
                {getStatusBadge(p.shipment_status)}</TableCell>
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
              disabled={!prevPage} 
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
              disabled={!nextPage}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  </div>
);
};