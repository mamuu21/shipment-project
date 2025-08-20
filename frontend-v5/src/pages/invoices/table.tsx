import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Eye, Pen, Trash, MoreHorizontal } from 'lucide-react';

type Invoice = {
  id?: string;
  invoice_no: string;
  customer?: { name: string };
  total_amount: number;
  issue_date: string;
  due_date: string;
  status: 'Paid' | 'Pending' | 'Overdue';
};

interface InvoiceTableProps {
  invoices: Invoice[];
  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
}

const getStatusBadge = (status: string) => (
  <span className={`px-2 py-1 rounded-full text-xs ${
    status === 'Paid' ? 'bg-green-100 text-green-800' :
    status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
    'bg-red-100 text-red-800'
  }`}>
    {status}
  </span>
);

export const InvoiceTable = ({ invoices, onView, onEdit, onDelete }: InvoiceTableProps) => {
  return (
    <Table>
      <TableHeader className="bg-gray-100">
        <TableRow>
          <TableHead>Invoice No</TableHead>
          <TableHead>Customer</TableHead>
          {/* <TableHead>Shipment</TableHead> */}
          <TableHead>Issue Date</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.length > 0 ? (
          invoices.map((inv) => (
            <TableRow key={inv.id ?? inv.invoice_no}>
              <TableCell>{inv.invoice_no}</TableCell>
              <TableCell>{inv.customer?.name}</TableCell>
              <TableCell>{inv.issue_date}</TableCell>
              <TableCell>{inv.due_date}</TableCell>
              <TableCell>{inv.total_amount}</TableCell>
              <TableCell>{getStatusBadge(inv.status)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(inv)}>
                      <Eye className="mr-2 h-4 w-4" /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(inv)}>
                      <Pen className="mr-2 h-4 w-4" /> Edit Invoice
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={(e) => {
                        e.preventDefault(); 
                        e.stopPropagation(); 
                        onDelete(inv);
                      }}
                    >
                      <Trash className="mr-2 h-4 w-4" /> Delete Invoice
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-4 text-gray-500">
              No invoices found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};