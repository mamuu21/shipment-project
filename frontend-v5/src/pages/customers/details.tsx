import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/utils/api';
import { getCurrentUser } from '@/utils/auth';
import BackArrow from '@/components/ui/backarrow';
import { ParcelPage } from '../parcels';
import InvoicePDFPage from './invoicepdfpage';
import InvoiceTablePage from '../invoices/invoicetablepage';
import ParcelTablePage from '../parcels/parceltablepage';


interface Customer {
  id?: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  parcels?: any[];
  shipments?: any[];

}

const CustomerDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    const fetchCustomer = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await api.get(`/customers/${id}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCustomer(res.data);
      } catch (error) {
        console.error('Failed to fetch customer:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
          <p>Loading customer details...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container py-4">
        <p className="text-center text-destructive">Customer not found.</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <BackArrow onClick={() => navigate(-1)} />
          <h2 className="text-xl font-semibold">Customer Details</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Customer Summary Card */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Customer Summary
              </CardTitle>
              <Button variant="ghost" size="sm">
                Edit
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="py-3">
                      <span className="text-muted-foreground">Name:</span>{' '}
                      <span className="font-medium">{customer.name}</span>
                    </TableCell>
                    
                  </TableRow>
                  <TableRow>
                    <TableCell className="py-3">
                      <span className="text-muted-foreground">Email:</span>{' '}
                      <span className="font-medium">{customer.email}</span>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="py-3">
                      <span className="text-muted-foreground">Phone:</span>{' '}
                      <span className="font-medium">{customer.phone}</span>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2} className="py-4">
                      <span className="text-muted-foreground">Address:</span>{' '}
                      <span className="font-medium">{customer.address}</span>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="py-3">
                      <span className="text-muted-foreground">Status:</span>{' '}
                      <span className="font-medium">{customer.status}</span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Status Updates Card */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Status Updates
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="flex justify-between mb-2 px-4">
                <span className="text-muted-foreground font-semibold">Status</span>
                <span className="text-muted-foreground font-semibold">Date</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="secondary" size="sm" className="w-full">
                Add Step
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="parcels">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="parcels">Parcels</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="gps">Live GPS</TabsTrigger>
        </TabsList>

        <TabsContent value="parcels" className="mt-4">
          <ParcelTablePage customerId={id} />
        </TabsContent>

        <TabsContent value="invoices" className="mt-4">
          <InvoiceTablePage customerId={id} />
        </TabsContent>
        
        <TabsContent value="gps" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-center text-muted-foreground py-8">Live GPS tracking would be rendered here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerDetails;
