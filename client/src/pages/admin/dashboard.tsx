import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Store } from "@shared/schema";
import StockTable from "@/components/stock/stock-table";
import { Button } from "@/components/ui/button";
import { Loader2, Database } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { toast } = useToast();
  const { data: stores, isLoading } = useQuery<Store[]>({
    queryKey: ["/api/stores"],
  });

  const initDataMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/dev/init");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      toast({
        title: "Success",
        description: "Test data has been initialized successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        {(!stores || stores.length === 0) && (
          <Button
            onClick={() => initDataMutation.mutate()}
            disabled={initDataMutation.isPending}
          >
            {initDataMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Database className="mr-2 h-4 w-4" />
            )}
            Initialize Test Data
          </Button>
        )}
      </div>

      {stores?.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No stores found. Click the button above to initialize test data.
            </p>
          </CardContent>
        </Card>
      ) : (
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
      )}
    </div>
  );
}