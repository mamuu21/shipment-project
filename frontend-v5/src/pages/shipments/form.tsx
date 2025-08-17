import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import api from '@/utils/api';

type ShipmentFormProps = {
  showCreateModal: boolean;
  setShowCreateModal: (show: boolean) => void;
  refreshShipments: () => void;
};

type FormData = {
  shipment_no: string;
  transport: string;
  vessel: string;
  status: string;
  weight: number | string;
  weight_unit: string;
  volume: number | string;
  volume_unit: string;
  origin: string;
  destination: string;
};

export const ShipmentForm = ({ showCreateModal, setShowCreateModal, refreshShipments }: ShipmentFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    shipment_no: '',
    transport: '',
    vessel: '',
    status: 'In-transit',
    weight: '',
    weight_unit: 'kg',
    volume: '',
    volume_unit: 'm³',
    origin: '',
    destination: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.shipment_no || !formData.transport || !formData.vessel || 
        !formData.origin || !formData.destination) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    await handleAddShipment();
  };

  const handleAddShipment = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await api.post('/shipments/', {
        ...formData,
        weight: Number(formData.weight),
        volume: Number(formData.volume)
      }, { headers });
      
      refreshShipments();
      setShowCreateModal(false);
      
      setFormData({ 
        shipment_no: '',
        transport: '',
        vessel: '',
        status: 'In-transit',
        weight: '',
        weight_unit: 'kg',
        volume: '',
        volume_unit: 'm³',
        origin: '',
        destination: ''
      });

      toast({
        title: 'Success',
        description: 'Shipment added successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add shipment',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
      <DialogContent className="max-h-[90vh] overflow-y-auto w-[600px] sm:w-[700px]">
        <DialogHeader>
          <DialogTitle>Add Shipment</DialogTitle>
        </DialogHeader>
    
          <div className="space-y-4">
            <div>
              <Label className="block text-sm font-medium mb-1">Shipment No</Label>
              <Input
                name="shipment_no"
                value={formData.shipment_no}
                onChange={(e) => setFormData({...formData, shipment_no: e.target.value})}
                placeholder="Enter shipment number"
              />
            </div>
            
            <div>
              <Label className="block text-sm font-medium mb-1">Transport Mode</Label>
              <Select
                value={formData.transport}
                onValueChange={(value) => setFormData({...formData, transport: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select transport mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Air">Air</SelectItem>
                  <SelectItem value="Sea">Sea</SelectItem>
                  <SelectItem value="Road">Road</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="block text-sm font-medium mb-1">Vessel</Label>
              <Input
                name="vessel"
                value={formData.vessel}
                onChange={(e) => setFormData({...formData, vessel: e.target.value})}
                placeholder="Enter vessel name"
              />
            </div>
            
            <div>
              <Label className="block text-sm font-medium mb-1">Origin</Label>
              <Input
                name="origin"
                value={formData.origin}
                onChange={(e) => setFormData({...formData, origin: e.target.value})}
                placeholder="Enter origin address"
              />
            </div>
            
            <div>
              <Label className="block text-sm font-medium mb-1">Destination</Label>
              <Input
                name="destination"
                value={formData.destination}
                onChange={(e) => setFormData({...formData, destination: e.target.value})}
                placeholder="Enter destination address"
              />
            </div>
            
            <div>
              <Label className="block text-sm font-medium mb-1">Weight</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  placeholder="Enter weight"
                  className="flex-1"
                />
                <Select
                  value={formData.weight_unit}
                  onValueChange={(value) => setFormData({...formData, weight_unit: value})}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="lbs">lbs</SelectItem>
                    <SelectItem value="tons">tons</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label className="block text-sm font-medium mb-1">Volume</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={formData.volume}
                  onChange={(e) => setFormData({...formData, volume: e.target.value})}
                  placeholder="Enter volume"
                  className="flex-1"
                />
                <Select
                  value={formData.volume_unit}
                  onValueChange={(value) => setFormData({...formData, volume_unit: value})}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="m³">m³</SelectItem>
                    <SelectItem value="ft³">ft³</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label className="block text-sm font-medium mb-1">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({...formData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In-transit">In-transit</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button 
              type="submit"
              onClick={handleSubmit}>
              Submit
            </Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};