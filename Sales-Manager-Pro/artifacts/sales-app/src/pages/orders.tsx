import { useState } from "react";
import { format } from "date-fns";
import { Box, Eye, RefreshCcw } from "lucide-react";
import { 
  useListOrders, 
  useGetOrder,
  useRefundOrder,
  getGetOrderQueryKey,
  getListOrdersQueryKey,
} from "@workspace/api-client-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { PageTransition } from "@/components/page-transition";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Orders() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const { data: orders, isLoading } = useListOrders();
  const { data: orderDetails, isLoading: isLoadingDetails } = useGetOrder(selectedOrderId || 0, {
    query: { queryKey: getGetOrderQueryKey(selectedOrderId || 0), enabled: !!selectedOrderId }
  });

  const { mutate: refundOrder, isPending: isRefunding } = useRefundOrder({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
        setSelectedOrderId(null);
        toast({ title: "Order refunded successfully" });
      }
    }
  });

  const handleRefund = (id: number) => {
    if (confirm("Are you sure you want to refund this order? Stock will be restored.")) {
      refundOrder({ id });
    }
  };

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Sales History</h1>
        <p className="text-muted-foreground mt-1">View past orders and manage refunds.</p>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [1,2,3,4,5].map(i => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 mx-auto rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 mx-auto" /></TableCell>
                  </TableRow>
                ))
              ) : orders?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                    <Box className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                orders?.map(order => (
                  <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell className="text-muted-foreground">{format(new Date(order.createdAt), "MMM d, yyyy h:mm a")}</TableCell>
                    <TableCell>{order.customerName || "Walk-in"}</TableCell>
                    <TableCell className="capitalize text-muted-foreground">{order.paymentMethod}</TableCell>
                    <TableCell className="text-right font-bold text-foreground">${order.totalPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={`${order.status === 'completed' ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10' : 'text-amber-500 border-amber-500/30 bg-amber-500/10'}`}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedOrderId(order.id)} className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!selectedOrderId} onOpenChange={(open) => !open && setSelectedOrderId(null)}>
        <DialogContent className="sm:max-w-[500px] border-border bg-card/95 backdrop-blur-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle>Order Details #{selectedOrderId}</DialogTitle>
          </DialogHeader>
          
          {isLoadingDetails ? (
            <div className="py-10 flex justify-center"><Skeleton className="h-32 w-full" /></div>
          ) : orderDetails ? (
            <div className="space-y-6 py-4">
              <div className="flex justify-between items-center bg-muted/30 p-4 rounded-xl border border-border/50">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium text-foreground">{orderDetails.customerName || "Walk-in Customer"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium text-foreground">{format(new Date(orderDetails.createdAt), "MMM d, yyyy h:mm a")}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3 text-foreground">Items</h4>
                <div className="space-y-3">
                  {orderDetails.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-primary/10 text-primary">{item.quantity}x</Badge>
                        <span className="text-foreground">{item.productName || `Product #${item.productId}`}</span>
                      </div>
                      <span className="text-muted-foreground">${item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border/50 pt-4 space-y-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Payment Method</span>
                  <span className="capitalize">{orderDetails.paymentMethod}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-foreground pt-2">
                  <span>Total</span>
                  <span className="text-primary">${orderDetails.totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {isAdmin && orderDetails.status === 'completed' && (
                <div className="pt-4 border-t border-border/50">
                  <Button 
                    variant="destructive" 
                    className="w-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-white"
                    onClick={() => handleRefund(orderDetails.id)}
                    disabled={isRefunding}
                  >
                    <RefreshCcw className="w-4 h-4 mr-2" /> Refund Order
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
