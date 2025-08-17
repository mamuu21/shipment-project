import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import api from '@/utils/api';
import { getCurrentUser } from '@/utils/auth';
import { cn } from '@/lib/utils';
import BackArrow from '@/components/ui/backarrow';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreHorizontal } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';


interface StatusUpdate {
  status: string;
  date: string;
}

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface Parcel {
  parcel_no: string;
  weight: number;
  weight_unit: string;
  volume: number;
  volume_unit: string;
  status: string;
  customer_id: string;
  customer_name?: string;
  charge?: string;
  commodity_type?: string;
  payment?: string;
  description: string;
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
}

const ShipmentDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newParcel, setNewParcel] = useState<Partial<Parcel>>({
    weight: '',
    volume: '',
    weight_unit: 'kg',
    volume_unit: 'm³',
    status: 'Pending',
    payment_status: 'Unpaid'
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    const fetchData = async () => {
      setLoading(true);

      try {
        const token = localStorage.getItem('access_token');
        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch shipment details
        const shipmentRes = await api.get(`/shipments/${id}/`, { headers });
        setShipment(shipmentRes.data);

        // Fetch related customers
        const customersRes = await api.get(`/shipments/${id}/customers/`, { headers });
        setCustomers(customersRes.data.results || []);

        // Fetch related parcels
        const parcelsRes = await api.get(`/parcels/?shipment=${id}`, { headers });
        setParcels(parcelsRes.data.results || []);

        const parcelsWithCustomerNames = parcelsRes.data.results.map((parcel: Parcel) => ({
          ...parcel,
          customer_name: customersRes.data.results.find((c: Customer) => c.id === parcel.customer_id)?.name
        }));
        setParcels(parcelsWithCustomerNames || []);

      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleCreateParcel = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      if (!newParcel.parcel_no) {
        const count = parcels.length + 1;
        newParcel.parcel_no = `PCL-${shipment?.shipment_no}-${count}`;
      }

      const response = await api.post('/parcels/', {
        ...newParcel,
        shipment_id: id,
      }, { headers });

      setParcels([...parcels, response.data]);
      setShowCreateModal(false);
      setNewParcel({
        weight: '',
        volume: '',
        weight_unit: 'kg',
        volume_unit: 'm³',
        status: 'Pending',
        charge: '',
        payment: 'Unpaid',
        commodity_type: 'Box',
        description: '',
      });
    } catch (error) {
      console.error('Failed to create parcel:', error);
    }
  };

  const getPaymentBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      'Paid': 'bg-green-100 text-green-800',
      'Unpaid': 'bg-yellow-100 text-yellow-800',
      'Partial': 'bg-blue-100 text-blue-800'
    };
    
    return (
      <Badge className={cn(statusColors[status] || 'bg-gray-100 text-gray-800')}>
        {status}
      </Badge>
    );
  };

  const filteredParcels = parcels.filter(parcel => 
    Object.values(parcel).some(
      val => val?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'In-transit': 'bg-blue-100 text-blue-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={cn(statusColors[status] || 'bg-gray-100 text-gray-800')}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
          <p>Loading shipment...</p>
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
                      <span className="font-medium">{currentUser?.username || 'N/A'}</span>
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

              <ul className="list-none relative pl-4 mb-4">
                {(shipment.status_updates || []).map((item, idx) => (
                  <li key={idx} className="mb-4 flex relative">
                    <div className="absolute left-0 top-2 w-2.5 h-2.5 bg-gray-400 rounded-full"></div>
                    <div className="flex justify-between w-full pl-4">
                      <div className="pr-3 flex-1 break-words">
                        <span className="font-medium">{item.status}</span>
                      </div>
                      <div className="text-muted-foreground whitespace-nowrap">
                        {item.date}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="secondary" size="sm" className="w-full">
                Add Step
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Related Data Tabs */}
      <Tabs defaultValue="parcels">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="parcels">Parcels ({parcels.length})</TabsTrigger>
          <TabsTrigger value="customers">Customers ({customers.length})</TabsTrigger>
          <TabsTrigger value="documents">Live GPS</TabsTrigger>
        </TabsList>
        
        <TabsContent value="parcels">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              {/* <CardTitle>Parcels in this Shipment</CardTitle> */}
              <div className="flex gap-2">
                <Input
                  placeholder="Search parcels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[200px]"
                />
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Parcel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parcel No</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Volume</TableHead>
                    <TableHead>Charge</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Commodity type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParcels.length > 0 ? (
                    filteredParcels.map((parcel) => (
                      <TableRow key={parcel.parcel_no}>
                        <TableCell>{parcel.parcel_no}</TableCell>
                        <TableCell>
                          {customers.find(c => c.id === parcel.customer_id)?.name || 'N/A'}
                        </TableCell>
                        <TableCell>{parcel.weight} {parcel.weight_unit}</TableCell>
                        <TableCell>{parcel.volume} {parcel.volume_unit}</TableCell> 
                        <TableCell>{parcel.charge || 'N/A'}</TableCell>
                        <TableCell>{getPaymentBadge(parcel.payment || 'Unpaid')}</TableCell>
                        <TableCell>{getStatusBadge(parcel.status)}</TableCell>
                        <TableCell>{parcel.commodity_type || 'N/A'}</TableCell>
                        <TableCell>{parcel.description || 'N/A'}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View</DropdownMenuItem>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-4 text-muted-foreground">
                        {searchQuery ? 'No matching parcels found' : 'No parcels found for this shipment'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="customers">
          <Card>
            <CardHeader>
              {/* <CardTitle>Customers in this Shipment</CardTitle> */}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Parcels</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.length > 0 ? (
                    customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>{customer.name}</TableCell>
                        <TableCell>{customer.email || 'N/A'}</TableCell>
                        <TableCell>{customer.phone || 'N/A'}</TableCell>
                        <TableCell>
                          {parcels
                          .filter(p => p.customer_id === customer.id)
                          .map(p => p.parcel_no)
                          .join(', ')}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">View</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        No customers found for this shipment
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              {/* <CardTitle>Live GPS Tracking</CardTitle> */}
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">No Live GPS uploaded</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Parcel Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-h-[90vh] overflow-y-auto w-[600px] sm:w-[700px]">
          <DialogHeader>
            <DialogTitle>Add New Parcel</DialogTitle>
            <DialogDescription>
              Fill in the details for the new parcel in this shipment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="parcel_no" className="text-right">
                Parcel No
              </Label>
              <Input
                id="parcel_no"
                value={newParcel.parcel_no || ''}
                onChange={(e) => setNewParcel({...newParcel, parcel_no: e.target.value})}
                placeholder="Leave blank to auto-generate"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customer" className="text-right">
                Customer
              </Label>
              <Select
                value={newParcel.customer_id || ''}
                onValueChange={(value) => setNewParcel({...newParcel, customer_id: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select customer" />
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
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="weight" className="text-right">
                Weight
              </Label>
              <div className="flex col-span-3 gap-2">
                <Input
                  id="weight"
                  type="number"
                  value={newParcel.weight}
                  onChange={(e) => setNewParcel({...newParcel, weight: parseFloat(e.target.value)})}
                />
                <Select
                  value={newParcel.weight_unit || 'kg'}
                  onValueChange={(value) => setNewParcel({...newParcel, weight_unit: value})}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="lbs">lbs</SelectItem>
                    <SelectItem value="tons">tons</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="volume" className="text-right">
                Volume
              </Label>
              <div className="flex col-span-3 gap-2">
                <Input
                  id="volume"
                  type="number"
                  value={newParcel.volume || 0}
                  onChange={(e) => setNewParcel({...newParcel, volume: parseFloat(e.target.value)})}
                />
                <Select
                  value={newParcel.volume_unit || 'm³'}
                  onValueChange={(value) => setNewParcel({...newParcel, volume_unit: value})}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="m³">m³</SelectItem>
                    <SelectItem value="ft³">ft³</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="commodity" className="text-right">
                Commodity
              </Label>
              <Input
                id="commodity"
                value={newParcel.commodity || ''}
                onChange={(e) => setNewParcel({...newParcel, commodity: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="charge" className="text-right">
                Charge
              </Label>
              <Input
                id="charge"
                type="number"
                value={newParcel.charge || ''}
                onChange={(e) => setNewParcel({...newParcel, charge: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="payment_status" className="text-right">
                Payment Status
              </Label>
              <Select
                value={newParcel.payment_status || 'Unpaid'}
                onValueChange={(value) => setNewParcel({...newParcel, payment_status: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                  <SelectItem value="Partial">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={newParcel.status || 'Pending'}
                onValueChange={(value) => setNewParcel({...newParcel, status: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In-transit">In Transit</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateParcel}>Add Parcel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShipmentDetails;