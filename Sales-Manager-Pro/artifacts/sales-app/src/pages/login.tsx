import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Store, Loader2, Lock, Mail } from "lucide-react";
import { useLogin, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PageTransition } from "@/components/page-transition";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { mutate: login, isPending } = useLogin({
    mutation: {
      onSuccess: (data) => {
        // Store auth token in localStorage
        if (data.token) {
          window.localStorage.setItem("auth_token", data.token);
        }
        queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
        toast({ title: `Welcome back, ${data.user.name}` });
        setLocation("/");
      },
      onError: (error) => {
        let description = error.message || "Invalid credentials";
        const data = error.data;
        if (
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof (data as { error?: unknown }).error === "string"
        ) {
          description = (data as { error: string }).error;
        }
        toast({
          title: "Login failed",
          description,
          variant: "destructive",
        });
      }
    }
  });

  const onSubmit = (values: LoginFormValues) => {
    login({ data: values });
  };

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground overflow-hidden">
      {/* Left side: Brand/Image */}
      <div className="hidden lg:flex w-1/2 relative bg-card items-center justify-center border-r border-border/50">
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/login-bg.png`} 
            alt="Enterprise abstract mesh" 
            className="w-full h-full object-cover opacity-60 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center text-center px-12 max-w-lg">
          <div className="w-20 h-20 bg-primary/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-8 border border-primary/30 shadow-2xl shadow-primary/20">
            <Store className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-display font-bold tracking-tight mb-4 text-white">NEXUS Enterprise POS</h1>
          <p className="text-lg text-muted-foreground">
            A comprehensive, high-performance point of sale and inventory management system for modern retailers.
          </p>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <PageTransition className="w-full max-w-md">
          <div className="bg-card/50 backdrop-blur-xl p-8 rounded-3xl border border-border/50 shadow-2xl shadow-black/40">
            <div className="flex flex-col items-center mb-8 lg:items-start text-center lg:text-left">
              <div className="lg:hidden w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-6 border border-primary/30">
                <Store className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-3xl font-display font-bold tracking-tight text-foreground">Welcome back</h2>
              <p className="text-muted-foreground mt-2">Enter your credentials to access your account</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                          <Input 
                            placeholder="admin@nexus.com" 
                            className="pl-12 h-14 bg-background/50 border-border focus:border-primary focus:ring-primary/20 rounded-xl text-lg transition-all"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground flex justify-between">
                        Password
                        <a href="#" className="text-primary hover:text-primary/80 text-sm">Forgot?</a>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            className="pl-12 h-14 bg-background/50 border-border focus:border-primary focus:ring-primary/20 rounded-xl text-lg transition-all"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-14 text-lg rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all font-semibold"
                  disabled={isPending}
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" /> Signing in...
                    </span>
                  ) : "Sign in securely"}
                </Button>
                
                <div className="text-center text-sm text-muted-foreground mt-6">
                  <p>Admin: admin@store.com / admin123</p>
                  <p>Staff: john@store.com / sales123</p>
                </div>
              </form>
            </Form>
          </div>
        </PageTransition>
      </div>
    </div>
  );
}
