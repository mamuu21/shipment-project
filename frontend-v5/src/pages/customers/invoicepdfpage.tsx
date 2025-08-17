import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import api from '@/utils/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InvoiceItem {
  id: number;
  parcel_no: string;
  commodity_type: string;
  description: string;
  parcel_charge: number;
  cost: string;
}

interface Invoice {
  id: number;
  invoice_no: string;
  issue_date: string;
  due_date: string;
  total_amount: string;
  tax: string;
  final_amount: string;
  status: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: InvoiceItem[];
}

interface Props {
  customerId: string;
}

const InvoicePDFPage = ({ customerId }: Props) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await api.get(`/invoices/?customer=${customerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        let data = res.data;
        if (data?.results) data = data.results;
        if (!Array.isArray(data)) data = [data];

        setInvoices(data);
        if (data.length > 0) setSelectedInvoice(data[0]);
      } catch (e) {
        console.error('Failed to fetch invoices:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [customerId]);

  const generatePDF = () => {
    if (!selectedInvoice) return;

    const doc = new jsPDF();
    doc.setFont('helvetica', 'normal');

    // Header
    doc.setFontSize(22);
    doc.text('INVOICE', 190, 20, { align: 'right' });
    doc.setLineWidth(0.5);
    doc.line(14, 25, 100, 25);

    // Issued to (left)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('ISSUED TO:', 14, 40);
    doc.setFont('helvetica', 'normal');
    doc.text(selectedInvoice.customer.name || '', 14, 46);
    doc.text(selectedInvoice.customer.email || '', 14, 52);
    doc.text(selectedInvoice.customer.phone || '', 14, 58);
    doc.text(selectedInvoice.customer.address || '', 14, 64);

    // Invoice info (right)
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE NO:', 140, 40);
    doc.setFont('helvetica', 'normal');
    doc.text(selectedInvoice.invoice_no || '', 190, 40, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.text('DATE:', 140, 46);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(selectedInvoice.issue_date).toLocaleDateString(), 190, 46, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.text('DUE DATE:', 140, 52);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(selectedInvoice.due_date).toLocaleDateString(), 190, 52, { align: 'right' });

    // Pay To
    doc.setFont('helvetica', 'bold');
    doc.text('PAY TO:', 14, 80);
    doc.setFont('helvetica', 'normal');
    doc.text('Borcele Bank', 14, 86);
    doc.text('Account Name: Your Company', 14, 92);
    doc.text('Account No.: 0123 4567 8901', 14, 98);

    // Table
    const tableRows = selectedInvoice.items.map((item) => [
        item.commodity_type || '-', 
        item.description,
        item.parcel_charge.toFixed(2),
        '1',
        `TZS ${item.cost}`,
    ]);

    autoTable(doc, {
        startY: 110,
        head: [['COMMODITY TYPE', 'DESCRIPTION', 'UNIT PRICE', 'QTY', 'TOTAL']],
        body: tableRows,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fontStyle: 'bold' },
        tableLineWidth: 0.2,
        tableLineColor: [0, 0, 0],
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // Totals
    doc.setFont('helvetica', 'bold');
    doc.text('SUBTOTAL', 14, finalY);
    doc.text(`TZS ${selectedInvoice.total_amount}`, 190, finalY, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.text('Tax', 14, finalY + 6);
    doc.text(selectedInvoice.tax, 190, finalY + 6, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL', 14, finalY + 12);
    doc.text(`TZS ${selectedInvoice.final_amount}`, 190, finalY + 12, { align: 'right' });

    // Signature
    doc.setFontSize(12);
    doc.text('________________________', 190, finalY + 30, { align: 'right' });
    doc.setFontSize(10);
    doc.text('Authorized Signature', 190, finalY + 36, { align: 'right' });

    doc.save(`Invoice-${selectedInvoice.invoice_no}.pdf`);
};


  if (loading) return <p>Loading invoices...</p>;
  if (invoices.length === 0) return <p className="text-destructive">No invoices found.</p>;

  return (
    <div className="container py-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Invoice Details</h2>
        <Button onClick={generatePDF} disabled={!selectedInvoice}>
          Generate PDF
        </Button>
      </div>

      {/* Select Invoice */}
      <div className="mb-4">
        <select
          className="border rounded px-3 py-2"
          value={selectedInvoice?.id || ''}
          onChange={(e) => {
            const inv = invoices.find((i) => i.id === Number(e.target.value));
            setSelectedInvoice(inv || null);
          }}
        >
          {invoices.map((inv) => (
            <option key={inv.id} value={inv.id}>
              {inv.invoice_no} - {new Date(inv.issue_date).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

      {selectedInvoice && (
        <>
          {/* Invoice Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Invoice Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Invoice No:</TableCell>
                      <TableCell className="font-medium">{selectedInvoice.invoice_no}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Issue Date:</TableCell>
                      <TableCell className="font-medium">
                        {new Date(selectedInvoice.issue_date).toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Due Date:</TableCell>
                      <TableCell className="font-medium">
                        {new Date(selectedInvoice.due_date).toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total Amount:</TableCell>
                      <TableCell className="font-medium">{selectedInvoice.total_amount}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Tax:</TableCell>
                      <TableCell className="font-medium">{selectedInvoice.tax}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Final Amount:</TableCell>
                      <TableCell className="font-medium">{selectedInvoice.final_amount}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Status:</TableCell>
                      <TableCell className="font-medium">{selectedInvoice.status}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Customer Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Customer Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Name:</TableCell>
                      <TableCell className="font-medium">{selectedInvoice.customer.name}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Email:</TableCell>
                      <TableCell className="font-medium">{selectedInvoice.customer.email}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Phone:</TableCell>
                      <TableCell className="font-medium">{selectedInvoice.customer.phone}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Address:</TableCell>
                      <TableCell className="font-medium">{selectedInvoice.customer.address}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Invoice Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <thead>
                  <TableRow>
                    <TableCell className="font-semibold">Parcel No</TableCell>
                    <TableCell className="font-semibold">Commodity Type</TableCell>
                    <TableCell className="font-semibold">Description</TableCell>
                    <TableCell className="font-semibold">Parcel Charge</TableCell>
                    <TableCell className="font-semibold">Cost</TableCell>
                  </TableRow>
                </thead>
                <TableBody>
                  {selectedInvoice.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.parcel_no}</TableCell>
                      <TableCell>{item.commodity_type}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.parcel_charge}</TableCell>
                      <TableCell>{item.cost}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default InvoicePDFPage;
