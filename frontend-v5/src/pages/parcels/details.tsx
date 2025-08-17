import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/utils/api';
import { getCurrentUser } from '@/utils/auth';
import BackArrow from '@/components/ui/backarrow';

interface Parcel {
  parcel_no: string;
  shipment_vessel: string;
  customer_name: string;
  weight: number;
  weight_unit: string;
  volume: number;
  volume_unit: string;
  charge: number;
  payment: string;
  commodity_type: string;
  description?: string;
  shipment_status: string;  // add if your API supports parcel status
  documents?: any[];
}

const ParcelDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    const fetchParcel = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await api.get(`/parcels/${id}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setParcel(res.data);
      } catch (error) {
        console.error('Failed to fetch parcel:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchParcel();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
          <p>Loading parcel details...</p>
        </div>
      </div>
    );
  }

  if (!parcel) {
    return (
      <div className="container py-4">
        <p className="text-center text-destructive">Parcel not found.</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <BackArrow onClick={() => navigate(-1)} />
          <h2 className="text-xl font-semibold">Parcel Details</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Customer Summary Card */}
        <div className="md:col-span-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    Parcel Summary
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate(`/parcels/edit/${id}`)}>
                    Edit
                </Button>
                </CardHeader>

                <CardContent className="p-0">
                <Table>
                    <TableBody>
                    <TableRow>
                        <TableCell className="py-3">
                            <span className="text-muted-foreground">Parcel no:</span>{' '}
                            <span className="font-medium">{parcel.parcel_no}</span>
                        </TableCell>
                        <TableCell className="py-3">
                            <span className="text-muted-foreground">Shipment name:</span>{' '}
                            <span className="font-medium">{parcel.shipment_vessel}</span>
                        </TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell className="py-3">
                            <span className="text-muted-foreground">Customer:</span>{' '}
                            <span className="font-medium">{parcel.customer_name}</span>
                        </TableCell>
                        <TableCell className="py-3">
                            <span className="text-muted-foreground">Commodity Type:</span>{' '}
                            <span className="font-medium">{parcel.commodity_type}</span>
                        </TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell className="py-3">
                            <span className="text-muted-foreground">Weight:</span>{' '}
                            <span className="font-medium">{parcel.weight} {parcel.weight_unit}</span>
                        </TableCell>
                        <TableCell className="py-3">
                            <span className="text-muted-foreground">Volume:</span>{' '}
                            <span className="font-medium">{parcel.volume} {parcel.volume_unit}</span>
                        </TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell className="py-3">
                            <span className="text-muted-foreground">Charge:</span>{' '}
                            <span className="font-medium">{parcel.charge}</span>
                        </TableCell>
                        <TableCell className="py-3">
                            <span className="text-muted-foreground">Payment Status:</span>{' '}
                            <Badge variant={parcel.payment === 'Paid' ? 'success' : 'destructive'}>
                                {parcel.payment}
                            </Badge>
                        </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell colSpan={2} className="py-3">
                        <span className="text-muted-foreground">Status:</span>{' '}
                        <span className="font-medium">{parcel.shipment_status}</span>
                      </TableCell>
                    </TableRow>

                    {parcel.description && (
                        <TableRow>
                            <TableCell colSpan={2} className="py-3">
                                <span className="text-muted-foreground">Description:</span>{' '}
                                <span className="font-medium">{parcel.description}</span>
                            </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </div>

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
      


      {/* You can add tabs like shipment page if you want related docs, tracking etc. */}
      <Tabs defaultValue="documents" className="mt-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-center text-muted-foreground py-8">Parcel documents will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-center text-muted-foreground py-8">Parcel tracking info will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-center text-muted-foreground py-8">Parcel history will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-center text-muted-foreground py-8">Notes related to the parcel.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ParcelDetails;
