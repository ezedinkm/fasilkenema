import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Save, RefreshCw, Plus, Trash2, Upload, Image as ImageIcon, Phone, Bell, Palette } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { MEMBERSHIP_TIERS } from '@/lib/mockData';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApp } from '@/lib/context';

const DEFAULT_THEME = {
  primaryColor: '#E31E24',
  secondaryColor: '#D4AF37',
  accentColor: '#1a1a2e',
};

export default function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { token, refreshTheme } = useApp();
  
  // State for membership tiers
  const [tiers, setTiers] = useState(MEMBERSHIP_TIERS);
  const [isAddTierOpen, setIsAddTierOpen] = useState(false);
  const [newTier, setNewTier] = useState({
    id: '',
    name: '',
    priceEtb: '',
    priceUsd: ''
  });

  // State for branding
  const [headerText, setHeaderText] = useState('Fasil Kenema Fan Club');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  // State for donation tiers
  const [donationTiers, setDonationTiers] = useState<{ id: string; amount: number; label: string }[]>([
    { id: '1', amount: 100, label: '100 ETB' },
    { id: '2', amount: 500, label: '500 ETB' },
    { id: '3', amount: 1000, label: '1,000 ETB' },
    { id: '4', amount: 5000, label: '5,000 ETB' },
    { id: '5', amount: 10000, label: '10,000 ETB' },
  ]);
  const [isAddDonationTierOpen, setIsAddDonationTierOpen] = useState(false);
  const [newDonationTier, setNewDonationTier] = useState({ amount: '', label: '' });

  // State for notifications
  const [notificationPhone, setNotificationPhone] = useState('');
  const [smsNotificationsEnabled, setSmsNotificationsEnabled] = useState(true);
  const [notificationEmails, setNotificationEmails] = useState<string[]>([]);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [newEmail, setNewEmail] = useState('');

  // State for theme
  const [themeColors, setThemeColors] = useState(DEFAULT_THEME);
  
  // State for general settings
  const [siteName, setSiteName] = useState('Ethiopian Bunna FC Fan Club');
  const [siteUrl, setSiteUrl] = useState('https://ethiopianbunna.com');
  const [supportEmail, setSupportEmail] = useState('support@ethiopianbunna.com');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // State for payment settings
  const [chapaPublicKey, setChapaPublicKey] = useState('');
  const [chapaSecretKey, setChapaSecretKey] = useState('');
  const [chapaWebhookUrl, setChapaWebhookUrl] = useState('');
  const [chapaSandboxMode, setChapaSandboxMode] = useState(true);
  const [chapaKeysConfigured, setChapaKeysConfigured] = useState(false);
  
  const { data: settings, refetch: refetchSettings } = useQuery<any[]>({
    queryKey: ['/api/settings'],
    staleTime: 0,
    enabled: !!token,
  });

  useEffect(() => {
    if (token) {
      refetchSettings();
    }
  }, [token, refetchSettings]);

  useEffect(() => {
    if (settings && Array.isArray(settings)) {
      const headerTextSetting = settings.find((s: any) => s.key === 'branding.headerText');
      const logoSetting = settings.find((s: any) => s.key === 'branding.logo');
      const faviconSetting = settings.find((s: any) => s.key === 'branding.favicon');
      const donationTiersSetting = settings.find((s: any) => s.key === 'donations.tiers');
      
      if (headerTextSetting) setHeaderText(headerTextSetting.value);
      if (logoSetting) setLogoPreview(logoSetting.value);
      if (faviconSetting) setFaviconPreview(faviconSetting.value);
      if (donationTiersSetting) {
        try {
          const parsedTiers = JSON.parse(donationTiersSetting.value);
          if (Array.isArray(parsedTiers) && parsedTiers.length > 0) {
            setDonationTiers(parsedTiers);
          }
        } catch (e) {
          console.error('Failed to parse donation tiers:', e);
        }
      }

      const notificationPhoneSetting = settings.find((s: any) => s.key === 'notifications.phone');
      const smsEnabledSetting = settings.find((s: any) => s.key === 'notifications.smsEnabled');
      const notificationEmailsSetting = settings.find((s: any) => s.key === 'notifications.emails');
      const emailEnabledSetting = settings.find((s: any) => s.key === 'notifications.emailEnabled');
      
      if (notificationPhoneSetting) setNotificationPhone(notificationPhoneSetting.value);
      if (smsEnabledSetting) setSmsNotificationsEnabled(smsEnabledSetting.value === 'true' || smsEnabledSetting.value === true);
      
      if (notificationEmailsSetting) {
        try {
          const emails = typeof notificationEmailsSetting.value === 'string' 
            ? JSON.parse(notificationEmailsSetting.value) 
            : notificationEmailsSetting.value;
          if (Array.isArray(emails)) {
            setNotificationEmails(emails);
          }
        } catch (e) {
          console.error('Failed to parse notification emails:', e);
        }
      }
      if (emailEnabledSetting) setEmailNotificationsEnabled(emailEnabledSetting.value === 'true' || emailEnabledSetting.value === true);

      // Load theme settings
      const primaryColorSetting = settings.find((s: any) => s.key === 'theme.primaryColor');
      const secondaryColorSetting = settings.find((s: any) => s.key === 'theme.secondaryColor');
      const accentColorSetting = settings.find((s: any) => s.key === 'theme.accentColor');
      
      setThemeColors({
        primaryColor: primaryColorSetting?.value || DEFAULT_THEME.primaryColor,
        secondaryColor: secondaryColorSetting?.value || DEFAULT_THEME.secondaryColor,
        accentColor: accentColorSetting?.value || DEFAULT_THEME.accentColor,
      });

      // Load general settings
      const siteNameSetting = settings.find((s: any) => s.key === 'general.siteName');
      const siteUrlSetting = settings.find((s: any) => s.key === 'general.siteUrl');
      const supportEmailSetting = settings.find((s: any) => s.key === 'general.supportEmail');
      const maintenanceModeSetting = settings.find((s: any) => s.key === 'general.maintenanceMode');
      
      if (siteNameSetting) setSiteName(siteNameSetting.value);
      if (siteUrlSetting) setSiteUrl(siteUrlSetting.value);
      if (supportEmailSetting) setSupportEmail(supportEmailSetting.value);
      if (maintenanceModeSetting) setMaintenanceMode(maintenanceModeSetting.value === 'true' || maintenanceModeSetting.value === true);

      // Load payment settings
      const chapaPublicKeySetting = settings.find((s: any) => s.key === 'payments.chapa.publicKey');
      const chapaSecretKeySetting = settings.find((s: any) => s.key === 'payments.chapa.secretKey');
      const chapaWebhookSetting = settings.find((s: any) => s.key === 'payments.chapa.webhookUrl');
      const chapaSandboxSetting = settings.find((s: any) => s.key === 'payments.chapa.sandboxMode');
      
      if (chapaPublicKeySetting) setChapaPublicKey(chapaPublicKeySetting.value);
      if (chapaSecretKeySetting) setChapaSecretKey(chapaSecretKeySetting.value);
      if (chapaWebhookSetting) setChapaWebhookUrl(chapaWebhookSetting.value);
      if (chapaSandboxSetting) setChapaSandboxMode(chapaSandboxSetting.value === 'true' || chapaSandboxSetting.value === true);
      
      // Mark as configured if keys are present
      setChapaKeysConfigured(!!(chapaPublicKeySetting?.value || chapaSecretKeySetting?.value));
    }
  }, [settings]);

  const saveBrandingMutation = useMutation({
    mutationFn: async (setting: { key: string; value: any; description?: string; delete?: boolean }) => {
      const authToken = localStorage.getItem('admin_token') || localStorage.getItem('token');
      
      if (!authToken) {
        throw new Error('Not authenticated. Please log in again.');
      }
      
      if (setting.delete) {
        const response = await fetch(`/api/settings/${setting.key}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to delete setting');
        }
        return response.json();
      } else {
        const response = await fetch('/api/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(setting)
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to save setting');
        }
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    }
  });

  const handleUpdateTier = (id: string, field: string, value: any) => {
    setTiers(tiers.map(t => {
      if (t.id === id) {
        if (field === 'priceEtb') return { ...t, price: { ...t.price, etb: parseInt(value) || 0 } };
        if (field === 'priceUsd') return { ...t, price: { ...t.price, usd: parseInt(value) || 0 } };
        return { ...t, [field]: value };
      }
      return t;
    }));
  };

  const handleAddTier = () => {
    const id = newTier.name.toLowerCase().replace(/\s+/g, '-');
    const tierToAdd = {
      id,
      name: newTier.name,
      price: { 
        etb: parseInt(newTier.priceEtb) || 0, 
        usd: parseInt(newTier.priceUsd) || 0 
      },
      benefits: ['Standard Benefits'],
      color: 'bg-zinc-100 text-zinc-900',
      recommended: false
    };
    
    setTiers([...tiers, tierToAdd]);
    setNewTier({ id: '', name: '', priceEtb: '', priceUsd: '' });
    setIsAddTierOpen(false);
    toast({ title: "Tier Added", description: `${tierToAdd.name} has been added.` });
  };

  const handleDeleteTier = (id: string) => {
    if (confirm('Are you sure you want to delete this membership tier?')) {
      setTiers(tiers.filter(t => t.id !== id));
      toast({ title: "Tier Deleted", description: "Membership tier removed." });
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 200000) {
        toast({
          title: "File Too Large",
          description: "Logo must be under 200KB",
          variant: "destructive"
        });
        return;
      }
      
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50000) {
        toast({
          title: "File Too Large",
          description: "Favicon must be under 50KB",
          variant: "destructive"
        });
        return;
      }
      
      setFaviconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaviconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBranding = async () => {
    try {
      const mutations = [];

      if (headerText) {
        mutations.push(saveBrandingMutation.mutateAsync({
          key: 'branding.headerText',
          value: headerText,
          description: 'Site header text'
        }));
      } else {
        mutations.push(saveBrandingMutation.mutateAsync({
          key: 'branding.headerText',
          value: '',
          delete: true
        }));
      }

      if (logoPreview) {
        mutations.push(saveBrandingMutation.mutateAsync({
          key: 'branding.logo',
          value: logoPreview,
          description: 'Site logo (base64)'
        }));
      } else {
        mutations.push(saveBrandingMutation.mutateAsync({
          key: 'branding.logo',
          value: '',
          delete: true
        }));
      }

      if (faviconPreview) {
        mutations.push(saveBrandingMutation.mutateAsync({
          key: 'branding.favicon',
          value: faviconPreview,
          description: 'Site favicon (base64)'
        }));
      } else {
        mutations.push(saveBrandingMutation.mutateAsync({
          key: 'branding.favicon',
          value: '',
          delete: true
        }));
      }

      await Promise.all(mutations);

      toast({ 
        title: "Branding Saved", 
        description: "Your branding settings have been updated." 
      });
    } catch (error: any) {
      console.error('Branding save error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save branding settings",
        variant: "destructive"
      });
    }
  };

  const handleAddDonationTier = () => {
    if (!newDonationTier.amount || !newDonationTier.label) {
      toast({ title: "Error", description: "Please enter both amount and label", variant: "destructive" });
      return;
    }
    const newTierEntry = {
      id: Date.now().toString(),
      amount: parseInt(newDonationTier.amount),
      label: newDonationTier.label,
    };
    setDonationTiers([...donationTiers, newTierEntry]);
    setNewDonationTier({ amount: '', label: '' });
    setIsAddDonationTierOpen(false);
  };

  const handleUpdateDonationTier = (id: string, field: string, value: string) => {
    setDonationTiers(donationTiers.map(tier => {
      if (tier.id === id) {
        if (field === 'amount') {
          return { ...tier, amount: parseInt(value) || 0 };
        } else if (field === 'label') {
          return { ...tier, label: value };
        }
      }
      return tier;
    }));
  };

  const handleDeleteDonationTier = (id: string) => {
    if (donationTiers.length <= 1) {
      toast({ title: "Error", description: "Must have at least one donation tier", variant: "destructive" });
      return;
    }
    setDonationTiers(donationTiers.filter(tier => tier.id !== id));
  };

  const handleSaveDonationTiers = async () => {
    try {
      await saveBrandingMutation.mutateAsync({
        key: 'donations.tiers',
        value: JSON.stringify(donationTiers),
        description: 'Configurable donation amount tiers'
      });
      toast({ 
        title: "Donation Tiers Saved", 
        description: "Your donation amount options have been updated." 
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save donation tiers",
        variant: "destructive"
      });
    }
  };

  const handleSaveNotifications = async () => {
    try {
      await Promise.all([
        saveBrandingMutation.mutateAsync({
          key: 'notifications.phone',
          value: notificationPhone,
          description: 'Phone number for payment notifications'
        }),
        saveBrandingMutation.mutateAsync({
          key: 'notifications.smsEnabled',
          value: smsNotificationsEnabled.toString(),
          description: 'Enable/disable SMS notifications'
        }),
        saveBrandingMutation.mutateAsync({
          key: 'notifications.emails',
          value: JSON.stringify(notificationEmails),
          description: 'Email addresses for payment notifications'
        }),
        saveBrandingMutation.mutateAsync({
          key: 'notifications.emailEnabled',
          value: emailNotificationsEnabled.toString(),
          description: 'Enable/disable email notifications'
        })
      ]);
      toast({ 
        title: "Notifications Saved", 
        description: "Your notification settings have been updated." 
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notification settings",
        variant: "destructive"
      });
    }
  };

  const handleSavePaymentSettings = async () => {
    try {
      const promises = [
        saveBrandingMutation.mutateAsync({
          key: 'payments.chapa.webhookUrl',
          value: chapaWebhookUrl,
          description: 'Chapa webhook URL for payment callbacks'
        }),
        saveBrandingMutation.mutateAsync({
          key: 'payments.chapa.sandboxMode',
          value: chapaSandboxMode.toString(),
          description: 'Enable/disable Chapa sandbox mode'
        })
      ];
      
      if (chapaPublicKey) {
        promises.push(saveBrandingMutation.mutateAsync({
          key: 'payments.chapa.publicKey',
          value: chapaPublicKey,
          description: 'Chapa public key'
        }));
      }
      
      if (chapaSecretKey) {
        promises.push(saveBrandingMutation.mutateAsync({
          key: 'payments.chapa.secretKey',
          value: chapaSecretKey,
          description: 'Chapa secret key'
        }));
      }
      
      await Promise.all(promises);
      setChapaKeysConfigured(!!(chapaPublicKey || chapaSecretKey));
      toast({ 
        title: "Payment Settings Saved", 
        description: "Your Chapa payment settings have been updated." 
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save payment settings",
        variant: "destructive"
      });
    }
  };

  const handleAddEmail = () => {
    const trimmedEmail = newEmail.trim().toLowerCase();
    if (!trimmedEmail) return;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address", variant: "destructive" });
      return;
    }
    
    if (notificationEmails.includes(trimmedEmail)) {
      toast({ title: "Duplicate Email", description: "This email is already in the list", variant: "destructive" });
      return;
    }
    
    setNotificationEmails([...notificationEmails, trimmedEmail]);
    setNewEmail('');
  };

  const handleRemoveEmail = (email: string) => {
    setNotificationEmails(notificationEmails.filter(e => e !== email));
  };

  const handleSaveTheme = async () => {
    try {
      await Promise.all([
        saveBrandingMutation.mutateAsync({
          key: 'theme.primaryColor',
          value: themeColors.primaryColor,
          description: 'Primary theme color'
        }),
        saveBrandingMutation.mutateAsync({
          key: 'theme.secondaryColor',
          value: themeColors.secondaryColor,
          description: 'Secondary theme color'
        }),
        saveBrandingMutation.mutateAsync({
          key: 'theme.accentColor',
          value: themeColors.accentColor,
          description: 'Accent theme color'
        })
      ]);
      
      // Apply theme immediately across all pages
      refreshTheme();
      
      toast({ 
        title: "Theme Saved", 
        description: "Your theme colors have been updated across all pages." 
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save theme settings",
        variant: "destructive"
      });
    }
  };

  const handleSaveGeneral = async () => {
    try {
      await Promise.all([
        saveBrandingMutation.mutateAsync({
          key: 'general.siteName',
          value: siteName,
          description: 'Site name'
        }),
        saveBrandingMutation.mutateAsync({
          key: 'general.siteUrl',
          value: siteUrl,
          description: 'Site URL'
        }),
        saveBrandingMutation.mutateAsync({
          key: 'general.supportEmail',
          value: supportEmail,
          description: 'Support email'
        }),
        saveBrandingMutation.mutateAsync({
          key: 'general.maintenanceMode',
          value: maintenanceMode.toString(),
          description: 'Maintenance mode'
        })
      ]);
      toast({ 
        title: "Settings Saved", 
        description: "Your general settings have been updated." 
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save general settings",
        variant: "destructive"
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-zinc-900">System Settings</h1>
          <p className="text-muted-foreground">Configure platform preferences and integrations.</p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-4 flex-wrap">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="membership">Membership Fees</TabsTrigger>
            <TabsTrigger value="donations">Donation Tiers</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="payments">Payment Gateways</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Site Information</CardTitle>
                <CardDescription>Basic configuration for the fan club platform.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="site-name">Site Name</Label>
                  <Input 
                    id="site-name" 
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    data-testid="input-site-name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="site-url">Site URL</Label>
                  <Input 
                    id="site-url" 
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
                    data-testid="input-site-url"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input 
                    id="support-email" 
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    data-testid="input-support-email"
                  />
                </div>
                <div className="flex items-center justify-between pt-4">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-xs text-muted-foreground">Disable public access to the site.</p>
                  </div>
                  <Switch 
                    checked={maintenanceMode} 
                    onCheckedChange={setMaintenanceMode}
                    data-testid="switch-maintenance-mode"
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-zinc-50 border-t border-zinc-100 flex justify-end">
                <Button className="bg-primary hover:bg-primary/90" onClick={handleSaveGeneral} data-testid="button-save-general">
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="theme">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Color Theme
                </CardTitle>
                <CardDescription>Customize the color scheme across your entire website.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-3">
                    <Label>Primary Color</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={themeColors.primaryColor}
                        onChange={(e) => setThemeColors({ ...themeColors, primaryColor: e.target.value })}
                        className="w-12 h-12 rounded-lg border-2 border-zinc-200 cursor-pointer"
                        data-testid="input-primary-color"
                      />
                      <div className="flex-1">
                        <Input
                          value={themeColors.primaryColor}
                          onChange={(e) => setThemeColors({ ...themeColors, primaryColor: e.target.value })}
                          placeholder="#E31E24"
                          className="font-mono"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Used for buttons, links, and accents</p>
                  </div>

                  <div className="space-y-3">
                    <Label>Secondary Color</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={themeColors.secondaryColor}
                        onChange={(e) => setThemeColors({ ...themeColors, secondaryColor: e.target.value })}
                        className="w-12 h-12 rounded-lg border-2 border-zinc-200 cursor-pointer"
                        data-testid="input-secondary-color"
                      />
                      <div className="flex-1">
                        <Input
                          value={themeColors.secondaryColor}
                          onChange={(e) => setThemeColors({ ...themeColors, secondaryColor: e.target.value })}
                          placeholder="#D4AF37"
                          className="font-mono"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Used for highlights and badges</p>
                  </div>

                  <div className="space-y-3">
                    <Label>Accent Color</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={themeColors.accentColor}
                        onChange={(e) => setThemeColors({ ...themeColors, accentColor: e.target.value })}
                        className="w-12 h-12 rounded-lg border-2 border-zinc-200 cursor-pointer"
                        data-testid="input-accent-color"
                      />
                      <div className="flex-1">
                        <Input
                          value={themeColors.accentColor}
                          onChange={(e) => setThemeColors({ ...themeColors, accentColor: e.target.value })}
                          placeholder="#1a1a2e"
                          className="font-mono"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Used for dark backgrounds</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Preview</Label>
                  <div className="p-6 rounded-lg border bg-zinc-50">
                    <div className="flex flex-wrap gap-3">
                      <Button style={{ backgroundColor: themeColors.primaryColor, color: 'white' }}>
                        Primary Button
                      </Button>
                      <Button style={{ backgroundColor: themeColors.secondaryColor, color: 'black' }}>
                        Secondary Button
                      </Button>
                      <div 
                        className="px-4 py-2 rounded-lg text-white font-medium"
                        style={{ backgroundColor: themeColors.accentColor }}
                      >
                        Accent Background
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setThemeColors(DEFAULT_THEME)}
                    data-testid="button-reset-theme"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" /> Reset to Default
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="bg-zinc-50 border-t border-zinc-100 flex justify-end">
                <Button className="bg-primary hover:bg-primary/90" onClick={handleSaveTheme} data-testid="button-save-theme">
                  <Save className="mr-2 h-4 w-4" /> Save Theme
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle>Branding & Appearance</CardTitle>
                <CardDescription>Customize your site logo, favicon, and header text.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="header-text">Header Text</Label>
                    <Input 
                      id="header-text" 
                      value={headerText}
                      onChange={(e) => setHeaderText(e.target.value)}
                      placeholder="Fasil Kenema Fan Club"
                      data-testid="input-header-text"
                    />
                    <p className="text-xs text-muted-foreground">This text appears in the site header/navigation</p>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div>
                      <Label>Site Logo</Label>
                      <p className="text-xs text-muted-foreground mb-3">Upload a logo to display in the navigation (recommended: PNG, max 200KB)</p>
                      <div className="flex items-start gap-4">
                        <div className="w-32 h-32 border-2 border-dashed border-zinc-300 rounded-lg flex items-center justify-center bg-zinc-50">
                          {logoPreview ? (
                            <img src={logoPreview} alt="Logo preview" className="max-w-full max-h-full object-contain p-2" />
                          ) : (
                            <ImageIcon className="h-12 w-12 text-zinc-400" />
                          )}
                        </div>
                        <div className="space-y-2">
                          <input
                            type="file"
                            ref={logoInputRef}
                            onChange={handleLogoChange}
                            accept="image/png,image/jpeg,image/svg+xml"
                            className="hidden"
                            data-testid="input-logo-file"
                          />
                          <Button 
                            variant="outline" 
                            onClick={() => logoInputRef.current?.click()}
                            data-testid="button-upload-logo"
                          >
                            <Upload className="mr-2 h-4 w-4" /> Choose Logo
                          </Button>
                          {logoPreview && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setLogoPreview(null)}
                              data-testid="button-remove-logo"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <Label>Favicon</Label>
                      <p className="text-xs text-muted-foreground mb-3">Upload a favicon for browser tabs (recommended: 32x32px PNG or ICO, max 50KB)</p>
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 border-2 border-dashed border-zinc-300 rounded flex items-center justify-center bg-zinc-50">
                          {faviconPreview ? (
                            <img src={faviconPreview} alt="Favicon preview" className="max-w-full max-h-full object-contain p-1" />
                          ) : (
                            <div className="w-6 h-6 bg-zinc-300 rounded-sm"></div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <input
                            type="file"
                            ref={faviconInputRef}
                            onChange={handleFaviconChange}
                            accept="image/png,image/x-icon,image/vnd.microsoft.icon"
                            className="hidden"
                            data-testid="input-favicon-file"
                          />
                          <Button 
                            variant="outline" 
                            onClick={() => faviconInputRef.current?.click()}
                            data-testid="button-upload-favicon"
                          >
                            <Upload className="mr-2 h-4 w-4" /> Choose Favicon
                          </Button>
                          {faviconPreview && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setFaviconPreview(null)}
                              data-testid="button-remove-favicon"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-zinc-50 border-t border-zinc-100 flex justify-end">
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleSaveBranding}
                  data-testid="button-save-branding"
                >
                  <Save className="mr-2 h-4 w-4" /> Save Branding
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="membership">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Membership Tiers & Pricing</CardTitle>
                  <CardDescription>Update pricing for annual memberships.</CardDescription>
                </div>
                <Dialog open={isAddTierOpen} onOpenChange={setIsAddTierOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="mr-2 h-4 w-4" /> Add Tier
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Tier</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Tier Name</Label>
                        <Input 
                          value={newTier.name} 
                          onChange={(e) => setNewTier({...newTier, name: e.target.value})}
                          placeholder="e.g. Gold" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Price (ETB)</Label>
                          <Input 
                            type="number" 
                            value={newTier.priceEtb} 
                            onChange={(e) => setNewTier({...newTier, priceEtb: e.target.value})}
                            placeholder="0" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Price (USD)</Label>
                          <Input 
                            type="number" 
                            value={newTier.priceUsd} 
                            onChange={(e) => setNewTier({...newTier, priceUsd: e.target.value})}
                            placeholder="0" 
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddTierOpen(false)}>Cancel</Button>
                      <Button onClick={handleAddTier}>Add Tier</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {tiers.map((tier) => (
                    <div key={tier.id} className={`space-y-4 p-4 border rounded-lg relative group ${tier.id === 'premium' ? 'bg-primary/5 border-primary/20' : (tier.id === 'vip' ? 'bg-yellow-50 border-yellow-200' : 'bg-zinc-50/50')}`}>
                      <div className="flex justify-between items-start">
                        <Input 
                          value={tier.name} 
                          onChange={(e) => handleUpdateTier(tier.id, 'name', e.target.value)}
                          className="font-bold text-lg bg-transparent border-transparent hover:border-input focus:border-input px-0 h-auto"
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteTier(tier.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Price (ETB)</Label>
                        <Input 
                          type="number" 
                          value={tier.price.etb} 
                          onChange={(e) => handleUpdateTier(tier.id, 'priceEtb', e.target.value)}
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Price (USD)</Label>
                        <Input 
                          type="number" 
                          value={tier.price.usd} 
                          onChange={(e) => handleUpdateTier(tier.id, 'priceUsd', e.target.value)}
                          className="bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="bg-zinc-50 border-t border-zinc-100 flex justify-end">
                <Button className="bg-primary hover:bg-primary/90" onClick={() => toast({ title: "Saved", description: "Membership settings updated." })}>
                  <Save className="mr-2 h-4 w-4" /> Update Pricing
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="donations">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Donation Amount Tiers</CardTitle>
                  <CardDescription>Configure suggested donation amounts shown to users.</CardDescription>
                </div>
                <Dialog open={isAddDonationTierOpen} onOpenChange={setIsAddDonationTierOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" data-testid="button-add-donation-tier">
                      <Plus className="mr-2 h-4 w-4" /> Add Tier
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Donation Tier</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Amount (ETB)</Label>
                        <Input 
                          type="number"
                          value={newDonationTier.amount} 
                          onChange={(e) => setNewDonationTier({...newDonationTier, amount: e.target.value})}
                          placeholder="e.g. 2500" 
                          data-testid="input-new-donation-amount"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Display Label</Label>
                        <Input 
                          value={newDonationTier.label} 
                          onChange={(e) => setNewDonationTier({...newDonationTier, label: e.target.value})}
                          placeholder="e.g. 2,500 ETB" 
                          data-testid="input-new-donation-label"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddDonationTierOpen(false)}>Cancel</Button>
                      <Button onClick={handleAddDonationTier} data-testid="button-confirm-add-donation-tier">Add Tier</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {donationTiers.map((tier) => (
                    <div key={tier.id} className="space-y-3 p-4 border rounded-lg relative group bg-zinc-50/50 hover:bg-zinc-100/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-lg text-primary">{tier.label}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteDonationTier(tier.id)}
                          data-testid={`button-delete-donation-tier-${tier.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-xs">Amount</Label>
                        <Input 
                          type="number" 
                          value={tier.amount} 
                          onChange={(e) => handleUpdateDonationTier(tier.id, 'amount', e.target.value)}
                          className="bg-white h-8 text-sm"
                          data-testid={`input-donation-amount-${tier.id}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Label</Label>
                        <Input 
                          value={tier.label} 
                          onChange={(e) => handleUpdateDonationTier(tier.id, 'label', e.target.value)}
                          className="bg-white h-8 text-sm"
                          data-testid={`input-donation-label-${tier.id}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Users will see these suggested amounts plus a "Custom" option on the donation page.
                </p>
              </CardContent>
              <CardFooter className="bg-zinc-50 border-t border-zinc-100 flex justify-end">
                <Button 
                  className="bg-primary hover:bg-primary/90" 
                  onClick={handleSaveDonationTiers}
                  data-testid="button-save-donation-tiers"
                >
                  <Save className="mr-2 h-4 w-4" /> Save Donation Tiers
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  SMS Notifications
                </CardTitle>
                <CardDescription>Configure SMS notifications for payment events.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable SMS Notifications</Label>
                    <p className="text-xs text-muted-foreground">Send SMS alerts when payments are received.</p>
                  </div>
                  <Switch 
                    checked={smsNotificationsEnabled}
                    onCheckedChange={setSmsNotificationsEnabled}
                    data-testid="switch-sms-notifications"
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="notification-phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Notification Phone Number
                    </Label>
                    <Input 
                      id="notification-phone"
                      placeholder="e.g. +251912345678 or 0912345678"
                      value={notificationPhone}
                      onChange={(e) => setNotificationPhone(e.target.value)}
                      data-testid="input-notification-phone"
                    />
                    <p className="text-xs text-muted-foreground">
                      This number will receive SMS notifications for all membership and donation payments.
                    </p>
                  </div>
                </div>

                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-sm">SMS Notification Preview</h4>
                  <p className="text-sm text-muted-foreground">
                    "New Membership Payment Received! Amount: 500 ETB. Fasil Kenema Fan Club."
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-sm text-blue-800">Geez SMS Integration</h4>
                  <p className="text-xs text-blue-700">
                    SMS notifications are sent via Geez SMS. Ensure your API credentials are configured in the environment.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Email Notifications
                </CardTitle>
                <CardDescription>Configure email notifications for payment events using Resend.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Email Notifications</Label>
                    <p className="text-xs text-muted-foreground">Send email alerts when payments are received.</p>
                  </div>
                  <Switch 
                    checked={emailNotificationsEnabled}
                    onCheckedChange={setEmailNotificationsEnabled}
                    data-testid="switch-email-notifications"
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2">
                      Notification Email Addresses
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Add multiple email addresses to receive payment notifications.
                    </p>
                    
                    <div className="flex gap-2">
                      <Input 
                        placeholder="e.g. admin@example.com"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
                        data-testid="input-notification-email"
                      />
                      <Button 
                        variant="outline" 
                        onClick={handleAddEmail}
                        data-testid="button-add-email"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </div>
                    
                    {notificationEmails.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {notificationEmails.map((email) => (
                          <Badge 
                            key={email} 
                            variant="secondary"
                            className="flex items-center gap-1 px-3 py-1"
                          >
                            {email}
                            <button 
                              onClick={() => handleRemoveEmail(email)}
                              className="ml-1 hover:text-red-500"
                              data-testid={`button-remove-email-${email}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {notificationEmails.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">
                        No email addresses added yet. Add at least one email to receive notifications.
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-sm">Email Notification Preview</h4>
                  <p className="text-sm text-muted-foreground">
                    Subject: "New Donation Payment - Ethiopian Bunna FC Fan Club"
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Emails include payment details and current total revenue.
                  </p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-sm text-purple-800">Resend Integration</h4>
                  <p className="text-xs text-purple-700">
                    Email notifications are sent via Resend. The integration is configured and ready to use.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="bg-zinc-50 border-t border-zinc-100 flex justify-end">
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleSaveNotifications}
                  data-testid="button-save-notifications"
                >
                  <Save className="mr-2 h-4 w-4" /> Save All Notification Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment Integrations</CardTitle>
                <CardDescription>Manage keys for Chapa and other providers.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center text-white font-bold text-xs">CH</div>
                      <div>
                        <h4 className="font-bold">Chapa Payment</h4>
                        <p className="text-xs text-muted-foreground">Primary gateway for ETB/USD</p>
                      </div>
                    </div>
                    <Badge className={chapaKeysConfigured ? "bg-green-500" : "bg-yellow-500"}>
                      {chapaKeysConfigured ? "Active" : "Not Configured"}
                    </Badge>
                  </div>
                  
                  <div className="grid gap-2 ml-10">
                    <Label>Public Key</Label>
                    <Input 
                      type="text" 
                      value={chapaPublicKey}
                      onChange={(e) => setChapaPublicKey(e.target.value)}
                      placeholder="CHAPUBK-xxxxxxxxxxxxxxxx"
                      className="font-mono" 
                      data-testid="input-chapa-public-key"
                    />
                    <p className="text-xs text-muted-foreground">Enter your Chapa public key from your dashboard</p>
                  </div>
                  <div className="grid gap-2 ml-10">
                    <Label>Secret Key</Label>
                    <Input 
                      type="password" 
                      value={chapaSecretKey}
                      onChange={(e) => setChapaSecretKey(e.target.value)}
                      placeholder="CHASECK-xxxxxxxxxxxxxxxx"
                      className="font-mono" 
                      data-testid="input-chapa-secret-key"
                    />
                    <p className="text-xs text-muted-foreground">Enter your Chapa secret key from your dashboard</p>
                  </div>
                  <div className="grid gap-2 ml-10">
                    <Label>Webhook URL</Label>
                    <Input 
                      type="text" 
                      value={chapaWebhookUrl}
                      onChange={(e) => setChapaWebhookUrl(e.target.value)}
                      placeholder="https://yoursite.com/api/chapa/callback"
                      className="font-mono" 
                      data-testid="input-chapa-webhook-url"
                    />
                    <p className="text-xs text-muted-foreground">Enter this URL in your Chapa dashboard webhook settings</p>
                  </div>
                  
                  <div className="ml-10 flex items-center gap-2">
                    <Switch 
                      id="sandbox" 
                      checked={chapaSandboxMode}
                      onCheckedChange={setChapaSandboxMode}
                      data-testid="switch-chapa-sandbox"
                    />
                    <Label htmlFor="sandbox">Sandbox Mode</Label>
                  </div>
                </div>
                
                <Separator />
                
                <div className="opacity-50">
                   <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">PP</div>
                      <div>
                        <h4 className="font-bold">PayPal</h4>
                        <p className="text-xs text-muted-foreground">International donations (Coming Soon)</p>
                      </div>
                    </div>
                    <Switch disabled />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-zinc-50 border-t border-zinc-100 flex justify-end">
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleSavePaymentSettings}
                  data-testid="button-save-payments"
                >
                  <Save className="mr-2 h-4 w-4" /> Save Payment Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
