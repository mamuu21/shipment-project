import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface InvoiceItem {
  id: number;
  parcel_no: string;
  commodity_type: string;
  description: string;
  parcel_charge: number;
  cost: string;
}

export interface Invoice {
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

export const generateInvoicePDF = (invoice: Invoice) => {
  if (!invoice) return;

  const doc = new jsPDF();
  doc.setFont('helvetica', 'normal');

  // Header
  doc.setFontSize(22);
  doc.text('INVOICE', 190, 20, { align: 'right' });
  doc.setLineWidth(0.5);
  doc.line(14, 25, 100, 25);

  // Issued to
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('ISSUED TO:', 14, 40);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.customer.name || '', 14, 46);
  doc.text(invoice.customer.email || '', 14, 52);
  doc.text(invoice.customer.phone || '', 14, 58);
  doc.text(invoice.customer.address || '', 14, 64);

  // Invoice info
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE NO:', 140, 40);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.invoice_no || '', 190, 40, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.text('DATE:', 140, 46);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(invoice.issue_date).toLocaleDateString(), 190, 46, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.text('DUE DATE:', 140, 52);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(invoice.due_date).toLocaleDateString(), 190, 52, { align: 'right' });

  // Table
  const tableRows = invoice.items.map(item => [
    item.commodity_type ? String(item.commodity_type) : '-',
    item.description ? String(item.description) : '-',
    item.parcel_charge != null ? item.parcel_charge.toFixed(2) : '0.00',
    '1', // quantity
    item.cost != null ? `TZS ${String(item.cost)}` : 'TZS 0.00',
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
  doc.text(invoice.total_amount != null ? `TZS ${String(invoice.total_amount)}` : 'TZS 0.00', 190, finalY, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.text('Tax', 14, finalY + 6);
  doc.text(invoice.tax != null ? String(invoice.tax) : '0.00', 190, finalY + 6, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL', 14, finalY + 12);
  doc.text(invoice.final_amount != null ? `TZS ${String(invoice.final_amount)}` : 'TZS 0.00', 190, finalY + 12, { align: 'right' });


  // Signature
  doc.setFontSize(12);
  doc.text('________________________', 190, finalY + 30, { align: 'right' });
  doc.setFontSize(10);
  doc.text('Authorized Signature', 190, finalY + 36, { align: 'right' });

  doc.save(`Invoice-${invoice.invoice_no}.pdf`);
};
