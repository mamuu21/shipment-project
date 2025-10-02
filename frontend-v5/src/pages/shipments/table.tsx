import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } from '@/components/ui/pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Search, Download, Eye, Pen, Trash, MoreHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/utils/api';
import { useAuth } from '@/hooks/useAuth';

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

type ShipmentTableProps = {
  shipments: Shipment[];
  count: number;
  nextPage: string | null;
  prevPage: string | null;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  filter: string;
  setFilter: (filter: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  refreshShipments: () => void;
  isLoading: boolean;
};

const getStatusBadge = (status: string) => (
  <span className={`px-2 py-1 rounded-full text-xs ${
    status === 'Delivered' ? 'bg-green-100 text-green-800' :
    status === 'In-transit' ? 'bg-blue-100 text-blue-800' :
    'bg-gray-100 text-gray-800'
  }`}>
    {status}
  </span>
);

export const ShipmentTable = ({
  shipments,
  count,
  nextPage,
  prevPage,
  currentPage,
  setCurrentPage,
  filter,
  setFilter,
  searchQuery,
  setSearchQuery,
  refreshShipments,
  isLoading
}: ShipmentTableProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canEdit, canDelete } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredData = shipments.filter((shipment) => {
    const matchesFilter = filter === "All" || shipment.status === filter;
    const matchesSearch = ["shipment_no", "origin", "destination", "vessel"].some(key =>
      (shipment[key as keyof Shipment] ?? "").toString().toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesFilter && matchesSearch;
  });

  const handleExportCSV = () => {
    if (filteredData.length === 0) return;

    const headers = ['Shipment No', 'Transport', 'Vessel', 'Weight', 'Volume', 'Origin', 'Destination', 'Status'];
    const rows = filteredData.map(s => [
      s.shipment_no,
      s.transport,
      s.vessel,
      `${s.weight} ${s.weight_unit}`,
      `${s.volume} ${s.volume_unit}`,
      s.origin,
      s.destination,
      s.status
    ]);

    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shipments.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteClick = (shipment: Shipment) => {
    if (!shipment?.shipment_no) {
      toast({
        title: "Error",
        description: "Invalid shipment data",
        variant: "destructive",
      });
      return;
    }
    setSelectedShipment(shipment);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedShipment?.shipment_no) {
      toast({
        title: "Error",
        description: "No shipment selected for deletion",
        variant: "destructive",
      });
      setShowDeleteModal(false);
      return;
    }

    setIsDeleting(true);
    try {
      const token = localStorage.getItem("access_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await api.delete(`/shipments/${selectedShipment.shipment_no}/`, { headers });
      
      refreshShipments();
      
      toast({
        title: "Success",
        description: "Shipment deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete shipment",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setSelectedShipment(null);
    }
  };

  if (isLoading) return (
    <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
        <p>Loading shipments...</p>
      </div>
    </div>
  );

  

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="All">All</TabsTrigger>
            <TabsTrigger value="Delivered">Delivered</TabsTrigger>
            <TabsTrigger value="In-transit">In-transit</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search shipments..."
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
              <TableHead>Shipment No.</TableHead>
              <TableHead>Transport</TableHead>
              <TableHead>Vessel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Customers</TableHead>
              <TableHead>Parcels</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Volume</TableHead>
              <TableHead>Origin</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Steps</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((shipment) => (
                <TableRow key={`shipment-${shipment.shipment_no}`}>
                  <TableCell>{shipment.shipment_no}</TableCell>
                  <TableCell>{shipment.transport}</TableCell>
                  <TableCell>{shipment.vessel}</TableCell>
                  <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                  <TableCell>{shipment.customer_count}</TableCell>
                  <TableCell>{shipment.parcel_count}</TableCell>
                  <TableCell>{shipment.weight} {shipment.weight_unit}</TableCell>
                  <TableCell>{shipment.volume} {shipment.volume_unit}</TableCell>
                  <TableCell>{shipment.origin}</TableCell>
                  <TableCell>{shipment.destination}</TableCell>
                  <TableCell>{shipment.steps}</TableCell>
                  <TableCell>{shipment.documents}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/shipments/${shipment.shipment_no}`)}>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        {canEdit && (
                          <DropdownMenuItem>
                            <Pen className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                        )}
                        {canDelete && (
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteClick(shipment);
                            }}
                          >
                            <Trash className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={13} className="text-center py-4 text-gray-500">
                  No shipments found
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

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete shipment <strong>{selectedShipment?.shipment_no}</strong>?
          </DialogDescription>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedShipment(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};