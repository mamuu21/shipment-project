import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface Parcel {
  parcel_no: string;
  shipment: string;
  customer_id: string;   
  weight: number | '';  
  weight_unit: 'kg' | 'lbs' | 'tons';
  volume: number | '';
  volume_unit: 'm³' | 'ft³';
  charge: number | '';
  payment: 'Paid' | 'Unpaid';
  commodity_type: 'Box' | 'Parcel' | 'Envelope';
  description: string;
}

interface Shipment {
  shipment_no: string;
}

interface Customer {
  id: string;
  name: string;
}

interface ParcelFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (parcel: Parcel) => void;
  shipments: Shipment[];
  customers: Customer[];
  initialData?: Parcel;
  isSubmitting: boolean;
}

export const ParcelForm = ({
  open,
  onOpenChange,
  onSubmit,
  shipments,
  customers,
  initialData,
  isSubmitting
}: ParcelFormProps) => {
  const [formData, setFormData] = useState<Parcel>(initialData || {
    parcel_no: '',
    shipment: '',
    customer_id: '',
    weight: '',
    weight_unit: 'kg',
    volume: '',
    volume_unit: 'm³',
    charge: '',
    payment: 'Unpaid',
    commodity_type: 'Box',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'weight' || name === 'volume' || name === 'charge') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? '' : Number(value),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90vh] overflow-y-auto w-[600px] sm:w-[700px]">
      <DialogHeader>
        <DialogTitle>{initialData ? 'Edit Parcel' : 'Add New Parcel'}</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4">
        {/* Parcel Number */}
        <div>
          <label className="block text-sm font-medium mb-1">Parcel Number </label>
          <Input
            placeholder="Enter parcel number"
            name="parcel_no"
            value={formData.parcel_no}
            onChange={handleChange}
            required
          />
        </div>
        
        {/* Shipment Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">Shipment </label>
          <Select
            value={formData.shipment}
            onValueChange={(value) => handleSelectChange('shipment', value)}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select shipment" />
            </SelectTrigger>
            <SelectContent>
              {shipments.map((s) => (
                <SelectItem key={s.shipment_no} value={s.shipment_no}>
                  {s.shipment_no}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Customer Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">Customer </label>
          <Select
            value={formData.customer_id}
            onValueChange={(value) => handleSelectChange('customer_id', value)}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Weight Input */}
        <div>
          <label className="block text-sm font-medium mb-1">Weight </label>
          <div className="flex gap-3">
            <Input
              type="number"
              placeholder="Enter weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              required
            />
            <Select
              value={formData.weight_unit}
              onValueChange={(value) => handleSelectChange('weight_unit', value)}
            >
              <SelectTrigger className="w-24">
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

        {/* Volume Input */}
        <div>
          <label className="block text-sm font-medium mb-1">Volume </label>
          <div className="flex gap-3">
            <Input
              type="number"
              placeholder="Enter volume"
              name="volume"
              value={formData.volume}
              onChange={handleChange}
              required
            />
            <Select
              value={formData.volume_unit}
              onValueChange={(value) => handleSelectChange('volume_unit', value)}
            >
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="m³">m³</SelectItem>
                <SelectItem value="ft³">ft³</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Charge Input */}
        <div>
          <label className="block text-sm font-medium mb-1">Charge </label>
          <Input
            type="number"
            placeholder="Enter charge amount"
            name="charge"
            value={formData.charge}
            onChange={handleChange}
            required
          />
        </div>

        {/* Payment Status */}
        <div>
          <label className="block text-sm font-medium mb-1">Payment Status </label>
          <Select
            value={formData.payment}
            onValueChange={(value) => handleSelectChange('payment', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select payment status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Commodity Type */}
        <div>
          <label className="block text-sm font-medium mb-1">Commodity Type </label>
          <Select
            value={formData.commodity_type}
            onValueChange={(value) => handleSelectChange('commodity_type', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select commodity type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Box">Box</SelectItem>
              <SelectItem value="Parcel">Parcel</SelectItem>
              <SelectItem value="Envelope">Envelope</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <Textarea
            placeholder="Enter parcel description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
};