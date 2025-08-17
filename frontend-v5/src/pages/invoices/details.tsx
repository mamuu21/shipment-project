import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow, TableHeader } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/utils/api';
import { getCurrentUser } from '@/utils/auth';
import BackArrow from '@/components/ui/backarrow';

interface InvoiceItem {
  id: number;
  parcel_no: string;
  commodity_type: string;
  description?: string;
  parcel_charge: number;
  cost: string;
}

interface Invoice {
  invoice_no: string;
  customer: {
    id: number;
    name: string;
    email: string;
    address: string;
    phone: string;
    status: string;
    total_invoices_paid: number;
    total_parcels: number;
    total_parcel_weight: number;
    total_shipments: number;
    shipment_nos: string[];
  };
  issue_date: string;
  due_date: string;
  total_amount: string;
  tax: string;
  final_amount: string;
  status: string;
  items: InvoiceItem[];
}

const InvoiceDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    const fetchInvoice = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await api.get(`/invoices/${id}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInvoice(res.data);
      } catch (error) {
        console.error('Failed to fetch invoice:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
          <p>Loading invoice details...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container py-4">
        <p className="text-center text-destructive">Invoice not found.</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <BackArrow onClick={() => navigate(-1)} />
          <h2 className="text-xl font-semibold">Invoice Details</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
  {/* Invoice Summary Card */}
  <div>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Invoice Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="py-3">Invoice No:</TableCell>
              <TableCell className="py-3 font-medium">{invoice.invoice_no}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-3">Issue Date:</TableCell>
              <TableCell className="py-3 font-medium">{new Date(invoice.issue_date).toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-3">Due Date:</TableCell>
              <TableCell className="py-3 font-medium">{new Date(invoice.due_date).toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-3">Total Amount:</TableCell>
              <TableCell className="py-3 font-medium">{invoice.total_amount}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-3">Tax:</TableCell>
              <TableCell className="py-3 font-medium">{invoice.tax}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-3">Final Amount:</TableCell>
              <TableCell className="py-3 font-medium">{invoice.final_amount}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-3">Status:</TableCell>
              <TableCell className="py-3 font-medium">{invoice.status}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>

  {/* Customer Summary Card */}
  <div>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Customer Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="py-3">Customer Name:</TableCell>
              <TableCell className="py-3 font-medium">{invoice.customer.name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-3">Email:</TableCell>
              <TableCell className="py-3 font-medium">{invoice.customer.email}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-3">Phone:</TableCell>
              <TableCell className="py-3 font-medium">{invoice.customer.phone}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-3">Address:</TableCell>
              <TableCell className="py-3 font-medium">{invoice.customer.address}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-3">Status:</TableCell>
              <TableCell className="py-3 font-medium">{invoice.customer.status}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-3">Total Parcels:</TableCell>
              <TableCell className="py-3 font-medium">{invoice.customer.total_parcels}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-3">Total Shipments:</TableCell>
              <TableCell className="py-3 font-medium">{invoice.customer.total_shipments}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-3">Shipments:</TableCell>
              <TableCell className="py-3 font-medium">
                {invoice.customer.shipment_nos.join(', ')}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</div>



      {/* Invoice Items Table */}
      <Tabs defaultValue="items" className="mt-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="items">Invoice Items</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="mt-4">
          <Card>
            <CardContent className="p-4">
              {invoice.items.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No items found.</p>
              ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableCell className="font-semibold">Parcel No</TableCell>
                        <TableCell className="font-semibold">Commodity Type</TableCell>
                        <TableCell className="font-semibold">Description</TableCell>
                        <TableCell className="font-semibold">Parcel Charge</TableCell>
                        <TableCell className="font-semibold">Cost</TableCell>
                        </TableRow>
                    </TableHeader>
                  <TableBody>
                    {invoice.items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.parcel_no}</TableCell>
                        <TableCell>{item.commodity_type}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.parcel_charge}</TableCell>
                        <TableCell>{item.cost}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-center text-muted-foreground py-8">Invoice history will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-center text-muted-foreground py-8">Notes related to this invoice.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvoiceDetails;
