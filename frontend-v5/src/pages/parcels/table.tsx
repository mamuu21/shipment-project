import { Pen, Trash2, Eye, MoreHorizontal } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { Button } from '@/components/ui/button';
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
  onViewParcel?: (parcelNo: string) => void;
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
  nextPage,
  onViewParcel
}: ParcelTableProps) => {
  const startItem = (currentPage - 1) * 10 + 1;
  const endItem = Math.min(currentPage * 10, count);

  const filteredData = parcels.filter(p => {
    return !searchQuery || [
      p.parcel_no,
      p.customer?.name,
      p.commodity_type
    ].some(field => (field || '').toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
  <div className="space-y-4">
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-100">
          <TableRow>
            {['Parcel No', 'Customer', 'Shipment', 'Weight', 'Volume', 'Charge', 'Payment', 'Commodity Type', 'Actions'].map((header) => (
              <TableHead key={header}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.length > 0 ? filteredData.map(p => (
            <TableRow
              key={p.parcel_no}
              onClick={() => onViewParcel?.(p.parcel_no)}
              className="cursor-pointer hover:bg-muted/50"
            >
              <TableCell>{p.parcel_no || '-'}</TableCell>
              <TableCell>{p.customer?.name || '-'}</TableCell>
              <TableCell>{p.shipment_vessel || '-'}</TableCell>
              <TableCell>{p.weight} {p.weight_unit}</TableCell>
              <TableCell>{p.volume} {p.volume_unit}</TableCell>
              <TableCell>{p.charge || '-'}</TableCell>
              <TableCell>{p.payment || '-'}</TableCell>
              <TableCell>{p.commodity_type || '-'}</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewParcel?.(p.parcel_no)}>
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
              <TableCell colSpan={8} className="text-center py-4 text-gray-500">
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
