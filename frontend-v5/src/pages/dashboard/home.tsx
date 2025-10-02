import { Card, CardContent } from "@/components/ui/card"
import { Link } from "react-router-dom"
import { Package, Users, Box, FileText } from "lucide-react"
import { useState, useEffect } from "react"
import api from "@/utils/api"
import { useAuth } from "@/hooks/useAuth"

const cards = [
  {
    title: "Shipments",
    icon: <Package className="h-6 w-6" />,
    link: "/shipments",
    endpoint: "shipments",
  },
  {
    title: "Customers",
    icon: <Users className="h-6 w-6" />,
    link: "/customers",
    endpoint: "customers",
  },
  {
    title: "Parcels",
    icon: <Box className="h-6 w-6" />,
    link: "/parcels",
    endpoint: "parcels",
  },
  {
    title: "Invoices",
    icon: <FileText className="h-6 w-6" />,
    link: "/invoices",
    endpoint: "invoices",
  },
]

export default function DashboardPage() {
  const { isCustomer } = useAuth()
  const [counts, setCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token")
        const headers = token ? { Authorization: `Bearer ${token}` } : {}

        const countPromises = cards.map(async (card) => {
          try {
            const response = await api.get(`${card.endpoint}/?page=1&page_size=1`, { headers })
            const data = response.data as { count?: number }
            return { [card.endpoint]: data.count || 0 }
          } catch (error) {
            console.error(`Failed to fetch ${card.endpoint} count:`, error)
            return { [card.endpoint]: 0 }
          }
        })

        const results = await Promise.all(countPromises)
        const countsObj = results.reduce((acc, curr) => ({ ...acc, ...curr }), {})
        setCounts(countsObj)
      } catch (error) {
        console.error("Failed to fetch counts:", error)
      }
    }

    fetchCounts()
  }, [])

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Welcome to your Dashboard</h2>

      {!isCustomer && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
            <Link key={card.title} to={card.link}>
            <Card className="bg-white hover:bg-gray-100 transition-colors duration-200 shadow-md hover:shadow-lg cursor-pointer">
                <CardContent className="flex flex-col items-center justify-center py-6">
                <div className="mb-2 text-gray-700">{card.icon}</div>
                <h3 className="text-md font-medium text-gray-800">{card.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {counts[card.endpoint] !== undefined ? counts[card.endpoint] : "..."} items
                </p>
                </CardContent>
            </Card>
            </Link>
        ))}
        </div>
      )}

      {isCustomer && (
        <div className="text-center py-8">
          <p className="text-gray-600">Welcome to your customer dashboard. Use the navigation to access your information.</p>
        </div>
      )}
    </div>
  )
}
