import { useEffect, useState } from "react";
import { Settings as SettingsIcon, Save, Palette, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PageTransition } from "@/components/page-transition";
import { THEMES, applyTheme, getTheme, type ThemeId } from "@/lib/themes";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const settingsSchema = z.object({
  storeName: z.string().min(1, "Store Name is required"),
  currency: z.string().min(1, "Currency is required"),
  taxPercentage: z.coerce.number().min(0).max(100),
  invoiceFooter: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  lowStockThreshold: z.coerce.number().min(1),
});

export default function Settings() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useGetSettings();
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>("midnight");
  const [isSavingTheme, setIsSavingTheme] = useState(false);

  const { mutate: updateSettings, isPending } = useUpdateSettings({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
        toast({ title: "Settings saved successfully" });
      }
    }
  });

  const { mutate: updateTheme } = useUpdateSettings({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
        setIsSavingTheme(false);
        toast({ title: "Theme applied", description: "The new theme is now active for all users." });
      },
      onError: () => {
        setIsSavingTheme(false);
        toast({ title: "Failed to apply theme", variant: "destructive" });
      }
    }
  });

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      storeName: "", currency: "USD", taxPercentage: 0, invoiceFooter: "",
      address: "", phone: "", email: "", lowStockThreshold: 5
    }
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        storeName: settings.storeName,
        currency: settings.currency,
        taxPercentage: settings.taxPercentage,
        invoiceFooter: settings.invoiceFooter || "",
        address: settings.address || "",
        phone: settings.phone || "",
        email: settings.email || "",
        lowStockThreshold: settings.lowStockThreshold || 5,
      });
      const t = (settings as any).theme ?? "midnight";
      setSelectedTheme(t as ThemeId);
    }
  }, [settings, form]);

  const onSubmit = (values: z.infer<typeof settingsSchema>) => {
    updateSettings({ data: values });
  };

  const handleThemeSelect = (themeId: ThemeId) => {
    setSelectedTheme(themeId);
    applyTheme(getTheme(themeId));
  };

  const handleSaveTheme = () => {
    setIsSavingTheme(true);
    updateTheme({ data: { theme: selectedTheme } as any });
  };

  return (
    <PageTransition className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-primary" /> Store Settings
        </h1>
        <p className="text-muted-foreground mt-1">Configure global application preferences.</p>
      </div>

      {/* Theme Picker Card */}
      <Card className="rounded-2xl border-border/50 shadow-md">
        <CardHeader className="bg-muted/20 border-b border-border/50">
          <div className="flex items-center gap-3">
            <Palette className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Application Theme</CardTitle>
              <CardDescription>Choose a color palette — applies instantly to all users.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {THEMES.map(theme => {
                  const isActive = selectedTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => handleThemeSelect(theme.id as ThemeId)}
                      className={cn(
                        "relative group text-left p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
                        isActive
                          ? "border-primary shadow-lg shadow-primary/20"
                          : "border-border/50 hover:border-border bg-muted/20 hover:bg-muted/40"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        {theme.preview.map((color, i) => (
                          <div
                            key={i}
                            className="h-5 rounded-full"
                            style={{
                              backgroundColor: color,
                              width: i === 0 ? "40%" : i === 1 ? "30%" : "30%",
                            }}
                          />
                        ))}
                      </div>
                      <p className="font-semibold text-sm text-foreground">{theme.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{theme.description}</p>
                      {isActive && (
                        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                  Currently previewing: <span className="font-medium text-foreground capitalize">{selectedTheme}</span>
                </p>
                <Button
                  onClick={handleSaveTheme}
                  disabled={isSavingTheme || (settings as any)?.theme === selectedTheme}
                  className="shadow-md shadow-primary/20 rounded-xl"
                >
                  {isSavingTheme ? "Applying..." : "Apply Theme"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* General Settings Card */}
      {isLoading ? (
        <Card className="rounded-2xl border-border/50">
          <CardContent className="p-8 space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl border-border/50 shadow-md">
          <CardHeader className="bg-muted/20 border-b border-border/50">
            <CardTitle>General Configuration</CardTitle>
            <CardDescription>These details appear on receipts and the main dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="storeName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Name</FormLabel>
                      <FormControl><Input className="bg-background/50 h-11" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="currency" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency Code</FormLabel>
                      <FormControl><Input className="bg-background/50 h-11" placeholder="USD, EUR..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="taxPercentage" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Tax (%)</FormLabel>
                      <FormControl><Input type="number" step="0.01" className="bg-background/50 h-11" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="lowStockThreshold" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Low Stock Alert Threshold</FormLabel>
                      <FormControl><Input type="number" className="bg-background/50 h-11" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Phone</FormLabel>
                      <FormControl><Input className="bg-background/50 h-11" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Email</FormLabel>
                      <FormControl><Input className="bg-background/50 h-11" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Store Address</FormLabel>
                      <FormControl><Input className="bg-background/50 h-11" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="invoiceFooter" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Receipt Footer Message</FormLabel>
                      <FormControl><Input className="bg-background/50 h-11" placeholder="Thank you for shopping with us!" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                
                <div className="flex justify-end pt-4 border-t border-border/50">
                  <Button type="submit" size="lg" disabled={isPending} className="shadow-xl shadow-primary/20 rounded-xl px-8">
                    {isPending ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </PageTransition>
  );
}
