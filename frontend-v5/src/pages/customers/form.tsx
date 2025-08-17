import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import api from '@/utils/api';

interface Customer {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'Active' | 'Dormant';
}

interface CustomerFormProps {
  showCreateModal: boolean;
  setShowCreateModal: (show: boolean) => void;
  refreshCustomers: () => void;
  initialData?: Customer;
}

export const CustomerForm = ({ 
  showCreateModal, 
  setShowCreateModal, 
  refreshCustomers,
  initialData 
}: CustomerFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Omit<Customer, 'id'>>(
    initialData || {
      name: '',
      email: '',
      phone: '',
      address: '',
      status: 'Active'
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    await handleAddCustomer();
  };

  const handleAddCustomer = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      if (initialData?.id) {
        await api.put(`/customers/${initialData.id}/`, formData, { headers });
        toast({
          title: 'Success',
          description: 'Customer updated successfully',
        });
      } else {
        await api.post('/customers/', formData, { headers });
        toast({
          title: 'Success',
          description: 'Customer added successfully',
        });
      }
      
      refreshCustomers();
      setShowCreateModal(false);
      
      if (!initialData?.id) {
        setFormData({ 
          name: '',
          email: '',
          phone: '',
          address: '',
          status: 'Active'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save customer',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
      <DialogContent className="max-h-[90vh] overflow-y-auto w-[600px] sm:w-[700px]">
        <DialogHeader>
          <DialogTitle>{initialData?.id ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
        </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter customer name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Enter customer email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="Enter phone number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <Input
                name="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Enter customer address"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({...formData, status: value as 'Active' | 'Dormant'})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Dormant">Dormant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              onClick={handleSubmit}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};