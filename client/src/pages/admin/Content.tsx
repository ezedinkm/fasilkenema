import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NEWS_POSTS } from '@/lib/mockData';
import { Plus, Edit, Trash2, Image as ImageIcon, Globe, Save, X, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Page } from '@shared/schema';

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  category: string;
  content?: string;
}

const DEFAULT_PAGES = [
  { slug: 'home', titleEn: 'Home Page', contentEn: '' },
  { slug: 'about', titleEn: 'About Us', contentEn: '' },
  { slug: 'contact', titleEn: 'Contact', contentEn: '' },
  { slug: 'membership', titleEn: 'Membership', contentEn: '' },
];

export default function AdminContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [posts, setPosts] = useState<BlogPost[]>(NEWS_POSTS);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [isPageDialogOpen, setIsPageDialogOpen] = useState(false);
  const [pageFormData, setPageFormData] = useState({
    titleEn: '',
    titleAm: '',
    contentEn: '',
    contentAm: '',
  });

  const { data: pages = [], isLoading: pagesLoading } = useQuery<Page[]>({
    queryKey: ['/api/pages'],
  });

  const updatePageMutation = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<Page> }) => {
      return apiRequest('PATCH', `/api/pages/${data.id}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
      toast({ title: "Page Updated", description: "Changes saved successfully." });
      setIsPageDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update page.", variant: "destructive" });
    },
  });

  const createPageMutation = useMutation({
    mutationFn: async (data: Partial<Page>) => {
      return apiRequest('POST', '/api/pages', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
      toast({ title: "Page Created", description: "New page created successfully." });
      setIsPageDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create page.", variant: "destructive" });
    },
  });

  const handleEditPage = (page: Page) => {
    setEditingPage(page);
    setPageFormData({
      titleEn: page.titleEn || '',
      titleAm: page.titleAm || '',
      contentEn: page.contentEn || '',
      contentAm: page.contentAm || '',
    });
    setIsPageDialogOpen(true);
  };

  const handleSavePage = () => {
    if (editingPage) {
      if (editingPage.id > 0) {
        updatePageMutation.mutate({
          id: editingPage.id,
          updates: pageFormData,
        });
      } else {
        createPageMutation.mutate({
          slug: editingPage.slug,
          titleEn: pageFormData.titleEn,
          titleAm: pageFormData.titleAm || undefined,
          contentEn: pageFormData.contentEn,
          contentAm: pageFormData.contentAm || undefined,
          status: 'published',
        });
      }
    }
  };

  const getDisplayPages = () => {
    const existingPages = pages || [];
    return DEFAULT_PAGES.map(defaultPage => {
      const existing = existingPages.find(p => p.slug === defaultPage.slug);
      if (existing) {
        return existing;
      }
      return { id: 0, slug: defaultPage.slug, titleEn: defaultPage.titleEn, contentEn: '', status: 'draft', createdAt: new Date(), updatedAt: new Date() } as Page;
    });
  };

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    category: '',
    content: ''
  });

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      category: post.category,
      content: post.content || 'Lorem ipsum dolor sit amet...'
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingPost(null);
    setFormData({ title: '', excerpt: '', category: '', content: '' });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this post?')) {
      setPosts(posts.filter(p => p.id !== id));
      toast({
        title: "Post Deleted",
        description: "The content has been removed successfully."
      });
    }
  };

  const handleSave = () => {
    if (editingPost) {
      // Update existing
      setPosts(posts.map(p => p.id === editingPost.id ? { ...p, ...formData } : p));
      toast({
        title: "Post Updated",
        description: "Changes have been saved successfully."
      });
    } else {
      // Create new
      const newPost: BlogPost = {
        id: Date.now(),
        slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
        date: new Date().toISOString().split('T')[0],
        image: 'https://via.placeholder.com/800x400', // Placeholder for new posts
        ...formData
      };
      setPosts([newPost, ...posts]);
      toast({
        title: "Post Created",
        description: "New content has been published."
      });
    }
    setIsDialogOpen(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-zinc-900">Content Management</h1>
            <p className="text-muted-foreground">Manage news, pages, and translations.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" /> Create New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPost ? 'Edit Post' : 'Create New Post'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter post title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input 
                    value={formData.category} 
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    placeholder="e.g. Match Report, Club News"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Excerpt</Label>
                  <Textarea 
                    value={formData.excerpt} 
                    onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                    placeholder="Short summary for list view"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Full Content</Label>
                  <Textarea 
                    value={formData.content} 
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="Main article content..."
                    className="min-h-[200px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave}>Save Post</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="news" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="news">News & Blog</TabsTrigger>
            <TabsTrigger value="pages">Static Pages</TabsTrigger>
            <TabsTrigger value="translations">Translations</TabsTrigger>
          </TabsList>

          <TabsContent value="news" className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No posts found.</div>
            ) : (
              posts.map((post) => (
                <Card key={post.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-48 h-32 bg-zinc-100 relative">
                      <img src={post.image} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg line-clamp-1">{post.title}</h3>
                          <span className="text-xs bg-zinc-100 px-2 py-1 rounded font-medium uppercase">{post.category}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{post.excerpt}</p>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-muted-foreground">Published: {post.date}</span>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="h-8" onClick={() => handleEdit(post)}>
                            <Edit className="mr-2 h-3 w-3" /> Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(post.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="pages" className="space-y-4">
            {pagesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {getDisplayPages().map((page) => (
                  <Card key={page.slug} data-testid={`card-page-${page.slug}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{page.titleEn}</CardTitle>
                      <CardDescription>
                        {page.id > 0 ? `Last updated: ${new Date(page.updatedAt).toLocaleDateString()}` : 'Not yet created'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          className="bg-primary hover:bg-primary/90 text-white"
                          onClick={() => handleEditPage(page)}
                          data-testid={`button-edit-page-${page.slug}`}
                        >
                          <Edit className="mr-2 h-3 w-3" /> Edit Content
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <Dialog open={isPageDialogOpen} onOpenChange={setIsPageDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit {editingPage?.titleEn || 'Page'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Title (English)</Label>
                    <Input 
                      value={pageFormData.titleEn} 
                      onChange={(e) => setPageFormData({...pageFormData, titleEn: e.target.value})}
                      placeholder="Page title in English"
                      data-testid="input-page-title-en"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Title (Amharic)</Label>
                    <Input 
                      value={pageFormData.titleAm} 
                      onChange={(e) => setPageFormData({...pageFormData, titleAm: e.target.value})}
                      placeholder="Page title in Amharic"
                      data-testid="input-page-title-am"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Content (English)</Label>
                    <Textarea 
                      value={pageFormData.contentEn} 
                      onChange={(e) => setPageFormData({...pageFormData, contentEn: e.target.value})}
                      placeholder="Page content in English..."
                      className="min-h-[200px]"
                      data-testid="input-page-content-en"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Content (Amharic)</Label>
                    <Textarea 
                      value={pageFormData.contentAm} 
                      onChange={(e) => setPageFormData({...pageFormData, contentAm: e.target.value})}
                      placeholder="Page content in Amharic..."
                      className="min-h-[200px]"
                      data-testid="input-page-content-am"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsPageDialogOpen(false)}>Cancel</Button>
                  <Button 
                    onClick={handleSavePage} 
                    disabled={updatePageMutation.isPending || createPageMutation.isPending}
                    data-testid="button-save-page"
                  >
                    {(updatePageMutation.isPending || createPageMutation.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Page
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>
          
          <TabsContent value="translations">
            <Card>
              <CardHeader>
                <CardTitle>Global Translations</CardTitle>
                <CardDescription>Manage common strings across the platform.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-sm font-medium">Key: nav.home</label>
                     <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                       <span className="text-sm font-bold text-muted-foreground">EN</span>
                       <Input defaultValue="Home" />
                     </div>
                     <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                       <span className="text-sm font-bold text-muted-foreground">AM</span>
                       <Input defaultValue="መነሻ" />
                     </div>
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-medium">Key: hero.title</label>
                     <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                       <span className="text-sm font-bold text-muted-foreground">EN</span>
                       <Input defaultValue="The Home of The Emperors" />
                     </div>
                     <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                       <span className="text-sm font-bold text-muted-foreground">AM</span>
                       <Input defaultValue="የአፄዎቹ ቤት" />
                     </div>
                   </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button onClick={() => toast({ title: "Saved", description: "Translations updated successfully." })}>
                    Save Translations
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
