import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
// import { Badge } from '@/components/ui/badge';

interface FormData {
  originCountry: string;
  originCity: string;
  originZip: string;
  destinationCountry: string;
  destinationCity: string;
  destinationZip: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  shipmentType: 'standard' | 'express';
}

interface QuoteResult {
  price: string;
  currency: string;
  estimatedDays: string;
  services: string[];
}

export function ShippingQuote() {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({
    originCountry: '',
    originCity: '',
    originZip: '',
    destinationCountry: '',
    destinationCity: '',
    destinationZip: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    shipmentType: 'standard',
  });
  const [quoteResult, setQuoteResult] = useState<QuoteResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCalculateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock quote result
    const price = formData.shipmentType === 'express' ? '1,250.00' : '850.00';
    const estimatedDays = formData.shipmentType === 'express' ? '3-5' : '7-10';

    setQuoteResult({
      price,
      currency: 'USD',
      estimatedDays,
      services: [
        'Door-to-door delivery',
        'Customs clearance',
        'Insurance',
        'Tracking',
      ],
    });

    setIsCalculating(false);
    setStep(2);
  };

  const handleReset = () => {
    setFormData({
      originCountry: '',
      originCity: '',
      originZip: '',
      destinationCountry: '',
      destinationCity: '',
      destinationZip: '',
      weight: '',
      length: '',
      width: '',
      height: '',
      shipmentType: 'standard',
    });
    setQuoteResult(null);
    setStep(1);
  };

  return (
    <div className="container py-6">
      {step === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle>Shipping Quote Calculator</CardTitle>
            <CardDescription>Fill in the details to get an estimated shipping cost</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCalculateQuote} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="originCountry">Origin Country</Label>
                  <Select 
                    name="originCountry"
                    value={formData.originCountry}
                    onValueChange={(value) => setFormData({...formData, originCountry: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tanzania">Tanzania</SelectItem>
                      <SelectItem value="kenya">Kenya</SelectItem>
                      <SelectItem value="uganda">Uganda</SelectItem>
                      <SelectItem value="uae">United Arab Emirates</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destinationCountry">Destination Country</Label>
                  <Select 
                    name="destinationCountry"
                    value={formData.destinationCountry}
                    onValueChange={(value) => setFormData({...formData, destinationCountry: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="china">China</SelectItem>
                      <SelectItem value="turkey">Turkey</SelectItem>
                      <SelectItem value="usa">United States</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="originCity">Origin City</Label>
                  <Input
                    type="text"
                    id="originCity"
                    name="originCity"
                    value={formData.originCity}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destinationCity">Destination City</Label>
                  <Input
                    type="text"
                    id="destinationCity"
                    name="destinationCity"
                    value={formData.destinationCity}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="originZip">Origin ZIP Code</Label>
                  <Input
                    type="text"
                    id="originZip"
                    name="originZip"
                    value={formData.originZip}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destinationZip">Destination ZIP Code</Label>
                  <Input
                    type="text"
                    id="destinationZip"
                    name="destinationZip"
                    value={formData.destinationZip}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="pt-4">
                <h4 className="text-lg font-semibold">Package Details</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      type="number"
                      id="weight"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      min="0.1"
                      step="0.1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="length">Length (cm)</Label>
                    <Input
                      type="number"
                      id="length"
                      name="length"
                      value={formData.length}
                      onChange={handleChange}
                      min="1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="width">Width (cm)</Label>
                    <Input
                      type="number"
                      id="width"
                      name="width"
                      value={formData.width}
                      onChange={handleChange}
                      min="1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      type="number"
                      id="height"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      min="1"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <h4 className="text-lg font-semibold">Shipment Type</h4>
                <div className="mt-2 space-y-3">
                    <div 
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => setFormData({...formData, shipmentType: 'standard'})}
                    >
                        <div className={`h-3 w-3 rounded-full ${
                        formData.shipmentType === 'standard' ? 'bg-gray-900' : 'bg-gray-300'
                        }`} />
                        <Label className="text-sm">Standard (7-10 business days)</Label>
                    </div>
                    <div 
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => setFormData({...formData, shipmentType: 'express'})}
                    >
                        <div className={`h-3 w-3 rounded-full ${
                        formData.shipmentType === 'express' ? 'bg-gray-900' : 'bg-gray-300'
                        }`} />
                        <Label className="text-sm">Express (3-5 business days)</Label>
                    </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isCalculating}>
                  {isCalculating ? 'Calculating...' : 'Calculate Quote'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your Shipping Quote</CardTitle>
            <CardDescription>Based on the information you provided</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold">Estimated Price</h4>
                <p className="text-3xl font-bold mt-2">
                  {quoteResult?.currency} {quoteResult?.price}
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold">Estimated Delivery Time</h4>
                <p className="text-3xl font-bold mt-2">{quoteResult?.estimatedDays} business days</p>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold">Included Services</h4>
              <div className="mt-2 space-y-2">
                {quoteResult?.services.map((service, index) => (
                  <div key={index} className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-primary mr-2"></span>
                    <span>{service}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <h4 className="text-lg font-semibold">Quote Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-sm text-muted-foreground">Shipment Type</p>
                  <p className="font-medium capitalize">{formData.shipmentType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quote Valid Until</p>
                  <p className="font-medium">30 days from today</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col md:flex-row justify-between gap-4">
            <Button variant="outline" onClick={handleReset}>
              Get Another Quote
            </Button>
            <Button>Proceed to Booking</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
export default ShippingQuote;