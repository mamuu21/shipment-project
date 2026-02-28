import { Card, CardContent } from "@/components/ui/card"
import { Link } from "react-router-dom"
import { Package, Users, Box, FileText } from "lucide-react"
import { useState, useEffect } from "react"
import api from "@/utils/api"
import { useAuth } from "@/hooks/useAuth"

type DashboardCard = {
  title: string
  icon: any
  link: string
  endpoint: string
  iconBg: string
  iconColor: string
}

const cards: DashboardCard[] = [
  {
    title: "Shipments",
    icon: Package,
    link: "/shipments",
    endpoint: "shipments",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Customers",
    icon: Users,
    link: "/customers",
    endpoint: "customers",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    title: "Parcels",
    icon: Box,
    link: "/parcels",
    endpoint: "parcels",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    title: "Invoices",
    icon: FileText,
    link: "/invoices",
    endpoint: "invoices",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
]

export default function DashboardPage() {
  const { isCustomer } = useAuth()
  const [counts, setCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const token =
          localStorage.getItem("access_token") ||
          sessionStorage.getItem("access_token")

        const headers = token ? { Authorization: `Bearer ${token}` } : {}

        const countPromises = cards.map(async (card) => {
          try {
            const response = await api.get(
              `${card.endpoint}/?page=1&page_size=1`,
              { headers }
            )

            const data = response.data as { count?: number }

            return { [card.endpoint]: data.count || 0 }
          } catch (error) {
            console.error(
              `Failed to fetch ${card.endpoint} count:`,
              error
            )
            return { [card.endpoint]: 0 }
          }
        })

        const results = await Promise.all(countPromises)

        const countsObj = results.reduce(
          (acc, curr) => ({ ...acc, ...curr }),
          {}
        )

        setCounts(countsObj)
      } catch (error) {
        console.error("Failed to fetch counts:", error)
      }
    }

    fetchCounts()
  }, [])

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Welcome to your Dashboard
      </h2>

      {!isCustomer && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => {
            const Icon = card.icon

            return (
              <Link key={card.title} to={card.link}>
                <Card className="group bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer rounded-xl">
                  <CardContent className="flex flex-col items-start p-6 space-y-4">
                    
                    {/* Icon */}
                    <div
                      className={`p-3 rounded-lg ${card.iconBg} ${card.iconColor}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-800">
                      {card.title}
                    </h3>

                    {/* Count */}
                    <p className="text-sm text-gray-500">
                      <span className="text-2xl font-bold text-gray-900">
                        {counts[card.endpoint] ?? "..."}
                      </span>{" "}
                      total
                    </p>

                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      {isCustomer && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            Welcome to your customer dashboard. Use the navigation to access your information.
          </p>
        </div>
      )}
    </div>
  )
}