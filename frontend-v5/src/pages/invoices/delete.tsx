import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type Invoice = {
  id?: string;
  invoice_no: string;
};

interface DeleteInvoiceModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  invoice: Invoice | null;
  isDeleting: boolean;
}

export const DeleteInvoiceModal = ({ 
  show, 
  onClose, 
  onConfirm, 
  invoice, 
  isDeleting 
}: DeleteInvoiceModalProps) => {
  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to delete invoice <strong>{invoice?.invoice_no}</strong>?
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};