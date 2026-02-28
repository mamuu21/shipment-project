import { useState, useEffect, useCallback } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  X,
  Pencil,
  Mail,
  Phone,
  MapPin,
  Package,
  Weight,
  FileText,
  MessageCircle,
  CheckCircle2,
  Circle,
} from "lucide-react"
import api from "@/utils/api"
import { toast } from "@/hooks/use-toast"

interface Customer {
  id: number
  name: string
  email: string
  phone: string
  address: string
  status: string
  total_parcels?: number
  total_parcel_weight?: number
  total_invoices_paid?: number
  total_shipments?: number
  shipment_nos?: string[]
}

interface Parcel {
  parcel_no: string
  shipment_vessel?: string
  weight?: number
  weight_unit?: string
  volume?: number
  volume_unit?: string
  charge?: number
  payment?: string
  commodity_type?: string
  shipment_status?: string
  customer_name?: string
}

interface Invoice {
  invoice_no: string
  issue_date: string
  due_date: string
  total_amount: string
  final_amount: string
  status: string
}

interface Step {
  id: number
  name: string
  description: string
  order: number
  color: string
  is_active: boolean
}

interface CustomerDetailDrawerProps {
  customerId: string | null
  open: boolean
  onClose: () => void
  onEdit: (customer: Customer) => void
}

const PARCELS_PER_PAGE = 5

export function CustomerDetailDrawer({
  customerId,
  open,
  onClose,
  onEdit,
}: CustomerDetailDrawerProps) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [parcels, setParcels] = useState<Parcel[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [steps, setSteps] = useState<Step[]>([])
  const [loading, setLoading] = useState(true)
  const [parcelPage, setParcelPage] = useState(1)

  const fetchData = useCallback(async () => {
    if (!customerId) return
    setLoading(true)
    try {
      const [custRes, parcRes, invRes, stepsRes] = await Promise.all([
        api.get(`/customers/${customerId}/`),
        api.get(`/parcels/`, { params: { customer: customerId } }),
        api.get(`/invoices/`, { params: { customer_id: customerId } }),
        api.get(`/steps/active/`),
      ])
      setCustomer(custRes.data)
      setParcels(Array.isArray(parcRes.data) ? parcRes.data : parcRes.data.results ?? [])
      setInvoices(Array.isArray(invRes.data) ? invRes.data : invRes.data.results ?? [])
      setSteps(Array.isArray(stepsRes.data) ? stepsRes.data : stepsRes.data.results ?? [])
    } catch {
      toast({ title: "Error", description: "Failed to load customer details", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [customerId])

  useEffect(() => {
    if (open && customerId) {
      setParcelPage(1)
      fetchData()
    }
    if (!open) {
      setCustomer(null)
      setParcels([])
      setInvoices([])
    }
  }, [open, customerId, fetchData])

  const totalParcelPages = Math.max(1, Math.ceil(parcels.length / PARCELS_PER_PAGE))
  const paginatedParcels = parcels.slice(
    (parcelPage - 1) * PARCELS_PER_PAGE,
    parcelPage * PARCELS_PER_PAGE
  )

  const initials = customer?.name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "?"

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:w-[640px] md:w-[720px] lg:w-[800px] sm:max-w-none p-0 flex flex-col [&>button.absolute]:hidden"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Customer Details</SheetTitle>
          <SheetDescription>Detailed view of the selected customer</SheetDescription>
        </SheetHeader>

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold">Customer Details</span>
          <Button
            variant="ghost"
            size="sm"
            disabled={!customer}
            onClick={() => customer && onEdit(customer)}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : customer ? (
          <div className="flex-1 overflow-y-auto">
            {/* Customer summary */}
            <div className="px-5 py-5 border-b">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-semibold truncate">{customer.name}</h3>
                    <Badge
                      variant={customer.status === "Active" ? "default" : "secondary"}
                      className={
                        customer.status === "Active"
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-gray-100 text-gray-500 border-gray-200"
                      }
                    >
                      {customer.status}
                    </Badge>
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="truncate">{customer.address}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 divide-x border-b">
              <StatBlock
                icon={<Package className="h-4 w-4 text-blue-500" />}
                label="Total Parcels"
                value={customer.total_parcels ?? parcels.length}
              />
              <StatBlock
                icon={<Weight className="h-4 w-4 text-orange-500" />}
                label="Total Weight"
                value={`${customer.total_parcel_weight ?? 0} kg`}
              />
              <StatBlock
                icon={<FileText className="h-4 w-4 text-green-500" />}
                label="Invoices Paid"
                value={customer.total_invoices_paid ?? 0}
              />
            </div>

            {/* Tabs */}
            <div className="px-4 pt-4 pb-2">
              <Tabs defaultValue="parcels">
                <TabsList>
                  <TabsTrigger value="parcels">Parcels</TabsTrigger>
                  <TabsTrigger value="invoices">Invoices</TabsTrigger>
                  <TabsTrigger value="status">Status</TabsTrigger>
                </TabsList>

                <TabsContent value="parcels" className="mt-3">
                  {parcels.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      No parcels found for this customer.
                    </p>
                  ) : (
                    <>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Parcel No</TableHead>
                              <TableHead>Vessel</TableHead>
                              <TableHead>Weight</TableHead>
                              <TableHead>Charge</TableHead>
                              <TableHead>Payment</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedParcels.map((p) => (
                              <TableRow key={p.parcel_no}>
                                <TableCell className="font-medium">{p.parcel_no}</TableCell>
                                <TableCell>{p.shipment_vessel ?? "-"}</TableCell>
                                <TableCell>
                                  {p.weight} {p.weight_unit}
                                </TableCell>
                                <TableCell>{p.charge ?? "-"}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={p.payment === "Paid" ? "default" : "destructive"}
                                    className={
                                      p.payment === "Paid"
                                        ? "bg-green-100 text-green-700 border-green-200"
                                        : undefined
                                    }
                                  >
                                    {p.payment}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      {totalParcelPages > 1 && (
                        <Pagination className="mt-3">
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() => setParcelPage((p) => Math.max(1, p - 1))}
                                className={parcelPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                              />
                            </PaginationItem>
                            {Array.from({ length: totalParcelPages }, (_, i) => (
                              <PaginationItem key={i}>
                                <PaginationLink
                                  isActive={parcelPage === i + 1}
                                  onClick={() => setParcelPage(i + 1)}
                                  className="cursor-pointer"
                                >
                                  {i + 1}
                                </PaginationLink>
                              </PaginationItem>
                            ))}
                            <PaginationItem>
                              <PaginationNext
                                onClick={() => setParcelPage((p) => Math.min(totalParcelPages, p + 1))}
                                className={parcelPage === totalParcelPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      )}
                    </>
                  )}
                </TabsContent>

                <TabsContent value="invoices" className="mt-3">
                  {invoices.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      No invoices found for this customer.
                    </p>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Invoice No</TableHead>
                            <TableHead>Issue Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invoices.map((inv) => (
                            <TableRow key={inv.invoice_no}>
                              <TableCell className="font-medium">{inv.invoice_no}</TableCell>
                              <TableCell>
                                {new Date(inv.issue_date).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{inv.final_amount}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    inv.status === "Paid"
                                      ? "default"
                                      : inv.status === "Overdue"
                                        ? "destructive"
                                        : "secondary"
                                  }
                                  className={
                                    inv.status === "Paid"
                                      ? "bg-green-100 text-green-700 border-green-200"
                                      : undefined
                                  }
                                >
                                  {inv.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="status" className="mt-3">
                  <div className="space-y-3">
                    {steps.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground py-8">
                        No status steps configured.
                      </p>
                    ) : (
                      <div className="relative pl-6 space-y-4">
                        <div className="absolute left-[11px] top-1 bottom-1 w-0.5 bg-gray-200" />
                        {steps.map((step, idx) => (
                          <div key={step.id} className="relative flex items-start gap-3">
                            <div className="absolute -left-6 mt-0.5">
                              {idx === 0 ? (
                                <CheckCircle2
                                  className="h-4 w-4"
                                  style={{ color: step.color }}
                                />
                              ) : (
                                <Circle
                                  className="h-4 w-4 text-gray-300"
                                />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{step.name}</p>
                              {step.description && (
                                <p className="text-xs text-muted-foreground">{step.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Customer not found.</p>
          </div>
        )}

        {/* Footer: Quick Actions */}
        {customer && !loading && (
          <div className="border-t px-4 py-3 flex items-center gap-2">
            <span className="text-xs text-muted-foreground mr-auto">Quick Actions</span>
            <Button variant="outline" size="sm" asChild>
              <a href={`mailto:${customer.email}`}>
                <Mail className="h-3.5 w-3.5 mr-1" />
                Email
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={`tel:${customer.phone}`}>
                <Phone className="h-3.5 w-3.5 mr-1" />
                Call
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a
                href={`https://wa.me/${customer.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-3.5 w-3.5 mr-1" />
                WhatsApp
              </a>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

function StatBlock({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center py-4 gap-1">
      {icon}
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex-1 p-5 space-y-4">
      <div className="flex items-start gap-4">
        <Skeleton className="h-14 w-14 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-40" />
    </div>
  )
}

export default CustomerDetailDrawer
