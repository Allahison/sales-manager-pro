import { useState, useMemo } from "react";
import { Search, ShoppingCart, Minus, Plus, Trash2, CreditCard, Banknote, Landmark, X, Package } from "lucide-react";
import { useListProducts, useCreateOrder, type Product } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { PageTransition } from "@/components/page-transition";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface CartItem extends Product {
  cartQuantity: number;
}

export default function POS() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "transfer">("cash");

  const { data: products = [], isLoading } = useListProducts({ search });
  const { mutate: createOrder, isPending: isCheckingOut } = useCreateOrder({
    mutation: {
      onSuccess: () => {
        toast({ title: "Sale completed successfully!" });
        setCart([]);
        setDiscount(0);
      },
      onError: (err) => {
        let description = err.message || "Unknown error";
        const data = err.data;
        if (
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof (data as { error?: unknown }).error === "string"
        ) {
          description = (data as { error: string }).error;
        }
        toast({
          title: "Failed to complete sale",
          description,
          variant: "destructive",
        });
      }
    }
  });

  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map(p => p.category)))], [products]);
  
  const filteredProducts = useMemo(() => {
    if (category === "All") return products;
    return products.filter(p => p.category === category);
  }, [products, category]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast({ title: "Out of stock", variant: "destructive" });
      return;
    }
    
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.cartQuantity >= product.stock) {
          toast({ title: "Maximum stock reached", variant: "destructive" });
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item);
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.cartQuantity + delta;
        if (newQ > item.stock) {
          toast({ title: "Maximum stock reached", variant: "destructive" });
          return item;
        }
        return { ...item, cartQuantity: Math.max(1, newQ) };
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);
  const total = Math.max(0, subtotal - discount);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    createOrder({
      data: {
        paymentMethod,
        discount,
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.cartQuantity,
          price: item.price
        }))
      }
    });
  };

  return (
    <PageTransition className="h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-6">
      
      {/* LEFT: Product Grid */}
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        {/* Search & Filter Header */}
        <div className="bg-card p-4 rounded-2xl border border-border/50 shadow-sm mb-4 flex flex-col sm:flex-row gap-4 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Search products, barcode..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 bg-background/50 border-border rounded-xl text-base"
            />
            {search && (
              <Button size="icon" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setSearch("")}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {categories.map(cat => (
              <Badge 
                key={cat}
                variant={category === cat ? "default" : "outline"}
                className={`px-4 py-2 text-sm cursor-pointer whitespace-nowrap rounded-lg ${category !== cat ? 'hover:bg-muted bg-background/50' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </div>

        {/* Grid */}
        <ScrollArea className="flex-1 pr-4 -mr-4">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
              {filteredProducts.map(product => (
                <Card 
                  key={product.id} 
                  className={`cursor-pointer overflow-hidden group hover:border-primary/50 transition-all duration-300 rounded-2xl border-border/50 shadow-sm ${product.stock <= 0 ? 'opacity-50 grayscale' : 'hover-elevate-2'}`}
                  onClick={() => addToCart(product)}
                >
                  <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                    {/* Placeholder image from unsplash if product.image is missing */}
                    {/* product placeholder abstract */}
                    <img 
                      src={product.image || `https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=80`} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 text-white">
                      <span className="font-bold text-lg leading-none block">${product.price.toFixed(2)}</span>
                    </div>
                  </div>
                  <CardContent className="p-4 pt-3">
                    <h3 className="font-semibold text-sm line-clamp-2 leading-tight mb-2 text-foreground">{product.name}</h3>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xs text-muted-foreground truncate max-w-[60%]">{product.category}</span>
                      <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 rounded ${product.stock <= 5 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                        {product.stock} in stock
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground pb-20">
              <Package className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg">No products found</p>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* RIGHT: Cart Panel */}
      <div className="w-full lg:w-[400px] shrink-0 flex flex-col bg-card rounded-2xl border border-border/50 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-border/50 bg-muted/20 flex items-center justify-between shrink-0">
          <h2 className="font-display font-bold text-lg flex items-center gap-2 text-foreground">
            <ShoppingCart className="w-5 h-5 text-primary" /> Current Sale
          </h2>
          {cart.length > 0 && (
            <Badge variant="secondary" className="rounded-full w-6 h-6 flex items-center justify-center p-0 font-bold bg-primary text-primary-foreground">
              {cart.reduce((s,i)=>s+i.cartQuantity, 0)}
            </Badge>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
              <ShoppingCart className="w-12 h-12 mb-3" />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden shrink-0">
                  <img src={item.image || `https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=100&q=80`} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-medium text-sm leading-tight text-foreground line-clamp-2">{item.name}</h4>
                    <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-destructive shrink-0 mt-0.5">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-sm text-primary">${(item.price * item.cartQuantity).toFixed(2)}</span>
                    <div className="flex items-center bg-background border border-border rounded-lg h-7 overflow-hidden">
                      <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-full flex items-center justify-center hover:bg-muted text-muted-foreground"><Minus className="w-3 h-3" /></button>
                      <span className="w-8 text-center text-xs font-medium text-foreground">{item.cartQuantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-full flex items-center justify-center hover:bg-muted text-muted-foreground"><Plus className="w-3 h-3" /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-5 bg-background border-t border-border/50 shrink-0 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Discount</span>
              <div className="w-24 relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input 
                  type="number" 
                  min="0"
                  className="h-8 pl-6 text-right rounded-lg bg-card" 
                  value={discount || ""} 
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} 
                />
              </div>
            </div>
            <Separator className="my-2 bg-border/50" />
            <div className="flex justify-between items-end">
              <span className="font-bold text-foreground">Total</span>
              <span className="text-3xl font-display font-bold text-primary">${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant={paymentMethod === 'cash' ? 'default' : 'outline'} 
              className={`h-12 flex flex-col gap-1 rounded-xl ${paymentMethod === 'cash' ? 'bg-primary shadow-lg shadow-primary/25' : 'bg-card'}`}
              onClick={() => setPaymentMethod('cash')}
            >
              <Banknote className="w-4 h-4" /> <span className="text-[10px]">Cash</span>
            </Button>
            <Button 
              variant={paymentMethod === 'card' ? 'default' : 'outline'} 
              className={`h-12 flex flex-col gap-1 rounded-xl ${paymentMethod === 'card' ? 'bg-primary shadow-lg shadow-primary/25' : 'bg-card'}`}
              onClick={() => setPaymentMethod('card')}
            >
              <CreditCard className="w-4 h-4" /> <span className="text-[10px]">Card</span>
            </Button>
            <Button 
              variant={paymentMethod === 'transfer' ? 'default' : 'outline'} 
              className={`h-12 flex flex-col gap-1 rounded-xl ${paymentMethod === 'transfer' ? 'bg-primary shadow-lg shadow-primary/25' : 'bg-card'}`}
              onClick={() => setPaymentMethod('transfer')}
            >
              <Landmark className="w-4 h-4" /> <span className="text-[10px]">Transfer</span>
            </Button>
          </div>

          <Button 
            className="w-full h-14 text-lg font-bold rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/30" 
            disabled={cart.length === 0 || isCheckingOut}
            onClick={handleCheckout}
          >
            {isCheckingOut ? "Processing..." : "Charge"}
          </Button>
        </div>
      </div>
      
    </PageTransition>
  );
}
