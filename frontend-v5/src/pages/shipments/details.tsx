import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import api from '@/utils/api';
// import { getCurrentUser } from '@/utils/auth';
import BackArrow from '@/components/ui/backarrow';
import ShipmentMap from '@/components/ShipmentMap';

import { ParcelPage } from '../parcels/index'; 
import { CustomersPage } from '../customers/index';

interface StatusUpdate {
  status: string;
  date: string;
}

interface Shipment {
  shipment_no: string;
  origin: string;
  destination: string;
  transport: string;
  vessel: string;
  documents?: any[];
  weight: number;
  weight_unit: string;
  volume: number;
  volume_unit: string;
  percentage_fill?: number;
  status_updates?: StatusUpdate[];
  status: string;
  latitude: number | null;
  longitude: number | null;
}

const ShipmentDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  // const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // const user = getCurrentUser();
    // setCurrentUser(user);

    const fetchShipment = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await api.get(`/shipments/${id}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setShipment(res.data as Shipment);
      } catch (error) {
        console.error('Failed to fetch shipment:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShipment();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
          <p>Loading shipment details...</p>
        </div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="container py-4">
        <p className="text-center text-destructive">Shipment not found.</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <BackArrow onClick={() => navigate(-1)} />
          <h2 className="text-xl font-semibold">Shipment Details</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Shipment Summary Card */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Shipment Summary
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
                      <span className="text-muted-foreground">Shipment no:</span>{' '}
                      <span className="font-medium">{shipment.shipment_no}</span>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="text-muted-foreground">Admin Person:</span>{' '}
                      {/* <span className="font-medium">{currentUser?.username || 'N/A'}</span> */}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                      <TableCell colSpan={2} className="py-4">
                        <span className="text-muted-foreground">Address:</span>{' '}
                        <span className="font-medium">
                          {shipment.origin} → {shipment.destination}
                        </span>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={2} className="py-4">
                        <span className="text-muted-foreground">Shipping Details:</span>{' '}
                        <span className="font-medium">{shipment.transport}</span>
                        <span className="float-right">
                          <span className="text-muted-foreground">Vessel:</span>{' '}
                          <span className="font-medium">{shipment.vessel}</span>
                        </span>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={2} className="py-4">
                        <span className="text-muted-foreground">Documents:</span>{' '}
                        <span className="font-medium">
                          {shipment.documents?.length || 0} Uploaded
                        </span>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={2} className="py-4">
                        <span className="text-muted-foreground">Container Details:</span>{' '}
                        <span className="font-medium">
                          {shipment.weight} {shipment.weight_unit} || {shipment.volume} {shipment.volume_unit}
                        </span>
                        <span className="float-right">
                          <span className="text-muted-foreground">Percentage fill:</span>{' '}
                          <span className="font-medium">
                            {shipment.percentage_fill || 'N/A'}% filled
                          </span>
                        </span>
                      </TableCell>
                    </TableRow>
                  {/* Rest of the table rows... */}
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="parcels">Parcels</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="gps">Live GPS</TabsTrigger>
        </TabsList>
        
        <TabsContent value="parcels" className="mt-4">
          <ParcelPage shipmentId={shipment.shipment_no} />
        </TabsContent>
        
        <TabsContent value="customers" className="mt-4">
          <CustomersPage shipmentId={shipment.shipment_no} />
        </TabsContent>
        
        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-center text-muted-foreground py-8">Documents would be rendered here</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="gps" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">GPS Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <ShipmentMap
                latitude={shipment.latitude}
                longitude={shipment.longitude}
                shipmentNo={shipment.shipment_no}
                origin={shipment.origin}
                destination={shipment.destination}
                status={shipment.status}
                vessel={shipment.vessel}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShipmentDetails;