'use client';
import { useState, useEffect } from 'react';

import { useToast } from '@/hooks/use-toast';
import api from '@/utils/api';
import { ParcelTable } from './table';
import type { Parcel } from './type'

// type Parcel = {
//   parcel_no: string;
//   shipment?: { shipment_no: string; status: 'In-transit' | 'Delivered' };
//   customer?: { name: string };
//   weight: number;
//   destination: string;
//   status: 'In-transit' | 'Delivered' | 'Pending';
//   created_at: string;
//   updated_at: string;
// };


export const ParcelTablePage = ({
  customerId,
  shipmentId,
}: {
  customerId?: string;
  shipmentId?: string;
}) => {
  const { toast } = useToast();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'All' | 'In-transit' | 'Delivered' | 'Pending'>('All');
  

  useEffect(() => {
    const fetchParcels = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('access_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const url = new URL('/parcels/', 'http://127.0.0.1:8000/api');
        if (customerId) url.searchParams.set('customer', customerId);
        if (shipmentId) url.searchParams.set('shipment', shipmentId);

        const res = await api.get(url.pathname + url.search, { headers });
        const data = res.data as Parcel[] | { results: Parcel[] };

        setParcels(Array.isArray(data) ? data : data?.results || []);
      } catch (err: any) {
        console.error('Failed to fetch parcels:', err);
        setError(err?.response?.data?.detail || 'Failed to load parcels');
        toast({
          title: 'Error',
          description: 'Failed to load parcels',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchParcels();
  }, [customerId, shipmentId, toast]);

  if (isLoading) return <p>Loading parcels...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="border rounded-lg overflow-hidden mt-4">
        <ParcelTable
           parcels={parcels}
          searchQuery=""               // dummy
          onSearchChange={() => {}}     // dummy
          onDeleteClick={() => {}}     // dummy
          onExportCSV={() => {}}       // dummy
          onCreateClick={() => {}}     // dummy
          count={parcels.length}       // dummy
          currentPage={1}              // dummy
          totalPages={1}               // dummy
          onPageChange={() => {}}      // dummy
          prevPage={null}              // dummy
          nextPage={null}              // dummy
          filter={filter}
          setFilter={setFilter}
          onView={(p) => console.log('view', p)}
          onEdit={(p) => console.log('edit', p)}
          onDelete={(p) => console.log('delete', p)}
        />
      </div>
    </div>
  );
};

export default ParcelTablePage;
