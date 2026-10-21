import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: settings } = useQuery<any[]>({
    queryKey: ["/api/public/settings"],
    staleTime: Infinity,
  });

  const contactInfo = {
    clubName:
      (Array.isArray(settings)
        ? settings.find((s: any) => s.key === "contact.clubName")?.value
        : null) || "Fasil Kenema Club",
    address1:
      (Array.isArray(settings)
        ? settings.find((s: any) => s.key === "contact.address1")?.value
        : null) || "Addis Ababa",
    address2:
      (Array.isArray(settings)
        ? settings.find((s: any) => s.key === "contact.address2")?.value
        : null) || "Ethiopia",
    phone1:
      (Array.isArray(settings)
        ? settings.find((s: any) => s.key === "contact.phone1")?.value
        : null) || "+251 164 000000",
    phone2:
      (Array.isArray(settings)
        ? settings.find((s: any) => s.key === "contact.phone2")?.value
        : null) || "+251 154 000001",
    email1:
      (Array.isArray(settings)
        ? settings.find((s: any) => s.key === "contact.email1")?.value
        : null) || "info@fasilkenemafc.com",
    email2:
      (Array.isArray(settings)
        ? settings.find((s: any) => s.key === "contact.email2")?.value
        : null) || "press@fasilkenemafc.com",
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !fullName.trim() ||
      !phone.trim() ||
      !subject.trim() ||
      !message.trim()
    ) {
      toast({
        title: "Missing Information",
        description:
          "Please provide your name, phone number, subject, and message.",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.trim() && !emailRegex.test(email.trim())) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Failed to send message");
      }

      toast({
        title: "Message Sent",
        description: "Your message has been received successfully.",
      });
      setFullName("");
      setPhone("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Could not send your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <div className="bg-white">
        <div className="bg-red-600 text-white relative overflow-hidden py-20">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          <div className="container px-4 relative z-10 text-center">
            <h1 className="font-heading text-5xl md:text-7xl font-bold mb-6">
              Get In Touch
            </h1>
            <p className="text-xl max-w-2xl mx-auto text-white/90">
              We want to hear from you.
            </p>
          </div>
        </div>

        <div className="container px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-xl">
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-4">
                    <MapPin className="h-6 w-6 text-primary shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold mb-1">Headquarters</h4>
                      <p className="text-sm text-muted-foreground">
                        {contactInfo.clubName}
                        <br />
                        {contactInfo.address1}
                        <br />
                        {contactInfo.address2}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Phone className="h-6 w-6 text-primary shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold mb-1">Phone</h4>
                      <p className="text-sm text-muted-foreground">
                        {contactInfo.phone1}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {contactInfo.phone2}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Mail className="h-6 w-6 text-primary shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold mb-1">Email</h4>
                      <p className="text-sm text-muted-foreground">
                        {contactInfo.email1}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {contactInfo.email2}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-xl">
                    Send us a message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                          Full Name <span className="text-red-600">*</span>
                        </label>
                        <Input
                          id="name"
                          required
                          autoComplete="name"
                          placeholder="John Doe"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium">
                          Phone Number <span className="text-red-600">*</span>
                        </label>
                        <Input
                          id="phone"
                          type="tel"
                          required
                          autoComplete="tel"
                          placeholder="+251 9..."
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email <span className="text-muted-foreground">(optional)</span>
                      </label>
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium">
                        Subject <span className="text-red-600">*</span>
                      </label>
                      <Input
                        id="subject"
                        required
                        placeholder="How can we help?"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium">
                        Message <span className="text-red-600">*</span>
                      </label>
                      <Textarea
                        id="message"
                        required
                        placeholder="Your message here..."
                        rows={6}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary hover:bg-primary/90 text-lg font-display uppercase tracking-wide"
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
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
