import { Card, CardContent } from "@/components/ui/card"
import { Link } from "react-router-dom"
import { Package, Users, Box, FileText } from "lucide-react"

const cards = [
  {
    title: "Shipments",
    icon: <Package className="h-6 w-6" />,
    link: "/shipments",
  },
  {
    title: "Customers",
    icon: <Users className="h-6 w-6" />,
    link: "/customers",
  },
  {
    title: "Parcels",
    icon: <Box className="h-6 w-6" />,
    link: "/parcels",
  },
  {
    title: "Invoices",
    icon: <FileText className="h-6 w-6" />,
    link: "/invoices",
  },
]

export default function DashboardPage() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Welcome to your Dashboard</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
            <Link key={card.title} to={card.link}>
            <Card className="bg-white hover:bg-gray-100 transition-colors duration-200 shadow-md hover:shadow-lg cursor-pointer">
                <CardContent className="flex flex-col items-center justify-center py-6">
                <div className="mb-2 text-gray-700">{card.icon}</div>
                <h3 className="text-md font-medium text-gray-800">{card.title}</h3>
                </CardContent>
            </Card>
            </Link>
        ))}
        </div>
    </div>
  )
}
