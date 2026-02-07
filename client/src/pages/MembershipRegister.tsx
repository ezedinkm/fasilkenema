import PublicLayout from '@/components/PublicLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { MEMBERSHIP_TIERS } from '@/lib/mockData';
import { getSettingByKey } from '@/lib/api';
import { Camera, Upload } from 'lucide-react';

interface MembershipTier {
  id: string;
  name: string;
  price: { etb: number; usd: number };
  benefits: string[];
  color: string;
  recommended: boolean;
}

export default function MembershipRegister() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<MembershipTier | null>(null);
  const [currency, setCurrency] = useState<'etb' | 'usd'>('etb');
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [rank, setRank] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [division, setDivision] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image under 5MB',
          variant: 'destructive',
        });
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    async function fetchTiersAndSelect() {
      const params = new URLSearchParams(window.location.search);
      const tierId = params.get('tier');
      const currencyParam = params.get('currency') as 'etb' | 'usd';

      if (!tierId) {
        setLocation('/membership');
        return;
      }

      try {
        const result = await getSettingByKey('membership_tiers');
        let tiers: MembershipTier[] = MEMBERSHIP_TIERS;
        
        if (result?.value && Array.isArray(result.value)) {
          tiers = result.value.map((tier: any, index: number) => ({
            id: tier.id || tier.name?.toLowerCase() || `tier-${index}`,
            name: tier.name,
            price: { 
              etb: tier.priceETB || tier.price?.etb || 0, 
              usd: tier.priceUSD || tier.price?.usd || 0 
            },
            benefits: tier.benefits || [],
            color: tier.color || 'bg-gray-100 text-gray-900',
            recommended: tier.recommended || false,
          }));
        }

        const tier = tiers.find(t => t.id === tierId);
        if (tier) {
          setSelectedTier(tier);
          if (currencyParam) {
            setCurrency(currencyParam);
          }
        } else {
          setLocation('/membership');
        }
      } catch (error) {
        console.error('Failed to fetch membership tiers:', error);
        const tier = MEMBERSHIP_TIERS.find(t => t.id === tierId);
        if (tier) {
          setSelectedTier(tier);
          if (currencyParam) {
            setCurrency(currencyParam);
          }
        } else {
          setLocation('/membership');
        }
      } finally {
        setLoading(false);
      }
    }
    
    fetchTiersAndSelect();
  }, [setLocation]);

  const handleSubmit = async () => {
    if (!firstName || !lastName || !email || !phone || !dateOfBirth || !city || !country || !password) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Password Too Short',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedTier) {
      toast({
        title: 'Error',
        description: 'No membership tier selected',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      let photoUrl = null;
      
      if (photoFile) {
        const formData = new FormData();
        formData.append('photo', photoFile);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          photoUrl = uploadResult.photoUrl;
        } else {
          toast({
            title: 'Photo Upload Failed',
            description: 'Could not upload photo. Continuing without photo.',
            variant: 'destructive',
          });
        }
      }
      
      const amount = currency === 'etb' ? selectedTier.price.etb : selectedTier.price.usd;
      
      const paymentData = {
        amount,
        currency: currency.toUpperCase(),
        firstName,
        lastName,
        email,
        phone,
        password,
        rank,
        gender,
        address,
        division,
        dateOfBirth,
        city,
        country,
        membershipTier: selectedTier.id,
        photoUrl,
      };

      const response = await fetch('/api/members/initialize-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();
      
      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
        setIsSubmitting(false);
      } else if (result.success && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        toast({
          title: 'Error',
          description: 'Failed to initialize payment. Please try again.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process registration. Please try again.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="container px-4 py-16 text-center">Loading...</div>
      </PublicLayout>
    );
  }

  if (!selectedTier) {
    return null;
  }

  const price = currency === 'etb' 
    ? `${selectedTier.price.etb} ETB` 
    : `$${selectedTier.price.usd} USD`;

  return (
    <PublicLayout>
      <div className="bg-zinc-50">
        <div className="container px-4 py-16 max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-heading text-5xl font-bold text-primary mb-4">Join The Family</h1>
            <p className="text-xl text-muted-foreground">
              Complete your {selectedTier.name} membership registration
            </p>
          </div>

          <Card className="border-t-4 border-t-primary shadow-lg">
            <CardHeader>
              <CardTitle className="text-center font-display text-2xl">
                {selectedTier.name} Membership - {price}/year
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-b border-border pb-4">
                <h3 className="font-bold mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      placeholder="First Name *" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      data-testid="input-first-name"
                    />
                    <Input 
                      placeholder="Last Name *"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      data-testid="input-last-name"
                    />
                  </div>
                  <Input 
                    placeholder="Email Address *" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-testid="input-email"
                  />
                  <Input 
                    placeholder="ስልክ ቁጥር / Phone Number *"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    data-testid="input-phone"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">መአረግ / Rank</label>
                      <Input 
                        placeholder="መአረግ"
                        value={rank}
                        onChange={(e) => setRank(e.target.value)}
                        data-testid="input-rank"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">ዖታ / Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        data-testid="input-gender"
                      >
                        <option value="">ዖታ ይምረጡ</option>
                        <option value="ወንድ">ወንድ</option>
                        <option value="ሴት">ሴት</option>
                      </select>
                    </div>
                  </div>
                  <Input 
                    placeholder="አድራሻ / Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    data-testid="input-address"
                  />
                  <Input 
                    placeholder="ክፈለ ጦር/እዝ / Division/Command"
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    data-testid="input-division"
                  />
                  <div>
                    <label className="text-sm font-medium mb-2 block">Date of Birth *</label>
                    <Input 
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      data-testid="input-dob"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Profile Photo (for membership card)</label>
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-24 h-24 rounded-full bg-zinc-200 flex items-center justify-center overflow-hidden border-2 border-dashed border-zinc-300 cursor-pointer hover:border-primary transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                        data-testid="photo-upload-area"
                      >
                        {photoPreview ? (
                          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="w-8 h-8 text-zinc-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                          data-testid="input-photo"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="mb-2"
                          data-testid="button-upload-photo"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {photoFile ? 'Change Photo' : 'Upload Photo'}
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          This photo will appear on your digital membership card. Max 5MB.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b border-border pb-4">
                <h3 className="font-bold mb-4">Location</h3>
                <div className="space-y-4">
                  <Input 
                    placeholder="City *"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    data-testid="input-city"
                  />
                  <Input 
                    placeholder="Country *"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    data-testid="input-country"
                  />
                </div>
              </div>

              <div className="border-b border-border pb-4">
                <h3 className="font-bold mb-4">Create Account Password</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create a password to access your digital membership card after registration.
                </p>
                <div className="space-y-4">
                  <Input 
                    placeholder="Password *"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    data-testid="input-password"
                  />
                  <Input 
                    placeholder="Confirm Password *"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    data-testid="input-confirm-password"
                  />
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 6 characters. You can login with your email or phone number.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90"
                  data-testid="button-proceed-payment"
                >
                  {isSubmitting ? 'Processing...' : `Proceed to Payment - ${price}`}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  You will be redirected to secure Chapa payment gateway
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
