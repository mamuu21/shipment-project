import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Truck, Search, FileUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BackArrow from "@/components/ui/backarrow";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type WarehouseItem = {
  id: string;
  customer: string;
  weight: string;
  volume: string;
  arrivalDate: string;
  status: "In Storage" | "Ready for Pickup" | "Processing";
  type: "Parcel" | "Container";
  location: string;
};

const warehouseItems: WarehouseItem[] = [
  { id: "PCL-04021-1", customer: "Abdulswamad Makuya", weight: "230 KGS", volume: "1750", arrivalDate: "06/02/2024", status: "In Storage", type: "Parcel", location: "Zone A, Rack 12" },
  { id: "PCL-04022-2", customer: "John Smith", weight: "450 KGS", volume: "2100", arrivalDate: "10/02/2024", status: "Ready for Pickup", type: "Container", location: "Zone B, Rack 5" },
  { id: "PCL-04023-3", customer: "Maria Garcia", weight: "120 KGS", volume: "850", arrivalDate: "15/02/2024", status: "In Storage", type: "Parcel", location: "Zone A, Rack 8" },
  { id: "PCL-04024-4", customer: "Ahmed Hassan", weight: "780 KGS", volume: "3200", arrivalDate: "18/02/2024", status: "Processing", type: "Container", location: "Zone C, Rack 2" },
  { id: "PCL-04025-5", customer: "Sarah Johnson", weight: "95 KGS", volume: "620", arrivalDate: "22/02/2024", status: "In Storage", type: "Parcel", location: "Zone A, Rack 15" },
];

const WarehousePage = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);

  const filteredItems = warehouseItems.filter((item) => {
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    const matchesSearch =
      searchQuery === "" ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusVariant = (status: WarehouseItem["status"]) => {
    switch (status) {
      case "In Storage": return "bg-blue-100 text-blue-800";
      case "Ready for Pickup": return "bg-green-100 text-green-800";
      case "Processing": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleAddItem = () => {
    setShowModal(true);
  };

  // const handleCloseModal = () => {
  //   setShowModal(false);
  // };

  const handleExportCSV = () => {
    const headers = ["ID", "Customer", "Weight", "Volume", "Arrival Date", "Status", "Type", "Location"];
    const rows = filteredItems.map(item => [
      item.id,
      item.customer,
      item.weight,
      item.volume,
      item.arrivalDate,
      item.status,
      item.type,
      item.location
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "warehouse_items.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-2">
                <BackArrow onClick={() => navigate(-1)} />
                <h2 className="text-xl font-semibold">Warehouse Management</h2>
            </div>
        </div>
        
      

      <Tabs defaultValue="storage" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-xs mb-6 bg-gray-100">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="storage" className="data-[state=active]:bg-white">
            Storage Items
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{warehouseItems.length}</div>
                <p className="text-xs text-muted-foreground">
                  {warehouseItems.filter((item) => item.type === "Parcel").length} Parcels,{" "}
                  {warehouseItems.filter((item) => item.type === "Container").length} Containers
                </p>
              </CardContent>
            </Card>

            <Card className="border shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Storage Capacity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">75%</div>
                <Progress value={75} className="h-2 my-2 bg-gray-200" />
                <p className="text-xs text-yellow-500">Warning: Approaching maximum capacity</p>
              </CardContent>
            </Card>

            <Card className="border shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending Pickups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1</div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">Scheduled for today</p>
                  <Truck className="text-muted-foreground" size={14} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="storage">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-lg font-semibold">Warehouse Items</h2>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search items..."
                  className="pl-9 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={handleExportCSV} className="gap-2">
                <FileUp size={14} /> Export
              </Button>
              <Button onClick={handleAddItem} className="gap-2">
                <Plus size={14} /> Add Item
              </Button>
            </div>
          </div>

          <div className="mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-white">
                  Filter by Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white">
                {["All", "In Storage", "Ready for Pickup", "Processing"].map((status, idx) => (
                  <DropdownMenuItem 
                    key={idx} 
                    onClick={() => setStatusFilter(status)}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    {status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-100">
                <TableRow>
                  <TableHead className="font-medium">ID</TableHead>
                  <TableHead className="font-medium">Customer</TableHead>
                  <TableHead className="font-medium">Weight</TableHead>
                  <TableHead className="font-medium">Volume</TableHead>
                  <TableHead className="font-medium">Arrival Date</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="font-medium">Type</TableHead>
                  <TableHead className="font-medium">Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                      No items found matching your filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item, idx) => (
                    <TableRow key={idx} className="hover:bg-gray-50">
                      <TableCell className="py-3">{item.id}</TableCell>
                      <TableCell className="py-3">{item.customer}</TableCell>
                      <TableCell className="py-3">{item.weight}</TableCell>
                      <TableCell className="py-3">{item.volume}</TableCell>
                      <TableCell className="py-3">{item.arrivalDate}</TableCell>
                      <TableCell className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusVariant(item.status)}`}>
                          {item.status}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">{item.type}</TableCell>
                      <TableCell className="py-3">{item.location}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customer" className="text-right">
                Customer Name
              </Label>
              <Input id="customer" placeholder="Enter customer name" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="weight" className="text-right">
                Weight
              </Label>
              <Input id="weight" placeholder="e.g. 230 KGS" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="volume" className="text-right">
                Volume
              </Label>
              <Input id="volume" placeholder="e.g. 1750" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Arrival Date
              </Label>
              <Input id="date" type="date" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In Storage">In Storage</SelectItem>
                  <SelectItem value="Ready for Pickup">Ready for Pickup</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Parcel">Parcel</SelectItem>
                  <SelectItem value="Container">Container</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input id="location" placeholder="e.g. Zone A, Rack 12" className="col-span-3" />
            </div>
            <div className="flex justify-end mt-4">
              <Button type="submit">Save Item</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WarehousePage;