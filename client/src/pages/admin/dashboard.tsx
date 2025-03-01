import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Store } from "@shared/schema";
import StockTable from "@/components/stock/stock-table";
import { Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const { data: stores, isLoading } = useQuery<Store[]>({
    queryKey: ["/api/stores"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2">
        {stores?.map((store) => (
          <Card key={store.id}>
            <CardHeader>
              <CardTitle>{store.name}</CardTitle>
              <CardDescription>{store.location}</CardDescription>
            </CardHeader>
            <CardContent>
              <StockTable storeId={store.id} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
