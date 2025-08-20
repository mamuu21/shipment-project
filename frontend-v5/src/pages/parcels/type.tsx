export interface Parcel {
  parcel_no: string;
  shipment_vessel?: string;
  shipment_status?: string;
  customer_id?: string;
  weight?: number | '';
  weight_unit?: string;
  volume?: number | '';
  volume_unit?: string;
  charge?: number | '';
  payment?: string;
  commodity_type?: string;
  description?: string;
  shipment?: { shipment_no: string; status: 'In-transit' | 'Delivered' };
  customer?: { id: string; name?: string };
}
