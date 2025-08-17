'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BackArrow from '@/components/ui/backarrow';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } from '@/components/ui/pagination';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Download, Eye, Pen, Trash, MoreHorizontal } from 'lucide-react';
import api from '@/utils/api';

type Invoice = {
  id?: string;
  invoice_no: string;
  customer_id: string;
  customer?: { name?: string };
  shipment?: {
    shipment_no: string;
  } | null;
  total_amount: number;
  issue_date: string;
  due_date: string;
  status: 'Paid' | 'Pending' | 'Overdue';
};

interface Customer {
  id: string;
  name: string;
}

interface Shipment {
  shipment_no: string;
}

/* ---------------- Invoice Modal ---------------- */
function InvoiceModal({
  show,
  onClose,
  onAdd,
  customers = [],
  shipments = []
}: {
  show: boolean;
  onClose: () => void;
  onAdd: (invoice: Invoice) => void;
  customers: Customer[];
  shipments: Shipment[];
}) {
  const [formData, setFormData] = useState<{
    invoice_no: string;
    customer_id: string;
    shipment: string;
    total_amount: number | string;
    issue_date: Date | undefined;
    due_date: Date | undefined;
    status: "Paid" | "Pending" | "Overdue";
  }>( {
    invoice_no: "",
    customer_id: "",
    shipment: "",
    total_amount: "",
    issue_date: undefined,
    due_date: undefined,
    status: "Pending"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "total_amount" ? (value === "" ? "" : parseFloat(value)) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("access_token");

      const payload = {
        invoice_no: formData.invoice_no,
        customer: formData.customer_id, // backend expects customer id
        issue_date: formData.issue_date ? format(formData.issue_date, "yyyy-MM-dd") : "",
        due_date: formData.due_date ? format(formData.due_date, "yyyy-MM-dd") : "",
        shipment: formData.shipment ? { shipment_no: formData.shipment } : null,
        total_amount: typeof formData.total_amount === "string" && formData.total_amount === "" ? 0 : Number(formData.total_amount),
        status: formData.status
      };

      const response = await api.post("/invoices/", payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });

      // Provide the created invoice with customer object for immediate UI use
      onAdd({
        ...response.data,
        customer: customers.find(c => c.id === formData.customer_id)
      });
      onClose();
    } catch (error) {
      console.error("Error adding invoice:", error);
    }
  };

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto w-[600px] sm:w-[700px]">
        <DialogHeader>
          <DialogTitle>Add Invoice</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Invoice Number</label>
            <Input name="invoice_no" value={formData.invoice_no} onChange={handleChange} required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Customer</label>
            <Select
                value={formData.customer_id}
                onValueChange={(value) => setFormData(prev => ({
                ...prev,
                customer: value
                }))}
            >
                <SelectTrigger>
                <SelectValue placeholder="Select customer" >
                    {customers.find(c => c.id === formData.customer_id)?.name || "Select customer"} 
                </SelectValue>
                </SelectTrigger>
                <SelectContent>
                {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
          </div>


          <div>
            <label className="block text-sm font-medium mb-1">Shipment</label>
            <Select
              value={formData.shipment}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, shipment: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Shipment" />
              </SelectTrigger>
              <SelectContent>
                {shipments.map((ship) => (
                  <SelectItem key={ship.shipment_no} value={ship.shipment_no}>
                    {ship.shipment_no}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Total Amount</label>
            <Input
              type="number"
              name="total_amount"
              value={formData.total_amount}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Issue Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.issue_date ? format(formData.issue_date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0">
                  <Calendar
                    mode="single"
                    selected={formData.issue_date}
                    onSelect={(date) => setFormData((prev) => ({ ...prev, issue_date: date }))}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.due_date ? format(formData.due_date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0">
                  <Calendar
                    mode="single"
                    selected={formData.due_date}
                    onSelect={(date) => setFormData((prev) => ({ ...prev, due_date: date }))}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, status: value as "Paid" | "Pending" | "Overdue" }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Invoice Page ---------------- */
const getStatusBadge = (status: string) => (
  <span className={`px-2 py-1 rounded-full text-xs ${
    status === 'Paid' ? 'bg-green-100 text-green-800' :
    status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
    'bg-red-100 text-red-800'
  }`}>
    {status}
  </span>
);

const InvoicePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'All' | 'Paid' | 'Pending' | 'Overdue'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [count, setCount] = useState(0);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [prevPage, setPrevPage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        const token = localStorage.getItem('access_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

        const [invoicesRes, customersRes, shipmentsRes] = await Promise.all([
          api.get(`/invoices/?page=${currentPage}`, { headers }),
          api.get('/customers/', { headers }),
          api.get('/shipments/', { headers })
        ]);

        const customersData = Array.isArray(customersRes.data)
          ? customersRes.data
          : customersRes.data?.results || [];
        setCustomers(customersData);

        const shipmentsData = Array.isArray(shipmentsRes.data)
          ? shipmentsRes.data
          : shipmentsRes.data?.results || [];
        setShipments(shipmentsData);

        const invoicesData = Array.isArray(invoicesRes.data)
          ? invoicesRes.data
          : invoicesRes.data?.results || [];

        // Map customer objects onto invoices (for display)
        const invoicesWithCustomers = invoicesData.map((invoice: any) => ({
          ...invoice,
          customer: customersData.find((c: Customer) => c.id === invoice.customer_id)
        }));

        setInvoices(invoicesWithCustomers);
        setCount(invoicesRes.data?.count || invoicesData.length || 0);
        setNextPage(invoicesRes.data?.next || null);
        setPrevPage(invoicesRes.data?.previous || null);

      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch data',
          variant: 'destructive',
        });
        console.error('Fetch error:', error);
      }finally{
        setIsLoading(false);
      }

    };
    fetchData();
  }, [currentPage, toast]);

  const handleAddInvoice = (newInvoice: Invoice) => {
    setInvoices(prev => [newInvoice, ...prev]);
    setCount(prev => prev + 1);
    toast({
      title: 'Success',
      description: 'Invoice added successfully',
    });
  };

  const handleDeleteClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedInvoice) {
      toast({
        title: "Error",
        description: "No invoice selected",
        variant: "destructive",
      });
      setShowDeleteModal(false);
      return;
    }

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('access_token');
      const identifier = selectedInvoice.id ?? selectedInvoice.invoice_no;
      const path = `/invoices/${identifier}/`;

      await api.delete(path, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });

      setInvoices(prev => prev.filter(inv => (inv.id ?? inv.invoice_no) !== identifier));
      setCount(prev => Math.max(prev - 1, 0));
      toast({
        title: 'Success',
        description: 'Invoice deleted successfully',
      });
    } catch (err: any) {
      console.error('Delete error:', err);
      toast({
        title: 'Error',
        description: err?.response?.data?.detail || 'Failed to delete invoice',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const filteredData = invoices.filter(inv => {
    const matchText = ['invoice_no', 'customer', 'shipment'].some(field =>
      field === 'shipment'
        ? (inv.shipment?.shipment_no || '').toLowerCase().includes(searchQuery.toLowerCase())
        : field === 'customer'
          ? (inv.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
          : (inv[field as keyof Invoice] || '').toString().toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchStatus = filter === 'All' || inv.status === filter;
    return matchText && matchStatus;
  });

  const handleExportCSV = () => {
    if (filteredData.length === 0) return;

    const headers = ['Invoice No', 'Customer', 'Shipment', 'Date', 'Due Date', 'Amount', 'Status'];
    const rows = filteredData.map(inv => [
      inv.invoice_no,
      inv.customer?.name || 'N/A',
      inv.shipment?.shipment_no || 'N/A',
      inv.issue_date,
      inv.due_date,
      inv.total_amount,
      inv.status
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoices.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) return (
    <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
        <p>Loading Invoices...</p>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
     
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <BackArrow onClick={() => navigate(-1)} />
            <h2 className="text-xl font-semibold">Invoices</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="mr-2 h-4 w-4" /> New Invoice
            </Button>
          </div>
        </div>

        <Tabs value={filter} onValueChange={(value) => {
          setFilter(value as 'All' | 'Paid' | 'Pending' | 'Overdue');
          setCurrentPage(1);
        }}>
          <TabsList>
            <TabsTrigger value="All">All</TabsTrigger>
            <TabsTrigger value="Paid">Paid</TabsTrigger>
            <TabsTrigger value="Pending">Pending</TabsTrigger>
            <TabsTrigger value="Overdue">Overdue</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="border rounded-lg overflow-hidden mt-4">
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead>Invoice No</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Shipment</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((inv) => (
                  <TableRow key={inv.id ?? inv.invoice_no}>
                    <TableCell>{inv.invoice_no}</TableCell>
                    <TableCell>{inv.customer?.name || 'N/A'}</TableCell>
                    <TableCell>{inv.shipment?.shipment_no || 'N/A'}</TableCell>
                    <TableCell>{inv.issue_date}</TableCell>
                    <TableCell>{inv.due_date}</TableCell>
                    <TableCell>{inv.total_amount}</TableCell>
                    <TableCell>{getStatusBadge(inv.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 "
                        >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/invoice/${inv.id ?? inv.invoice_no}`)}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Pen className="mr-2 h-4 w-4" /> Edit Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={(e) => {
                              e.preventDefault(); 
                              e.stopPropagation(); 
                              handleDeleteClick(inv);
                            }}
                          >
                            <Trash className="mr-2 h-4 w-4" /> Delete Invoice
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                    No invoices found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-between items-center mt-4 text-sm">
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, count)} of {count} entries
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => prevPage && setCurrentPage(currentPage - 1)}
                  disabled={!prevPage}
                />
              </PaginationItem>
              {[...Array(Math.ceil(count / itemsPerPage))].map((_, i) => (
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
      

      <InvoiceModal 
        show={showModal} 
        onClose={() => setShowModal(false)} 
        onAdd={handleAddInvoice}
        customers={customers}
        shipments={shipments}
      />

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete invoice <strong>{selectedInvoice?.invoice_no}</strong>?
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoicePage;
