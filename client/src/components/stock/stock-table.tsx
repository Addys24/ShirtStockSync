import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Stock, Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import { TransferDialog } from "./transfer-dialog";
import { useState } from "react";

interface StockTableProps {
  storeId: number;
}

export default function StockTable({ storeId }: StockTableProps) {
  const [transferProduct, setTransferProduct] = useState<
    (Stock & { product: Product }) | null
  >(null);

  const { data: stock, isLoading } = useQuery<(Stock & { product: Product })[]>({
    queryKey: [`/api/stock/${storeId}`],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!stock?.length) {
    return <div className="text-center py-4">No stock available</div>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Color</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stock.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                {item.product.name}
              </TableCell>
              <TableCell>{item.product.size}</TableCell>
              <TableCell>{item.product.color}</TableCell>
              <TableCell className="font-mono">{item.quantity}</TableCell>
              <TableCell className="text-right">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setTransferProduct(item)}
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TransferDialog
        open={!!transferProduct}
        onOpenChange={() => setTransferProduct(null)}
        stock={transferProduct}
        fromStoreId={storeId}
      />
    </>
  );
}
