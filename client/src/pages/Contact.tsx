import PublicLayout from '@/components/PublicLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function Contact() {
  return (
    <PublicLayout>
      <div className="bg-zinc-50">
        <div className="bg-primary py-12">
          <div className="container px-4 text-center text-white">
            <h1 className="font-heading text-5xl font-bold mb-4">Get In Touch</h1>
            <p className="text-xl opacity-90">We want to hear from you.</p>
          </div>
        </div>

        <div className="container px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-xl">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-4">
                    <MapPin className="h-6 w-6 text-primary shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold mb-1">Headquarters</h4>
                      <p className="text-sm text-muted-foreground">
                        Fasil Kenema Sport Club<br />
                        Piasa Area, Near Fasil Ghebbi<br />
                        Gondar, Ethiopia
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <Phone className="h-6 w-6 text-primary shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold mb-1">Phone</h4>
                      <p className="text-sm text-muted-foreground">+251 58 111 2222</p>
                      <p className="text-sm text-muted-foreground">+251 58 111 3333</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Mail className="h-6 w-6 text-primary shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold mb-1">Email</h4>
                      <p className="text-sm text-muted-foreground">info@fasilkenemasc.com</p>
                      <p className="text-sm text-muted-foreground">press@fasilkenemasc.com</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-xl">Send us a message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                        <Input id="name" placeholder="John Doe" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">Email</label>
                        <Input id="email" type="email" placeholder="john@example.com" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                      <Input id="subject" placeholder="How can we help?" />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium">Message</label>
                      <Textarea id="message" placeholder="Your message here..." rows={6} />
                    </div>
                    
                    <Button className="w-full bg-primary hover:bg-primary/90 text-lg font-display uppercase tracking-wide">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
