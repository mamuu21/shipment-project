import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Ship,
  Tag,
  Truck,
  Package,
  CreditCard,
  Pencil,
  Trash2,
  Plus,
  Loader2,
  ChevronDown,
  ChevronRight,
  Search,
} from "lucide-react"
import api from "@/utils/api"
import { toast } from "sonner"

interface Parameter {
  id: number
  category: string
  name: string
  description: string
  color: string | null
  sort_order: number
  is_default: boolean
  is_active: boolean
}

interface ParameterForm {
  name: string
  description: string
  color: string
  sort_order: number
  is_default: boolean
  is_active: boolean
}

const DEFAULT_FORM: ParameterForm = {
  name: "",
  description: "",
  color: "#3b82f6",
  sort_order: 0,
  is_default: false,
  is_active: true,
}

const CATEGORIES = [
  {
    key: "vessel",
    label: "Vessels",
    icon: Ship,
    hasColor: false,
  },
  {
    key: "parcel_status",
    label: "Parcel Statuses",
    icon: Tag,
    hasColor: true,
  },
  {
    key: "transport_method",
    label: "Transport Methods",
    icon: Truck,
    hasColor: false,
  },
  {
    key: "commodity_type",
    label: "Commodity Types",
    icon: Package,
    hasColor: false,
  },
  {
    key: "payment_method",
    label: "Payment Methods",
    icon: CreditCard,
    hasColor: false,
  },
] as const

type CategoryKey = (typeof CATEGORIES)[number]["key"]

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label || "Toggle"}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-blue-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  )
}

export function ParametersTab() {
  const [parameters, setParameters] = useState<Parameter[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(CATEGORIES.map((c) => c.key))
  )

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogCategory, setDialogCategory] = useState<CategoryKey>("vessel")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<ParameterForm>(DEFAULT_FORM)

  const [deletingId, setDeletingId] = useState<number | null>(null)

  const fetchParameters = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get("/parameters/")
      const data = res.data?.results ?? res.data
      setParameters(Array.isArray(data) ? data : [])
    } catch {
      toast.error("Failed to load parameters")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchParameters()
  }, [fetchParameters])

  const grouped = useMemo(() => {
    const map: Record<string, Parameter[]> = {}
    for (const cat of CATEGORIES) {
      map[cat.key] = []
    }
    for (const param of parameters) {
      const key = param.category
      if (map[key]) {
        map[key].push(param)
      }
    }
    return map
  }, [parameters])

  const filteredGrouped = useMemo(() => {
    if (!search.trim()) return grouped
    const q = search.toLowerCase()
    const result: Record<string, Parameter[]> = {}
    for (const [key, items] of Object.entries(grouped)) {
      result[key] = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      )
    }
    return result
  }, [grouped, search])

  const toggleExpanded = useCallback((key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const openAddDialog = useCallback((categoryKey: CategoryKey) => {
    setEditingId(null)
    setDialogCategory(categoryKey)
    setForm(DEFAULT_FORM)
    setDialogOpen(true)
  }, [])

  const openEditDialog = useCallback((param: Parameter) => {
    setEditingId(param.id)
    setDialogCategory(param.category as CategoryKey)
    setForm({
      name: param.name,
      description: param.description,
      color: param.color || "#3b82f6",
      sort_order: param.sort_order,
      is_default: param.is_default,
      is_active: param.is_active,
    })
    setDialogOpen(true)
  }, [])

  const saveParameter = async () => {
    setSaving(true)
    try {
      const categoryMeta = CATEGORIES.find((c) => c.key === dialogCategory)
      const payload = {
        ...form,
        category: dialogCategory,
        color: categoryMeta?.hasColor ? form.color : null,
      }

      if (editingId) {
        await api.put(`/parameters/${editingId}/`, payload)
        toast.success("Parameter updated successfully")
      } else {
        await api.post("/parameters/", payload)
        toast.success("Parameter created successfully")
      }
      setDialogOpen(false)
      fetchParameters()
    } catch {
      toast.error("Failed to save parameter")
    } finally {
      setSaving(false)
    }
  }

  const deleteParameter = async () => {
    if (!deletingId) return
    try {
      await api.delete(`/parameters/${deletingId}/`)
      toast.success("Parameter deleted successfully")
      setDeletingId(null)
      fetchParameters()
    } catch {
      toast.error("Failed to delete parameter")
    }
  }

  const toggleDefault = useCallback(
    async (param: Parameter) => {
      try {
        await api.patch(`/parameters/${param.id}/`, {
          is_default: !param.is_default,
        })
        fetchParameters()
      } catch {
        toast.error("Failed to update parameter")
      }
    },
    [fetchParameters]
  )

  const toggleActive = useCallback(
    async (param: Parameter) => {
      try {
        await api.patch(`/parameters/${param.id}/`, {
          is_active: !param.is_active,
        })
        fetchParameters()
      } catch {
        toast.error("Failed to update parameter")
      }
    },
    [fetchParameters]
  )

  const currentCategoryMeta = useMemo(
    () => CATEGORIES.find((c) => c.key === dialogCategory),
    [dialogCategory]
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search parameters..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {CATEGORIES.map((cat) => {
        const items = filteredGrouped[cat.key] || []
        const isOpen = expanded.has(cat.key)
        const Icon = cat.icon

        return (
          <Card key={cat.key}>
            <CardHeader
              className="cursor-pointer select-none"
              onClick={() => toggleExpanded(cat.key)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isOpen ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">
                    {cat.label}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      ({items.length})
                    </span>
                  </CardTitle>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    openAddDialog(cat.key)
                  }}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add
                </Button>
              </div>
            </CardHeader>

            {isOpen && (
              <CardContent>
                {items.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    No parameters in this category
                  </p>
                ) : (
                  <div className="space-y-2">
                    {items.map((param) => (
                      <div
                        key={param.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          {cat.hasColor && param.color && (
                            <span
                              className="inline-block h-4 w-4 rounded-full border"
                              style={{ backgroundColor: param.color }}
                            />
                          )}
                          <div>
                            <p className="font-medium text-sm">{param.name}</p>
                            {param.description && (
                              <p className="text-xs text-muted-foreground">
                                {param.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Default
                            </span>
                            <Toggle
                              checked={param.is_default}
                              onChange={() => toggleDefault(param)}
                              label={`Default ${param.name}`}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Active
                            </span>
                            <Toggle
                              checked={param.is_active}
                              onChange={() => toggleActive(param)}
                              label={`Active ${param.name}`}
                            />
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditDialog(param)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setDeletingId(param.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        )
      })}

      {/* Add/Edit Parameter Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Parameter" : "Add Parameter"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the parameter details below."
                : `Add a new parameter to ${currentCategoryMeta?.label ?? "this category"}.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="param_name">Name</Label>
              <Input
                id="param_name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Parameter name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="param_description">Description</Label>
              <Input
                id="param_description"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Parameter description"
              />
            </div>

            {currentCategoryMeta?.hasColor && (
              <div className="space-y-2">
                <Label htmlFor="param_color">Color</Label>
                <div className="flex items-center gap-3">
                  <input
                    id="param_color"
                    type="color"
                    title="Pick a color"
                    value={form.color}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, color: e.target.value }))
                    }
                    className="h-10 w-14 cursor-pointer rounded border p-1"
                  />
                  <span className="text-sm text-muted-foreground">
                    {form.color}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="param_sort_order">Sort Order</Label>
              <Input
                id="param_sort_order"
                type="number"
                value={form.sort_order}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    sort_order: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="param_default"
                  checked={form.is_default}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, is_default: !!v }))
                  }
                />
                <Label htmlFor="param_default">Default</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="param_active"
                  checked={form.is_active}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, is_active: !!v }))
                  }
                />
                <Label htmlFor="param_active">Active</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveParameter} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deletingId !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Parameter</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this parameter? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteParameter}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
