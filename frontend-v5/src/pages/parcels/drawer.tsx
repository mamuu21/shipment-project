import { useState, useEffect, useCallback } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  X,
  Pencil,
  Package,
  Ship,
  Weight,
  CreditCard,
  Mail,
  Printer,
  FileText,
  MapPin,
  ArrowRight,
  User,
  CheckCircle2,
  Circle,
  Box,
} from "lucide-react"
import api from "@/utils/api"
import { toast } from "@/hooks/use-toast"

interface ParcelData {
  parcel_no: string
  shipment?: string
  shipment_vessel?: string
  shipment_status?: string
  customer?: {
    id: number
    name: string
    email?: string
    phone?: string
  }
  customer_name?: string
  weight?: number
  weight_unit?: string
  volume?: number
  volume_unit?: string
  charge?: number
  payment?: string
  commodity_type?: string
  description?: string
}

interface Step {
  id: number
  name: string
  description: string
  order: number
  color: string
  is_active: boolean
}

interface ParcelDetailDrawerProps {
  parcelNo: string | null
  open: boolean
  onClose: () => void
  onEdit?: (parcelNo: string) => void
  onOpenCustomer?: (customerId: string) => void
}

export function ParcelDetailDrawer({
  parcelNo,
  open,
  onClose,
  onEdit,
  onOpenCustomer,
}: ParcelDetailDrawerProps) {
  const [parcel, setParcel] = useState<ParcelData | null>(null)
  const [steps, setSteps] = useState<Step[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!parcelNo) return
    setLoading(true)
    try {
      const [parcelRes, stepsRes] = await Promise.all([
        api.get(`/parcels/${parcelNo}/`),
        api.get(`/steps/active/`),
      ])
      setParcel(parcelRes.data)
      setSteps(Array.isArray(stepsRes.data) ? stepsRes.data : stepsRes.data.results ?? [])
    } catch {
      toast({ title: "Error", description: "Failed to load parcel details", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [parcelNo])

  useEffect(() => {
    if (open && parcelNo) {
      fetchData()
    }
    if (!open) {
      setParcel(null)
      setSteps([])
    }
  }, [open, parcelNo, fetchData])

  const customerName = parcel?.customer?.name ?? parcel?.customer_name ?? "-"
  const customerId = parcel?.customer?.id?.toString()
  const customerEmail = parcel?.customer?.email

  const statusColor = (status?: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700 border-green-200"
      case "In-transit":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "Not-boarded":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      default:
        return ""
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:w-[580px] md:w-[640px] lg:w-[700px] sm:max-w-none p-0 flex flex-col [&>button.absolute]:hidden"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Parcel Details</SheetTitle>
          <SheetDescription>Detailed view of the selected parcel</SheetDescription>
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
          <span className="text-sm font-semibold">Parcel Details</span>
          {onEdit ? (
            <Button
              variant="ghost"
              size="sm"
              disabled={!parcel}
              onClick={() => parcel && onEdit(parcel.parcel_no)}
            >
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
          ) : (
            <div className="w-16" />
          )}
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : parcel ? (
          <div className="flex-1 overflow-y-auto">
            {/* Parcel header */}
            <div className="px-5 py-5 border-b">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Package className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-semibold">{parcel.parcel_no}</h3>
                    <Badge className={statusColor(parcel.shipment_status)}>
                      {parcel.shipment_status ?? "Unknown"}
                    </Badge>
                  </div>
                  {parcel.shipment_vessel && (
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Ship className="h-3.5 w-3.5" />
                      <span>{parcel.shipment_vessel}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Info cards */}
            <div className="px-4 py-4 space-y-4">
              {/* Shipping Info */}
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Shipping Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Shipment</span>
                      <p className="font-medium">{parcel.shipment ?? "-"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Commodity</span>
                      <div className="flex items-center gap-1.5">
                        <Box className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="font-medium">{parcel.commodity_type ?? "-"}</p>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Customer</span>
                      {customerId && onOpenCustomer ? (
                        <button
                          onClick={() => onOpenCustomer(customerId)}
                          className="flex items-center gap-1.5 text-primary hover:underline font-medium"
                        >
                          <User className="h-3.5 w-3.5" />
                          {customerName}
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      ) : (
                        <p className="font-medium flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          {customerName}
                        </p>
                      )}
                    </div>
                    {parcel.description && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Description</span>
                        <p className="font-medium">{parcel.description}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Weight & Volume */}
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Weight className="h-4 w-4" />
                    Weight & Volume
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Weight</span>
                      <p className="text-lg font-semibold">
                        {parcel.weight ?? 0}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          {parcel.weight_unit ?? "kg"}
                        </span>
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Volume</span>
                      <p className="text-lg font-semibold">
                        {parcel.volume ?? 0}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          {parcel.volume_unit ?? "m³"}
                        </span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial */}
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Financial
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Charge</span>
                      <p className="text-lg font-semibold">{parcel.charge ?? "0.00"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Payment</span>
                      <Badge
                        variant={parcel.payment === "Paid" ? "default" : "destructive"}
                        className={
                          parcel.payment === "Paid"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : undefined
                        }
                      >
                        {parcel.payment ?? "Unpaid"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status Timeline */}
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Status Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  {steps.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-4">
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
                              <Circle className="h-4 w-4 text-gray-300" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{step.name}</p>
                            {step.description && (
                              <p className="text-xs text-muted-foreground">
                                {step.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Parcel not found.</p>
          </div>
        )}

        {/* Footer: Quick Actions */}
        {parcel && !loading && (
          <div className="border-t px-4 py-3 flex items-center gap-2">
            <span className="text-xs text-muted-foreground mr-auto">Quick Actions</span>
            {customerEmail && (
              <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${customerEmail}`}>
                  <Mail className="h-3.5 w-3.5 mr-1" />
                  Email Customer
                </a>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-3.5 w-3.5 mr-1" />
              Print Label
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={`/invoices?parcel=${parcel.parcel_no}`}>
                <FileText className="h-3.5 w-3.5 mr-1" />
                View Invoice
              </a>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex-1 p-5 space-y-4">
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <Skeleton className="h-32" />
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
      <Skeleton className="h-32" />
    </div>
  )
}

export default ParcelDetailDrawer
