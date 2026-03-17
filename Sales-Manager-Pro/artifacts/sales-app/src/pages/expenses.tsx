import { useState } from "react";
import { format } from "date-fns";
import { Plus, CreditCard, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useListExpenses, 
  useCreateExpense, 
  useDeleteExpense,
  getListExpensesQueryKey
} from "@workspace/api-client-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PageTransition } from "@/components/page-transition";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const expenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.coerce.number().min(0.01, "Amount must be > 0"),
  category: z.string().optional(),
  date: z.string().min(1, "Date is required"),
});

export default function Expenses() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: expenses, isLoading } = useListExpenses();
  
  const { mutate: createExpense, isPending } = useCreateExpense({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListExpensesQueryKey() });
        setIsDialogOpen(false);
        toast({ title: "Expense recorded" });
      }
    }
  });

  const { mutate: deleteExpense } = useDeleteExpense({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListExpensesQueryKey() });
        toast({ title: "Expense removed" });
      }
    }
  });

  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { title: "", amount: 0, category: "Operations", date: new Date().toISOString().split('T')[0] }
  });

  const onSubmit = (values: z.infer<typeof expenseSchema>) => {
    createExpense({ data: values });
  };

  const totalExpenses = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;

  return (
    <PageTransition className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Expenses</h1>
          <p className="text-muted-foreground mt-1">Track store operational costs.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-card px-4 py-2 rounded-xl border border-border/50 text-right">
            <span className="text-xs text-muted-foreground block uppercase tracking-wider">Total</span>
            <span className="font-bold text-destructive">${totalExpenses.toFixed(2)}</span>
          </div>
          <Button onClick={() => {form.reset(); setIsDialogOpen(true);}} className="shadow-lg shadow-primary/20 rounded-xl h-12">
            <Plus className="w-4 h-4 mr-2" /> Add Expense
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [1,2,3].map(i => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 mx-auto" /></TableCell>
                  </TableRow>
                ))
              ) : expenses?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                    <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    No expenses recorded.
                  </TableCell>
                </TableRow>
              ) : (
                expenses?.map(expense => (
                  <TableRow key={expense.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="text-muted-foreground">{format(new Date(expense.date), "MMM d, yyyy")}</TableCell>
                    <TableCell className="font-medium text-foreground">{expense.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-background/50 font-normal">{expense.category || "General"}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-destructive">${expense.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="icon" onClick={() => confirm("Delete this expense?") && deleteExpense({ id: expense.id })} className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] border-border bg-card/95 backdrop-blur-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle>Record Expense</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Input placeholder="Office supplies..." className="bg-background/50" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount ($)</FormLabel>
                  <FormControl><Input type="number" step="0.01" className="bg-background/50" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl><Input placeholder="Operations, Utility, etc." className="bg-background/50" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl><Input type="date" className="bg-background/50" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isPending} className="shadow-md shadow-primary/20">
                  {isPending ? "Saving..." : "Save Expense"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
