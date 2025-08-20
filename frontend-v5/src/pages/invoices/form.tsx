import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from '@/components/ui/button';
import api from '@/utils/api';
import { toast } from '@/hooks/use-toast';

type Customer = {
  id: string;
  name: string;
};



type Invoice = {
  invoice_no: string;
  customer_id: string;
  customer?: { name: string };
  issue_date: string;
  due_date: string;
  total_amount: number;
  tax: number;
  final_amount: number;
  status: 'Pending' | 'Paid' | 'Overdue';
};

interface InvoiceModalProps {
  show: boolean;
  onClose: () => void;
  onAdd: (invoice: Invoice) => void;
  customers: Customer[];
}

export const InvoiceModal = ({
  show,
  onClose,
  onAdd,
  customers = []
}: InvoiceModalProps) => {
  const [formData, setFormData] = useState({
    invoice_no: "",
    customer_id: "",
    issue_date: undefined as Date | undefined,
    due_date: undefined as Date | undefined,
    tax: 0,
    status: "Pending" as "Pending" | "Paid" | "Overdue",
    // Note: total_amount and final_amount will be calculated automatically
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "tax" ? (value === "" ? 0 : parseFloat(value)) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("access_token");
     

      // Prepare payload according to your backend model
      const payload = {
        invoice_no: formData.invoice_no,
        customer_id: formData.customer_id,
        issue_date: formData.issue_date ? format(formData.issue_date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
        due_date: formData.due_date ? format(formData.due_date, "yyyy-MM-dd") : "",
        tax: formData.tax,
        status: formData.status,
        // total_amount and final_amount will be calculated by backend
      };

      const response = await api.post("/invoices/", payload, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      onAdd({
        ...(response.data as Invoice),
        customer: customers.find(c => c.id === formData.customer_id)
      });

      toast({
        title: 'Success',
        description: 'Invoice created successfully',
      });

      setFormData({
        invoice_no: "",
        customer_id: "",
        issue_date: undefined,
        due_date: undefined,
        tax: 0,
        status: "Pending",
      });
      
      onClose();
    } catch (error: any) {
      console.error("Error creating invoice:", error);
      toast({
        title: 'Error',
        description: error?.response?.data?.detail || 'Failed to create invoice',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };


  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto w-[600px] sm:w-[700px]">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Invoice Number</label>
            <Input 
              name="invoice_no" 
              value={formData.invoice_no} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Customer</label>
            <Select
              value={formData.customer_id}
              onValueChange={(value) => handleSelectChange('customer_id', value)}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id.toString()}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Issue Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.issue_date ? format(formData.issue_date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0">
                  <Calendar
                    mode="single"
                    selected={formData.issue_date}
                    onSelect={(date) => setFormData(prev => ({ ...prev, issue_date: date }))}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Due Date *</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.due_date ? format(formData.due_date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0">
                  <Calendar
                    mode="single"
                    selected={formData.due_date}
                    onSelect={(date) => setFormData(prev => ({ ...prev, due_date: date }))}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tax (TZS)</label>
            <Input
              type="number"
              name="tax"
              value={formData.tax}
              onChange={handleChange}
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleSelectChange('status', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Invoice'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};