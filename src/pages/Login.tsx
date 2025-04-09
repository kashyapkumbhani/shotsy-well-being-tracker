
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useShotsy } from "@/contexts/ShotsyContext";
import { ArrowRight, UserCheck, UserPlus, Mail, Lock, UserCircle2 } from "lucide-react";

const Login: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setLoggedIn } = useShotsy();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      if (email && password) {
        // Store the login status in localStorage
        localStorage.setItem("shotsy_logged_in", "true");
        localStorage.setItem("shotsy_user_email", email);
        
        // Update context
        setLoggedIn(true);
        
        toast({
          title: "Login successful",
          description: "Welcome back to Shotsy!",
        });
        
        navigate("/");
      } else {
        toast({
          title: "Login failed",
          description: "Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    }, 1000);
  };

  // Handle signup
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      if (email && password && name) {
        // Store the login status in localStorage
        localStorage.setItem("shotsy_logged_in", "true");
        localStorage.setItem("shotsy_user_email", email);
        localStorage.setItem("shotsy_user_name", name);
        
        // Update context
        setLoggedIn(true);
        
        toast({
          title: "Account created",
          description: "Welcome to Shotsy! Your health journey starts now.",
        });
        
        navigate("/");
      } else {
        toast({
          title: "Signup failed",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
      }
    }, 1000);
  };

  // Skip login (continue as guest)
  const handleSkip = () => {
    toast({
      title: "Using Shotsy as guest",
      description: "Your data will be stored locally on this device.",
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-shotsy-gradient flex flex-col justify-center items-center p-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-shotsy-800 mb-2">Shotsy</h1>
          <p className="text-shotsy-600">Your personal GLP-1 medication tracker</p>
        </div>
        
        <Card className="w-full bg-white/80 backdrop-blur-sm border-shotsy-100 shadow-lg">
          <Tabs defaultValue="login" className="w-full">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" className="data-[state=active]:bg-shotsy-50 data-[state=active]:text-shotsy-800">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-shotsy-50 data-[state=active]:text-shotsy-800">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </TabsTrigger>
              </TabsList>
              <CardDescription className="text-center pt-4">
                Track your GLP-1 medication journey with ease
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-shotsy-400" />
                        <Input 
                          id="email" 
                          placeholder="name@example.com" 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Button type="button" variant="link" className="h-auto p-0 text-xs text-shotsy-500">
                          Forgot password?
                        </Button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-shotsy-400" />
                        <Input 
                          id="password" 
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox 
                        id="remember" 
                        checked={remember} 
                        onCheckedChange={(checked) => setRemember(checked as boolean)}
                      />
                      <label
                        htmlFor="remember"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Remember me
                      </label>
                    </div>
                    <Button type="submit" disabled={isLoading} className="bg-shotsy-500 hover:bg-shotsy-600">
                      {isLoading ? "Logging in..." : "Login"}
                      {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="mt-0">
                <form onSubmit={handleSignup}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <UserCircle2 className="absolute left-3 top-3 h-4 w-4 text-shotsy-400" />
                        <Input 
                          id="name" 
                          placeholder="John Doe" 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-shotsy-400" />
                        <Input 
                          id="signup-email" 
                          placeholder="name@example.com" 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-shotsy-400" />
                        <Input 
                          id="signup-password" 
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox id="terms" />
                      <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I agree to the Terms of Service
                      </label>
                    </div>
                    <Button type="submit" disabled={isLoading} className="bg-shotsy-500 hover:bg-shotsy-600">
                      {isLoading ? "Creating account..." : "Create account"}
                      {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </CardContent>
            
            <CardFooter className="flex flex-col">
              <div className="relative w-full my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-shotsy-200"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-shotsy-400">
                    Or continue with
                  </span>
                </div>
              </div>
              <Button variant="outline" onClick={handleSkip} className="w-full border-shotsy-200 mt-2">
                Continue as guest
              </Button>
            </CardFooter>
          </Tabs>
        </Card>
        
        <p className="text-center mt-8 text-shotsy-600 text-sm">
          Your data is stored locally and never shared without your consent.
        </p>
      </div>
    </div>
  );
};

export default Login;
