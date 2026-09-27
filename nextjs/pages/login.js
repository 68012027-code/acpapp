import { useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Invalid email or password');
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      router.push('/products');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen bg-slate-950 overflow-hidden select-none">
      
      {/* Background Soft Glow */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Grid Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Main Container Split Layout */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 w-full max-w-7xl mx-auto items-center p-6 lg:p-12 gap-12">
        
        {/* Left Side: Medical Stock Management Showcase */}
        <div className="lg:col-span-7 space-y-8 text-left hidden lg:block">
          
          <div className="space-y-4">
            {/* Top Pill / Badge */}
            <span className="inline-block px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 rounded-full">
              HEALTHCARE LOGISTICS PLATFORM
            </span>

            {/* Main Heading */}
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Next-Gen Medical <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                Inventory Management
              </span>
            </h1>

            {/* Description Subtext */}
            <p className="text-slate-400 text-sm lg:text-base max-w-lg leading-relaxed">
              Streamline pharmaceutical tracking, manage critical stock levels, and receive real-time webhook automation for modern hospital operations.
            </p>
          </div>

          {/* Picture of Medical Inventory / Pharmacy System */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl max-w-lg group">
            <img 
              src="/pharmacy-system.jpg" 
              alt="Healthcare Logistics Platform" 
              className="w-full h-64 object-cover opacity-85 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
          </div>

          {/* ECG Pulse Wave Line */}
          <div className="pt-2 opacity-50 max-w-lg">
            <svg className="w-full h-8 text-cyan-400" viewBox="0 0 800 60" preserveAspectRatio="none">
              <path
                d="M0,30 L200,30 L210,5 L220,55 L230,15 L240,40 L250,30 L500,30 L510,0 L520,60 L530,10 L540,45 L550,30 L800,30"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="800"
                strokeDashoffset="800"
                className="animate-[dash_5s_linear_infinite]"
              />
            </svg>
          </div>

        </div>

        {/* Right Side: Login Form */}
        <div className="lg:col-span-5 w-full flex justify-center">
          <Card className="w-full max-w-md bg-slate-900/85 border-slate-800 text-slate-100 shadow-2xl backdrop-blur-xl">
            <CardHeader className="space-y-2 text-center pt-8 pb-6">
              <CardTitle className="text-2xl font-extrabold tracking-tight text-white">
                MedStock Portal
              </CardTitle>
              <CardDescription className="text-slate-400 text-sm">
                Enter your credentials to access the portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-950/60 text-red-400 rounded-lg text-sm border border-red-800/60 flex items-center gap-2">
                    <span>⚠️</span> {error}
                  </div>
                )}
                
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-800/90 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-800/90 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold py-2.5 rounded-lg transition-all shadow-lg shadow-cyan-600/20 mt-3"
                  disabled={loading}
                >
                  {loading ? 'Authenticating...' : 'Sign In to Portal'}
                </Button>

                <div className="text-center text-sm text-slate-400 pt-4 border-t border-slate-800/80">
                  Don't have an account?{' '}
                  <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                    Register
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Animation Keyframes */}
      <style jsx global>{`
        @keyframes dash {
          0% { stroke-dashoffset: 800; }
          100% { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}