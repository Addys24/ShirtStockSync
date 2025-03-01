import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Store, Stock, Product } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stock: (Stock & { product: Product }) | null;
  fromStoreId: number;
}

const transferSchema = z.object({
  toStoreId: z.string().transform(Number),
  quantity: z.string()
    .transform(Number)
    .refine((n) => n > 0, "Quantity must be greater than 0"),
});

export function TransferDialog({
  open,
  onOpenChange,
  stock,
  fromStoreId,
}: TransferDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof transferSchema>>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      toStoreId: "",
      quantity: "",
    },
  });

  const { data: stores } = useQuery<Store[]>({
    queryKey: ["/api/stores"],
  });

  const transferMutation = useMutation({
    mutationFn: async (data: z.infer<typeof transferSchema>) => {
      const res = await apiRequest("POST", "/api/transfers", {
        productId: stock?.productId,
        fromStoreId,
        toStoreId: data.toStoreId,
        quantity: data.quantity,
        status: "pending",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/stock/${fromStoreId}`] });
      toast({
        title: "Transfer initiated",
        description: "The stock transfer has been started successfully.",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Transfer failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  async function onSubmit(data: z.infer<typeof transferSchema>) {
    if (!stock) return;
    setIsSubmitting(true);
    try {
      await transferMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!stock) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer Stock</DialogTitle>
          <DialogDescription>
            Transfer {stock.product.name} ({stock.product.color}, Size {stock.product.size})
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="toStoreId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To Store</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select store" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {stores
                        ?.filter((store) => store.id !== fromStoreId)
                        .map((store) => (
                          <SelectItem
                            key={store.id}
                            value={store.id.toString()}
                          >
                            {store.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max={stock.quantity}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Transfer Stock
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
