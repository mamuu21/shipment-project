import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
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
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Pencil, Trash2, Plus, Loader2, Save } from "lucide-react"
import api from "@/utils/api"
import { toast } from "sonner"
import { ParametersTab } from "./settings/parameters"

interface Settings {
  site_name: string
  contact_email: string
  timezone: string
  currency: string
  email_alerts_enabled: boolean
  sms_alerts_enabled: boolean
  two_factor_enabled: boolean
  session_timeout_minutes: number
}

interface Step {
  id: number
  name: string
  description: string
  order: number
  color: string
  is_active: boolean
}

interface StepForm {
  name: string
  description: string
  order: number
  color: string
  is_active: boolean
}

const DEFAULT_SETTINGS: Settings = {
  site_name: "",
  contact_email: "",
  timezone: "UTC",
  currency: "TZS",
  email_alerts_enabled: false,
  sms_alerts_enabled: false,
  two_factor_enabled: false,
  session_timeout_minutes: 30,
}

const DEFAULT_STEP_FORM: StepForm = {
  name: "",
  description: "",
  order: 0,
  color: "#3b82f6",
  is_active: true,
}

const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "Africa/Dar_es_Salaam", label: "Africa/Dar_es_Salaam" },
  { value: "Africa/Nairobi", label: "Africa/Nairobi" },
  { value: "Africa/Lagos", label: "Africa/Lagos" },
  { value: "Africa/Cairo", label: "Africa/Cairo" },
  { value: "Africa/Johannesburg", label: "Africa/Johannesburg" },
  { value: "America/New_York", label: "America/New_York" },
  { value: "America/Chicago", label: "America/Chicago" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles" },
  { value: "Europe/London", label: "Europe/London" },
  { value: "Europe/Paris", label: "Europe/Paris" },
  { value: "Asia/Dubai", label: "Asia/Dubai" },
  { value: "Asia/Shanghai", label: "Asia/Shanghai" },
]

const CURRENCIES = [
  { value: "TZS", label: "TZS - Tanzanian Shilling" },
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "KES", label: "KES - Kenyan Shilling" },
]

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

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [steps, setSteps] = useState<Step[]>([])
  const [stepDialog, setStepDialog] = useState(false)
  const [stepForm, setStepForm] = useState<StepForm>(DEFAULT_STEP_FORM)
  const [editingStepId, setEditingStepId] = useState<number | null>(null)
  const [deletingStepId, setDeletingStepId] = useState<number | null>(null)

  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true)
    try {
      const res = await api.get("/settings/")
      setSettings({ ...DEFAULT_SETTINGS, ...res.data })
    } catch {
      toast.error("Failed to load settings")
    } finally {
      setSettingsLoading(false)
    }
  }, [])

  const fetchSteps = useCallback(async () => {
    try {
      const res = await api.get("/steps/")
      const data = res.data?.results ?? res.data
      setSteps(Array.isArray(data) ? data : [])
    } catch {
      toast.error("Failed to load steps")
    }
  }, [])

  useEffect(() => {
    fetchSettings()
    fetchSteps()
  }, [fetchSettings, fetchSteps])

  const saveSettings = async () => {
    setSaving(true)
    try {
      await api.put("/settings/", settings)
      toast.success("Settings saved successfully")
    } catch {
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const openStepDialog = (step?: Step) => {
    if (step) {
      setEditingStepId(step.id)
      setStepForm({
        name: step.name,
        description: step.description,
        order: step.order,
        color: step.color,
        is_active: step.is_active,
      })
    } else {
      setEditingStepId(null)
      setStepForm(DEFAULT_STEP_FORM)
    }
    setStepDialog(true)
  }

  const saveStep = async () => {
    setSaving(true)
    try {
      if (editingStepId) {
        await api.put(`/steps/${editingStepId}/`, stepForm)
        toast.success("Step updated successfully")
      } else {
        await api.post("/steps/", stepForm)
        toast.success("Step created successfully")
      }
      setStepDialog(false)
      fetchSteps()
    } catch {
      toast.error("Failed to save step")
    } finally {
      setSaving(false)
    }
  }

  const deleteStep = async () => {
    if (!deletingStepId) return
    try {
      await api.delete(`/steps/${deletingStepId}/`)
      toast.success("Step deleted successfully")
      setDeletingStepId(null)
      fetchSteps()
    } catch {
      toast.error("Failed to delete step")
    }
  }

  const toggleStepActive = async (step: Step) => {
    try {
      await api.patch(`/steps/${step.id}/`, { is_active: !step.is_active })
      fetchSteps()
    } catch {
      toast.error("Failed to update step")
    }
  }

  if (settingsLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <div className="space-y-3 mt-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Tabs defaultValue="general">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="steps">Steps Management</TabsTrigger>
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site_name">Site Name</Label>
                <Input
                  id="site_name"
                  value={settings.site_name}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, site_name: e.target.value }))
                  }
                  placeholder="Enter site name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      contact_email: e.target.value,
                    }))
                  }
                  placeholder="admin@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select
                  value={settings.timezone}
                  onValueChange={(v) =>
                    setSettings((s) => ({ ...s, timezone: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Currency</Label>
                <Select
                  value={settings.currency}
                  onValueChange={(v) =>
                    setSettings((s) => ({ ...s, currency: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={saveSettings} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Email Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Toggle
                  checked={settings.email_alerts_enabled}
                  onChange={(v) =>
                    setSettings((s) => ({ ...s, email_alerts_enabled: v }))
                  }
                  label="Email Alerts"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">SMS Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via SMS
                  </p>
                </div>
                <Toggle
                  checked={settings.sms_alerts_enabled}
                  onChange={(v) =>
                    setSettings((s) => ({ ...s, sms_alerts_enabled: v }))
                  }
                  label="SMS Alerts"
                />
              </div>

              <Button onClick={saveSettings} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">
                    Two-Factor Authentication
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Toggle
                  checked={settings.two_factor_enabled}
                  onChange={(v) =>
                    setSettings((s) => ({ ...s, two_factor_enabled: v }))
                  }
                  label="Two-Factor Authentication"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="session_timeout">
                  Session Timeout (minutes)
                </Label>
                <Input
                  id="session_timeout"
                  type="number"
                  min={1}
                  value={settings.session_timeout_minutes}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      session_timeout_minutes: parseInt(e.target.value) || 1,
                    }))
                  }
                />
              </div>

              <Button onClick={saveSettings} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Steps Management Tab */}
        <TabsContent value="steps">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Steps Management</CardTitle>
              <Button onClick={() => openStepDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Step
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {steps.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-8"
                      >
                        No steps configured yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    steps.map((step) => (
                      <TableRow key={step.id}>
                        <TableCell className="font-medium">
                          {step.name}
                        </TableCell>
                        <TableCell>{step.description}</TableCell>
                        <TableCell>{step.order}</TableCell>
                        <TableCell>
                          <span
                            className="inline-block h-4 w-4 rounded-full border"
                            style={{ backgroundColor: step.color }}
                          />
                        </TableCell>
                        <TableCell>
                          <Toggle
                            checked={step.is_active}
                            onChange={() => toggleStepActive(step)}
                            label={`Toggle ${step.name}`}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openStepDialog(step)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingStepId(step.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Add/Edit Step Dialog */}
          <Dialog open={stepDialog} onOpenChange={setStepDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingStepId ? "Edit Step" : "Add Step"}
                </DialogTitle>
                <DialogDescription>
                  {editingStepId
                    ? "Update the step details below."
                    : "Fill in the details to create a new step."}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="step_name">Name</Label>
                  <Input
                    id="step_name"
                    value={stepForm.name}
                    onChange={(e) =>
                      setStepForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Step name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="step_description">Description</Label>
                  <Input
                    id="step_description"
                    value={stepForm.description}
                    onChange={(e) =>
                      setStepForm((f) => ({
                        ...f,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Step description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="step_order">Order</Label>
                  <Input
                    id="step_order"
                    type="number"
                    value={stepForm.order}
                    onChange={(e) =>
                      setStepForm((f) => ({
                        ...f,
                        order: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="step_color">Color</Label>
                  <div className="flex items-center gap-3">
                    <input
                      id="step_color"
                      type="color"
                      title="Pick a color"
                      value={stepForm.color}
                      onChange={(e) =>
                        setStepForm((f) => ({ ...f, color: e.target.value }))
                      }
                      className="h-10 w-14 cursor-pointer rounded border p-1"
                    />
                    <span className="text-sm text-muted-foreground">
                      {stepForm.color}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="step_active"
                    checked={stepForm.is_active}
                    onCheckedChange={(v) =>
                      setStepForm((f) => ({ ...f, is_active: !!v }))
                    }
                  />
                  <Label htmlFor="step_active">Active</Label>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setStepDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={saveStep} disabled={saving}>
                  {saving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingStepId ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deletingStepId !== null}
            onOpenChange={(open) => {
              if (!open) setDeletingStepId(null)
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Step</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this step? This action cannot
                  be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeletingStepId(null)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={deleteStep}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Parameters Tab */}
        <TabsContent value="parameters">
          <ParametersTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
