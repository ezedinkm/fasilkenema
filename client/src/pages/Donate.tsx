import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

export default function Donate() {
  const [amount, setAmount] = useState('');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-zinc-50">
        <div className="container px-4 py-16 max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-heading text-5xl font-bold text-primary mb-4">Make a Donation</h1>
            <p className="text-xl text-muted-foreground">
              Your voluntary contributions help us improve facilities, youth academies, and community programs in Gondar.
            </p>
          </div>

          <Card className="border-t-4 border-t-primary shadow-lg">
            <CardHeader>
              <CardTitle className="text-center font-display text-2xl">Select Amount</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {['100', '500', '1000', '5000', '10000'].map((val) => (
                  <Button 
                    key={val} 
                    variant="outline" 
                    className={`h-16 text-xl font-bold hover:border-primary hover:text-primary ${amount === val ? 'border-primary text-primary bg-primary/5' : ''}`}
                    onClick={() => setAmount(val)}
                  >
                    {val} ETB
                  </Button>
                ))}
                <Button 
                  variant="outline" 
                  className={`h-16 text-xl font-bold hover:border-primary hover:text-primary ${amount === 'custom' ? 'border-primary text-primary bg-primary/5' : ''}`}
                  onClick={() => setAmount('custom')}
                >
                  Custom
                </Button>
              </div>

              {amount === 'custom' && (
                <div className="pt-2">
                  <label className="text-sm font-medium mb-2 block">Enter Custom Amount (ETB)</label>
                  <Input type="number" placeholder="0.00" className="text-lg h-12" />
                </div>
              )}

              <div className="pt-6 border-t border-border">
                <h3 className="font-bold mb-4">Donor Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="First Name" />
                    <Input placeholder="Last Name" />
                  </div>
                  <Input placeholder="Email Address" type="email" />
                  <Input placeholder="Phone Number" />
                  
                  <div className="flex items-center gap-2 pt-2">
                    <input type="checkbox" id="anonymous" className="rounded border-gray-300" />
                    <label htmlFor="anonymous" className="text-sm">Make this donation anonymous</label>
                  </div>
                </div>
              </div>

              <Button className="w-full h-14 text-lg font-display uppercase tracking-wider bg-primary hover:bg-primary/90 mt-4">
                Proceed to Payment
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
