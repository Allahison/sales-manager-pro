import { useState } from "react";
import { Package, AlertTriangle } from "lucide-react";
import { useListProducts, useUpdateProductStock, getListProductsQueryKey } from "@workspace/api-client-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PageTransition } from "@/components/page-transition";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Inventory() {
  const { toast } = useToast();
  const { data: products, isLoading } = useListProducts();
  const [stockUpdates, setStockUpdates] = useState<Record<number, string>>({});

  const { mutate: updateStock, isPending } = useUpdateProductStock({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        setStockUpdates({});
        toast({ title: "Stock updated successfully" });
      }
    }
  });

  const handleUpdateStock = (id: number) => {
    const val = parseInt(stockUpdates[id]);
    if (isNaN(val)) return;
    updateStock({ id, data: { stock: val } });
  };

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
          <Package className="w-8 h-8 text-primary" /> Inventory Management
        </h1>
        <p className="text-muted-foreground mt-1">Quickly monitor and adjust product stock levels.</p>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
                <TableHead className="text-right w-48">Update Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [1,2,3,4,5].map(i => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 mx-auto rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                  </TableRow>
                ))
              ) : products?.map(product => (
                <TableRow key={product.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium text-foreground">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground">{product.category}</TableCell>
                  <TableCell className="text-center">
                    {product.stock <= 0 ? (
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30"><AlertTriangle className="w-3 h-3 mr-1"/> Out of Stock</Badge>
                    ) : product.stock <= 5 ? (
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30"><AlertTriangle className="w-3 h-3 mr-1"/> Low Stock</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">In Stock</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-bold text-lg text-foreground">{product.stock}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Input 
                        type="number" 
                        min="0"
                        className="w-20 bg-background/50 h-9" 
                        placeholder={product.stock.toString()}
                        value={stockUpdates[product.id] ?? ""}
                        onChange={(e) => setStockUpdates(prev => ({...prev, [product.id]: e.target.value}))}
                      />
                      <Button 
                        size="sm" 
                        onClick={() => handleUpdateStock(product.id)}
                        disabled={!stockUpdates[product.id] || isPending}
                      >
                        Set
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageTransition>
  );
}
