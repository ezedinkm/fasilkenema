import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NEWS_POSTS } from '@/lib/mockData';
import { Plus, Edit, Trash2, Image as ImageIcon, Globe, Save, X } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

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

export default function AdminContent() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>(NEWS_POSTS);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State
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
            <div className="grid gap-4 md:grid-cols-2">
              {['Home Page', 'About Us', 'Contact', 'Membership'].map((page) => (
                <Card key={page}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{page}</CardTitle>
                    <CardDescription>Last updated: 2 days ago</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <Globe className="mr-2 h-3 w-3" /> Translate
                      </Button>
                      <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">
                        <Edit className="mr-2 h-3 w-3" /> Edit Content
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
