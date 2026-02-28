import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Link } from "react-router-dom"
import {
  Ship,
  Users,
  Package,
  Box,
  TrendingUp,
  ArrowUpRight,
  Eye,
} from "lucide-react"
import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import api from "@/utils/api"
import { useAuth } from "@/hooks/useAuth"

const monthlyData = [
  { month: "Jan", cbm: 120, parcels: 340, customers: 45 },
  { month: "Feb", cbm: 150, parcels: 410, customers: 52 },
  { month: "Mar", cbm: 180, parcels: 390, customers: 48 },
  { month: "Apr", cbm: 210, parcels: 520, customers: 61 },
  { month: "May", cbm: 190, parcels: 480, customers: 55 },
  { month: "Jun", cbm: 250, parcels: 560, customers: 68 },
  { month: "Jul", cbm: 230, parcels: 530, customers: 63 },
  { month: "Aug", cbm: 270, parcels: 610, customers: 72 },
  { month: "Sep", cbm: 240, parcels: 570, customers: 66 },
  { month: "Oct", cbm: 300, parcels: 650, customers: 78 },
  { month: "Nov", cbm: 280, parcels: 620, customers: 74 },
  { month: "Dec", cbm: 320, parcels: 700, customers: 85 },
]

const transportData = [
  { name: "Sea", value: 1300, color: "#4F46E5" },
  { name: "Air", value: 920, color: "#8B5CF6" },
]

const vesselData = [
  { name: "MSC Gülsün", value: 280, color: "#4F46E5" },
  { name: "Ever Given", value: 220, color: "#6366F1" },
  { name: "CMA CGM Marco", value: 190, color: "#8B5CF6" },
  { name: "OOCL Hong Kong", value: 170, color: "#A78BFA" },
  { name: "Cosco Shipping", value: 150, color: "#C4B5FD" },
  { name: "Maersk Sealand", value: 130, color: "#7C3AED" },
  { name: "Yang Ming", value: 100, color: "#5B21B6" },
  { name: "Others", value: 60, color: "#DDD6FE" },
]

const pendingInvoices = [
  {
    id: "INV-2024-001",
    customer: "Mombasa Trading Co.",
    amount: 4250.0,
    dueDate: "2024-12-15",
    daysOverdue: 12,
    status: "overdue",
  },
  {
    id: "INV-2024-002",
    customer: "Nairobi Imports Ltd.",
    amount: 2890.5,
    dueDate: "2024-12-20",
    daysOverdue: 7,
    status: "overdue",
  },
  {
    id: "INV-2024-003",
    customer: "Kisumu Freight Services",
    amount: 6120.0,
    dueDate: "2024-12-28",
    daysOverdue: 0,
    status: "due_soon",
  },
  {
    id: "INV-2024-004",
    customer: "Dar es Salaam Cargo",
    amount: 3475.25,
    dueDate: "2024-12-30",
    daysOverdue: 0,
    status: "due_soon",
  },
  {
    id: "INV-2024-005",
    customer: "Kampala Logistics Hub",
    amount: 5830.0,
    dueDate: "2025-01-05",
    daysOverdue: 0,
    status: "pending",
  },
]

function MetricCardSkeleton() {
  return (
    <Card className="bg-white border border-gray-100 shadow-sm rounded-xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  )
}

type MetricCardProps = {
  title: string
  value: number | string | null
  trend: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
  link: string
  loading: boolean
}

function MetricCard({
  title,
  value,
  trend,
  icon: Icon,
  iconBg,
  iconColor,
  link,
  loading,
}: MetricCardProps) {
  if (loading) return <MetricCardSkeleton />

  return (
    <Link to={link}>
      <Card className="group bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">{title}</span>
            <div className={`p-2.5 rounded-lg ${iconBg}`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {value ?? "—"}
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="flex items-center gap-0.5 text-emerald-600 font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              {trend}
            </span>
            <span className="text-gray-400">vs last month</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ color: string; name: string; value: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1.5">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-medium text-gray-900">
            {entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}

function PieTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: { name: string; value: number; color: string } }>
}) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <div className="flex items-center gap-2">
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: data.color }}
        />
        <span className="text-gray-600">{data.name}:</span>
        <span className="font-medium text-gray-900">
          {data.value.toLocaleString()}
        </span>
      </div>
    </div>
  )
}

function DonutLegend({
  data,
}: {
  data: Array<{ name: string; value: number; color: string }>
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
      {data.map((item) => (
        <div key={item.name} className="flex items-center gap-2 text-sm">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-gray-600 truncate">{item.name}</span>
          <span className="font-medium text-gray-900 ml-auto">
            {item.value.toLocaleString()}
          </span>
        </div>
      ))}
      <div className="col-span-2 border-t border-gray-100 pt-2 mt-1 flex justify-between text-sm font-semibold text-gray-800">
        <span>Total</span>
        <span>{total.toLocaleString()}</span>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { isCustomer } = useAuth()
  const [counts, setCounts] = useState<Record<string, number | null>>({
    shipments: null,
    customers: null,
    parcels: null,
    invoices: null,
  })
  const [countsLoading, setCountsLoading] = useState(true)

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const endpoints = ["shipments", "customers", "parcels", "invoices"]
        const results = await Promise.all(
          endpoints.map(async (ep) => {
            try {
              const res = await api.get(`/${ep}/?page=1&page_size=1`)
              const data = res.data as { count?: number }
              return { [ep]: data.count ?? null }
            } catch {
              return { [ep]: null }
            }
          })
        )
        setCounts(results.reduce((acc, cur) => ({ ...acc, ...cur }), {}))
      } catch (err) {
        console.error("Failed to fetch dashboard counts:", err)
      } finally {
        setCountsLoading(false)
      }
    }
    fetchCounts()
  }, [])

  if (isCustomer) {
    return (
      <div className="p-6 text-center py-20">
        <Ship className="h-16 w-16 mx-auto text-indigo-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Welcome to your Dashboard
        </h2>
        <p className="text-gray-500 text-lg max-w-md mx-auto">
          Use the navigation to track your shipments and manage your account.
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          Last updated just now
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Shipments"
          value={counts.shipments}
          trend="+12.5%"
          icon={Ship}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          link="/shipments"
          loading={countsLoading}
        />
        <MetricCard
          title="Customers"
          value={counts.customers}
          trend="+8.2%"
          icon={Users}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          link="/customers"
          loading={countsLoading}
        />
        <MetricCard
          title="Parcels"
          value={counts.parcels}
          trend="+24.1%"
          icon={Package}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
          link="/parcels"
          loading={countsLoading}
        />
        <MetricCard
          title="Total CBM"
          value={counts.invoices}
          trend="+15.3%"
          icon={Box}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          link="/invoices"
          loading={countsLoading}
        />
      </div>

      {/* Monthly Overview Chart */}
      <Card className="bg-white border border-gray-100 shadow-sm rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Monthly Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart
              data={monthlyData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 13, paddingTop: 12 }}
                iconType="circle"
                iconSize={8}
              />
              <Bar
                dataKey="cbm"
                name="CBM"
                fill="#4F46E5"
                radius={[4, 4, 0, 0]}
                barSize={18}
              />
              <Bar
                dataKey="parcels"
                name="Parcels"
                fill="#8B5CF6"
                radius={[4, 4, 0, 0]}
                barSize={18}
              />
              <Bar
                dataKey="customers"
                name="Customers"
                fill="#A78BFA"
                radius={[4, 4, 0, 0]}
                barSize={18}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pie Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Transport Mode */}
        <Card className="bg-white border border-gray-100 shadow-sm rounded-xl">
          <CardHeader className="pb-0">
            <CardTitle className="text-lg font-semibold text-gray-800">
              Transport Mode
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={transportData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {transportData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <DonutLegend data={transportData} />
          </CardContent>
        </Card>

        {/* Vessel Distribution */}
        <Card className="bg-white border border-gray-100 shadow-sm rounded-xl">
          <CardHeader className="pb-0">
            <CardTitle className="text-lg font-semibold text-gray-800">
              Vessel Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={vesselData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {vesselData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <DonutLegend data={vesselData} />
          </CardContent>
        </Card>
      </div>

      {/* Pending Invoices Table */}
      <Card className="bg-white border border-gray-100 shadow-sm rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Pending Invoices
          </CardTitle>
          <Link to="/invoices">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Eye className="h-4 w-4" />
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="pb-3 font-medium text-gray-500">Invoice</th>
                  <th className="pb-3 font-medium text-gray-500">Customer</th>
                  <th className="pb-3 font-medium text-gray-500 text-right">
                    Amount
                  </th>
                  <th className="pb-3 font-medium text-gray-500">Due Date</th>
                  <th className="pb-3 font-medium text-gray-500 text-center">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-3 font-medium text-gray-900">{inv.id}</td>
                    <td className="py-3 text-gray-600">{inv.customer}</td>
                    <td className="py-3 text-right font-semibold text-gray-900">
                      ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 text-gray-600">{inv.dueDate}</td>
                    <td className="py-3 text-center">
                      {inv.status === "overdue" && (
                        <Badge variant="destructive" className="text-xs">
                          {inv.daysOverdue}d overdue
                        </Badge>
                      )}
                      {inv.status === "due_soon" && (
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-xs">
                          Due soon
                        </Badge>
                      )}
                      {inv.status === "pending" && (
                        <Badge variant="secondary" className="text-xs">
                          Pending
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
