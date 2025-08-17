import React, { useState, type FormEvent } from "react";
import { Search, Package, Truck, Ship, Plane } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';


interface Update {
  date: string;
  status: string;
  location: string;
}

interface SearchResult {
  id: string;
  status: string;
  origin: string;
  destination: string;
  carrier: string;
  type: string;
  updates: Update[];
}

export default function TrackShipment() {
  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [activeTab, setActiveTab] = useState<"tracking" | "reference">("tracking");

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!trackingNumber) return;

    setIsSearching(true);

    await new Promise((r) => setTimeout(r, 1000));

    const upper = trackingNumber.toUpperCase();
    if (upper === "SHP-001" || upper === "SHP-002") {
      setSearchResult({
        id: upper,
        status: upper === "SHP-001" ? "Delivered" : "In-transit",
        origin: "Dar es salaam, Tanzania",
        destination: upper === "SHP-001" ? "Turkey" : "China",
        carrier: upper === "SHP-001" ? "Hapag-Lloyd" : "KLM Cargo",
        type: upper === "SHP-001" ? "Sea" : "Air",
        updates: [
          {
            date: "10/04/2023",
            status: upper === "SHP-001" ? "Delivered" : "In-transit",
            location: upper === "SHP-001" ? "Turkey" : "Dubai, UAE",
          },
          {
            date: "05/04/2023",
            status: "Customs cleared",
            location: upper === "SHP-001" ? "Turkey" : "Dubai, UAE",
          },
          {
            date: "01/04/2023",
            status: "Departed",
            location: "Dar es salaam, Tanzania",
          },
          {
            date: "28/03/2023",
            status: "Processing",
            location: "Dar es salaam, Tanzania",
          },
        ],
      });
    } else {
      setSearchResult(null);
    }
    setIsSearching(false);
  };

  function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-500";
      case "in-transit":
        return "bg-blue-500";
      case "customs cleared":
        return "bg-yellow-400";
      case "departed":
        return "bg-teal-400";
      default:
        return "bg-gray-400";
    }
  }

  function getTransportIcon(type: string) {
    switch (type.toLowerCase()) {
      case "sea":
        return <Ship className="inline-block mr-1" size={20} />;
      case "air":
        return <Plane className="inline-block mr-1" size={20} />;
      default:
        return <Truck className="inline-block mr-1" size={20} />;
    }
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h2 className="text-2xl font-bold mb-6">Track Shipment</h2>

      <div className="bg-white rounded-md shadow p-6 mb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 border-b border-gray-200">
            <TabsTrigger value="tracking">Tracking Number</TabsTrigger>
            <TabsTrigger value="reference">Reference Number</TabsTrigger>
          </TabsList>

          <TabsContent value="tracking">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Enter tracking number (e.g., SHP-001)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                leftIcon={<Search size={16} />}
                className="flex-grow"
              />
              <Button type="submit" disabled={isSearching || !trackingNumber}>
                {isSearching ? "Searching..." : "Track"}
              </Button>
            </form>
            <p className="text-sm text-muted-foreground mt-2">
              Try using <code className="font-mono">SHP-001</code> or <code className="font-mono">SHP-002</code> for demo purposes
            </p>
          </TabsContent>

          <TabsContent value="reference">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Enter reference number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                leftIcon={<Search size={16} />}
                className="flex-grow"
              />
              <Button type="submit" disabled={isSearching || !trackingNumber}>
                {isSearching ? "Searching..." : "Track"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>

      {searchResult ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="max-w-md mx-auto">
            <Card>
                <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    Shipment Information
                </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <p>
                        <strong>Tracking Number:</strong> {searchResult.id}
                    </p>
                    <p className="flex items-center gap-2">
                        <strong>Status:</strong>
                        <span className={`inline-block rounded px-2 py-1 text-xs font-semibold text-white ${getStatusColor(searchResult.status)}`}>
                        {searchResult.status}
                        </span>
                    </p>
                    <p className="flex items-center gap-2">
                        <strong>Carrier:</strong> {getTransportIcon(searchResult.type)} {searchResult.carrier} ({searchResult.type})
                    </p>
                    <p>
                        <strong>Route:</strong> {searchResult.origin} → {searchResult.destination}
                    </p>
                    </CardContent>

            </Card>
            </div>


          <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                <CardTitle className="text-lg font-semibold">Tracking History</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="space-y-4 relative">
                    <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200" />
                    {searchResult.updates.map((update, idx) => (
                    <div key={idx} className="relative pl-8">
                        <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-primary" />
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <h4 className="text-sm font-medium leading-none">
                            {update.status}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                            {update.date}
                        </p>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                        {update.location}
                        </p>
                    </div>
                    ))}
                </div>
                </CardContent>
            </Card>
          </div>
        </div>
      ) : trackingNumber && !isSearching ? (
        <div className="bg-white rounded-md shadow p-6 text-center">
          <Package className="mx-auto text-gray-400 mb-4" size={48} />
          <h5 className="text-lg font-semibold mb-2">No shipment found</h5>
          <p className="text-gray-500">
            We couldn't find any shipment with the tracking number <code className="font-mono">{trackingNumber}</code>. Please check the number and try again.
          </p>
        </div>
      ) : null}
    </div>
  );
}
