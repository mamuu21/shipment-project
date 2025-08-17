'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import api from '@/utils/api';
import { InvoiceTable } from './table';
import { Download } from 'lucide-react';
import { generateInvoicePDF } from '@/utils/generateInvoicePDF'; 

type Invoice = {
  id?: string;
  invoice_no: string;
  customer?: { name: string };
  total_amount: number;
  issue_date: string;
  due_date: string;
  status: 'Paid' | 'Pending' | 'Overdue';
};

export const InvoiceTablePage = ({ customerId }: { customerId: string }) => {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filter, setFilter] = useState<'All' | 'Paid' | 'Pending' | 'Overdue'>('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const url = new URL('/invoices/', 'http://127.0.0.1:8000/api');
        if (customerId) url.searchParams.set('customer_id', customerId);

        const res = await api.get(url.pathname + url.search, { headers });
        setInvoices(res.data.results || []);
      } catch (err: any) {
        console.error(err);
        toast({
          title: 'Error',
          description: 'Failed to load invoices',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvoices();
  }, [customerId, toast]);

  const filteredInvoices = invoices.filter(inv =>
    filter === 'All' ? true : inv.status === filter
  );

  if (isLoading) return <p>Loading invoices...</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <Tabs value={filter} onValueChange={(val) => setFilter(val as any)}>
        <TabsList>
          <TabsTrigger value="All">All</TabsTrigger>
          <TabsTrigger value="Paid">Paid</TabsTrigger>
          <TabsTrigger value="Pending">Pending</TabsTrigger>
          <TabsTrigger value="Overdue">Overdue</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="border rounded-lg overflow-hidden mt-4">
        <InvoiceTable
          invoices={filteredInvoices}
          onView={(inv) => console.log('view', inv)}
          onEdit={(inv) => console.log('edit', inv)}
          onDelete={(inv) => console.log('delete', inv)}
        />
      </div>

      <div className="flex justify-end mt-4">
        <Button
          onClick={() => {
            if (filteredInvoices.length > 0) {
              generateInvoicePDF(filteredInvoices[0]); // Generate PDF for first invoice
            } else {
              toast({
                title: 'No invoices',
                description: 'There are no invoices to generate a PDF for.',
                variant: 'destructive',
              });
            }
          }}
        >
          <Download className="mr-2 h-4 w-4" /> Generate PDF
        </Button>
      </div>
    </div>
  );
};

export default InvoiceTablePage;
