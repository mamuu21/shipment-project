'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BackArrow from '@/components/ui/backarrow';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Download } from 'lucide-react';
import api from '@/utils/api';
import { InvoiceTable } from './table';
import { InvoiceModal } from './form';
import { DeleteInvoiceModal } from './delete';

type Invoice = {
  id?: string;
  invoice_no: string;
  customer?: { name: string };
  shipment?: { vessel: string;} ;
  total_amount: number;
  issue_date: string;
  due_date: string;
  status: 'Paid' | 'Pending' | 'Overdue';
};

type Customer = {
  id: string;
  name: string;
};

type Shipment = {
  shipment_no: string;
};

interface InvoicePageProps {
  customerId?: string; 
}

const InvoicePage = ({customerId}: InvoicePageProps) => {
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
  const [error, setError] = useState<string | null>(null);
  
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchInvoices = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("access_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Build URL with query parameters
        const url = new URL('/invoices/', 'http://127.0.0.1:8000/api');
        url.searchParams.set('page', currentPage.toString());
        
        // Add customer filter if customerId is provided
        if (customerId) {
          url.searchParams.set('customer_id', customerId);
        }

        const response = await api.get(url.pathname + url.search, { headers });
        const data = response.data;

        setInvoices(Array.isArray(data) ? data : data?.results || []);
        setCount(data?.count || 0);
        setNextPage(data?.next || null);
        setPrevPage(data?.previous || null);
      } catch (err: any) {
        console.error('Failed to fetch invoices:', err);
        toast({
          title: 'Error',
          description: err?.response?.data?.detail || 'Failed to load invoices',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, [customerId, currentPage, toast]);

  
  useEffect(() => {
    if (customerId) return;

    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await api.get('/customers/', { headers });
        setCustomers(response.data.results || []);
      } catch (err) {
        console.error('Failed to fetch customers:', err);
        toast({
          title: 'Error',
          description: 'Failed to load customers',
          variant: 'destructive',
        });
      }
    };
    fetchCustomers();
  }, [customerId, toast]);

 
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
          description: 'Failed to load shipments',
          variant: 'destructive',
        });
      }
    };
    fetchShipments();
  }, [toast]);

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
        <InvoiceTable
          invoices={filteredData}
          onView={(invoice) => navigate(`/invoice/${invoice.id ?? invoice.invoice_no}`)}
          onEdit={(invoice) => console.log('Edit', invoice)}
          onDelete={handleDeleteClick}
        />
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

      <DeleteInvoiceModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        invoice={selectedInvoice}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export const CustomerInvoices = ({ customerId }: { customerId: string }) => {
  return <InvoicePage customerId={customerId} />;
};

export default InvoicePage;