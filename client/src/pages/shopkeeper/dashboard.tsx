import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Store } from "@shared/schema";
import StockTable from "@/components/stock/stock-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function ShopkeeperDashboard() {
  const { user } = useAuth();
  const { data: store, isLoading } = useQuery<Store>({
    queryKey: [`/api/stores/${user?.storeId}`],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!store) return null;

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Store Dashboard</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>{store.name}</CardTitle>
          <CardDescription>{store.location}</CardDescription>
        </CardHeader>
        <CardContent>
          <StockTable storeId={store.id} />
        </CardContent>
      </Card>
    </div>
  );
}
