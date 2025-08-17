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

type Customer = {
  id: string;
  name: string;
};

type Shipment = {
  shipment_no: string;
};

type Invoice = {
  id?: string;
  invoice_no: string;
  customer_id: string;
  customer?: { name?: string };
  shipment?: {
    shipment_no: string;
  } | null;
  total_amount: number;
  issue_date: string;
  due_date: string;
  status: 'Paid' | 'Pending' | 'Overdue';
};

interface InvoiceModalProps {
  show: boolean;
  onClose: () => void;
  onAdd: (invoice: Invoice) => void;
  customers: Customer[];
  shipments: Shipment[];
}

export const InvoiceModal = ({
  show,
  onClose,
  onAdd,
  customers = [],
  shipments = []
}: InvoiceModalProps) => {
  const [formData, setFormData] = useState({
    invoice_no: "",
    customer_id: "",
    shipment: "",
    total_amount: "",
    issue_date: undefined as Date | undefined,
    due_date: undefined as Date | undefined,
    status: "Pending" as "Paid" | "Pending" | "Overdue"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "total_amount" ? (value === "" ? "" : parseFloat(value)) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("access_token");

      const payload = {
        invoice_no: formData.invoice_no,
        customer: formData.customer_id,
        issue_date: formData.issue_date ? format(formData.issue_date, "yyyy-MM-dd") : "",
        due_date: formData.due_date ? format(formData.due_date, "yyyy-MM-dd") : "",
        shipment: formData.shipment ? { shipment_no: formData.shipment } : null,
        total_amount: typeof formData.total_amount === "string" && formData.total_amount === "" ? 0 : Number(formData.total_amount),
        status: formData.status
      };

      const response = await api.post("/invoices/", payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });

      onAdd({
        ...response.data,
        customer: customers.find(c => c.id === formData.customer_id)
      });
      onClose();
    } catch (error) {
      console.error("Error adding invoice:", error);
    }
  };

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto w-[600px] sm:w-[700px]">
        <DialogHeader>
          <DialogTitle>Add Invoice</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Invoice Number</label>
            <Input name="invoice_no" value={formData.invoice_no} onChange={handleChange} required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Customer</label>
            <Select
                value={formData.customer_id}
                onValueChange={(value) => setFormData(prev => ({
                ...prev,
                customer: value
                }))}
            >
                <SelectTrigger>
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

          <div>
            <label className="block text-sm font-medium mb-1">Shipment</label>
            <Select
              value={formData.shipment}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, shipment: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Shipment" />
              </SelectTrigger>
              <SelectContent>
                {shipments.map((ship) => (
                  <SelectItem key={ship.shipment_no} value={ship.shipment_no}>
                    {ship.shipment_no}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Total Amount</label>
            <Input
              type="number"
              name="total_amount"
              value={formData.total_amount}
              onChange={handleChange}
              required
            />
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
                    onSelect={(date) => setFormData((prev) => ({ ...prev, issue_date: date }))}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
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
                    onSelect={(date) => setFormData((prev) => ({ ...prev, due_date: date }))}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, status: value as "Paid" | "Pending" | "Overdue" }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};