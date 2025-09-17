import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="p-6 shadow-lg rounded-2xl max-w-md w-full text-center">
        <CardContent>
          <h1 className="text-3xl font-bold mb-4">Welcome to CargoPro</h1>
          <p className="text-gray-600 mb-6">
            Your all-in-one shipment tracking and management solution.
          </p>
          <Button
            onClick={() => navigate("/login")}
            className="w-full text-lg rounded-xl"
          >
            Get Started
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
