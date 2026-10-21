import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Image as ImageIcon, Globe, Save, X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { fetchWithAuth } from '@/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Page, Post, PostCategory } from '@shared/schema';

const DEFAULT_PAGES = [
  { slug: 'home', titleEn: 'Home Page', contentEn: '' },
  { slug: 'about', titleEn: 'About Us', contentEn: '' },
  { slug: 'contact', titleEn: 'Contact', contentEn: '' },
  { slug: 'membership', titleEn: 'Membership', contentEn: '' },
  { slug: 'privacy-policy', titleEn: 'Privacy Policy', contentEn: '' },
  { slug: 'terms-of-service', titleEn: 'Terms of Service', contentEn: '' },
];

export default function AdminContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [isPageDialogOpen, setIsPageDialogOpen] = useState(false);
  const [pageFormData, setPageFormData] = useState({
    titleEn: '',
    titleAm: '',
    contentEn: '',
    contentAm: '',
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
  });

  const {
    data: postCategories = [],
    isLoading: postCategoriesLoading,
    isError: postCategoriesError,
  } = useQuery<PostCategory[]>({
    queryKey: ['/api/post-categories'],
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await fetchWithAuth('/api/admin/post-categories', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create category.');
      }
      return result as PostCategory;
    },
    onSuccess: (category) => {
      queryClient.invalidateQueries({
        queryKey: ['/api/post-categories'],
      });
      setNewCategoryName('');
      setIsCategoryDialogOpen(false);
      toast({
        title: 'Category Created',
        description: `"${category.name}" is ready to use on posts.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Could not create category',
        description:
          error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (input: {
      data: Partial<Post>;
      notifySubscribers: boolean;
    }) => {
      const response = await fetchWithAuth('/api/posts', {
        method: 'POST',
        body: JSON.stringify(input.data),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create post.');
      }
      return { post: result as Post, notifySubscribers: input.notifySubscribers };
    },
    onSuccess: async ({ post, notifySubscribers }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      setIsDialogOpen(false);
      if (!notifySubscribers) {
        toast({ title: "Post Created", description: "New content has been published." });
        return;
      }

      try {
        const response = await fetchWithAuth('/api/admin/newsletter/send-post', {
          method: 'POST',
          body: JSON.stringify({ postId: post.id }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(result.error || 'The post was published, but the email could not be sent.');
        }
        if (result.failed > 0) {
          toast({
            title: "Post published; some emails failed",
            description: `${result.sent} sent and ${result.failed} failed.`,
            variant: "destructive",
          });
        } else if (result.selected === 0) {
          toast({
            title: "Post published",
            description: "There are no active newsletter subscribers to notify yet.",
          });
        } else {
          toast({
            title: "Post published and emailed",
            description: `The post was sent to ${result.sent} active subscriber(s).`,
          });
        }
      } catch (emailError) {
        toast({
          title: "Post published; email was not sent",
          description:
            emailError instanceof Error
              ? emailError.message
              : "Check the email connection and try again from the newsletter page.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create post.", variant: "destructive" });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<Post> }) => {
      return apiRequest('PATCH', `/api/posts/${data.id}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({ title: "Post Updated", description: "Changes have been saved successfully." });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update post.", variant: "destructive" });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({ title: "Post Deleted", description: "The content has been removed successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete post.", variant: "destructive" });
    },
  });

  const { data: pages = [], isLoading: pagesLoading } = useQuery<Page[]>({
    queryKey: ['/api/pages'],
  });

  const updatePageMutation = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<Page> }) => {
      const response = await fetchWithAuth(`/api/pages/${data.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data.updates),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update page.');
      }
      return result as Page;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
      toast({ title: "Page Updated", description: "Changes saved successfully." });
      setIsPageDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update page.",
        variant: "destructive",
      });
    },
  });

  const createPageMutation = useMutation({
    mutationFn: async (data: Partial<Page>) => {
      const response = await fetchWithAuth('/api/pages', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create page.');
      }
      return result as Page;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
      toast({ title: "Page Created", description: "New page created successfully." });
      setIsPageDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create page.",
        variant: "destructive",
      });
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
    titleEn: '',
    contentEn: '',
    category: '',
    imageUrl: '',
    isFeatured: false,
    notifySubscribers: false,
  });

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setFormData({
      titleEn: post.titleEn || '',
      contentEn: post.contentEn || '',
      category: post.category || '',
      imageUrl: post.imageUrl || '',
      isFeatured: post.isFeatured ?? false,
      notifySubscribers: false,
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingPost(null);
    setFormData({
      titleEn: '',
      contentEn: '',
      category: '',
      imageUrl: '',
      isFeatured: false,
      notifySubscribers: false,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this post?')) {
      deletePostMutation.mutate(id);
    }
  };

  const handleSave = () => {
    if (!postCategories.some((category) => category.name === formData.category)) {
      toast({
        title: 'Choose a category',
        description: 'Create or select an existing category before saving the post.',
        variant: 'destructive',
      });
      return;
    }

    const slug = formData.titleEn.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    if (editingPost) {
      updatePostMutation.mutate({
        id: editingPost.id,
        updates: {
          titleEn: formData.titleEn,
          contentEn: formData.contentEn,
          category: formData.category,
          imageUrl: formData.imageUrl || undefined,
          isFeatured: formData.isFeatured,
        },
      });
    } else {
      createPostMutation.mutate({
        data: {
          slug,
          titleEn: formData.titleEn,
          contentEn: formData.contentEn,
          category: formData.category,
          imageUrl: formData.imageUrl || undefined,
          isFeatured: formData.isFeatured,
          status: 'published',
        },
        notifySubscribers: formData.notifySubscribers,
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 min-w-0">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 min-w-0">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-zinc-900">Content Management</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Manage news, pages, and translations.</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Dialog
              open={isCategoryDialogOpen}
              onOpenChange={setIsCategoryDialogOpen}
            >
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="w-full sm:w-auto shrink-0"
                onClick={() => {
                  setNewCategoryName('');
                  setIsCategoryDialogOpen(true);
                }}
                data-testid="button-manage-post-categories"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
              <DialogContent className="w-[calc(100vw-1.5rem)] max-w-md">
                <DialogHeader>
                  <DialogTitle>News &amp; Blog Categories</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="new-post-category">New category name</Label>
                    <Input
                      id="new-post-category"
                      value={newCategoryName}
                      onChange={(event) =>
                        setNewCategoryName(event.target.value)
                      }
                      placeholder="e.g. Match Report"
                      maxLength={60}
                      data-testid="input-new-post-category"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Existing categories</p>
                    {postCategoriesLoading ? (
                      <p className="text-sm text-muted-foreground">
                        Loading categories…
                      </p>
                    ) : postCategoriesError ? (
                      <p className="text-sm text-destructive">
                        Could not load categories. You can still try adding one.
                      </p>
                    ) : postCategories.length ? (
                      <div className="flex flex-wrap gap-2">
                        {postCategories.map((category) => (
                          <span
                            key={category.id}
                            className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700"
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No categories yet. Add one before creating a post.
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCategoryDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() =>
                      createCategoryMutation.mutate(newCategoryName.trim())
                    }
                    disabled={
                      !newCategoryName.trim() ||
                      createCategoryMutation.isPending
                    }
                    data-testid="button-save-post-category"
                  >
                    {createCategoryMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Category
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 w-full sm:w-auto shrink-0"
                onClick={handleCreate}
                disabled={
                  postCategoriesLoading ||
                  postCategoriesError ||
                  postCategories.length === 0
                }
                data-testid="button-create-post"
              >
                <Plus className="mr-2 h-4 w-4" /> Create New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100vw-1.5rem)] max-w-2xl max-h-[90vh] overflow-y-auto sm:w-full">
              <DialogHeader>
                <DialogTitle>{editingPost ? 'Edit Post' : 'Create New Post'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input 
                    value={formData.titleEn} 
                    onChange={(e) => setFormData({...formData, titleEn: e.target.value})}
                    placeholder="Enter post title"
                    data-testid="input-post-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(category) =>
                      setFormData({ ...formData, category })
                    }
                    disabled={
                      postCategoriesLoading || postCategories.length === 0
                    }
                  >
                    <SelectTrigger data-testid="select-post-category">
                      <SelectValue
                        placeholder={
                          postCategoriesLoading
                            ? 'Loading categories…'
                            : postCategories.length
                              ? 'Select a category'
                              : 'Create a category first'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {postCategories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.name}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {postCategories.length === 0 && !postCategoriesLoading && (
                    <p className="text-xs text-muted-foreground">
                      Add a category before creating a news or blog post.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input 
                    value={formData.imageUrl} 
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    data-testid="input-post-image"
                  />
                </div>
                <div className="flex items-start gap-3 rounded-lg border p-3">
                  <Checkbox
                    id="post-featured-home"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        isFeatured: checked === true,
                      })
                    }
                    data-testid="checkbox-post-featured-home"
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="post-featured-home"
                      className="cursor-pointer"
                    >
                      Feature this news on the home page
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Featured posts appear in the home page news section.
                    </p>
                  </div>
                </div>
                {!editingPost && (
                  <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50/60 p-3">
                    <Checkbox
                      id="post-email-subscribers"
                      checked={formData.notifySubscribers}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          notifySubscribers: checked === true,
                        })
                      }
                    />
                    <div className="space-y-1">
                      <Label
                        htmlFor="post-email-subscribers"
                        className="cursor-pointer"
                      >
                        Email this post to active newsletter subscribers
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        After publishing, the post link is emailed individually to every active subscriber.
                      </p>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea 
                    value={formData.contentEn} 
                    onChange={(e) => setFormData({...formData, contentEn: e.target.value})}
                    placeholder="Main article content..."
                    className="min-h-[200px]"
                    data-testid="input-post-content"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleSave} 
                  disabled={
                    createPostMutation.isPending ||
                    updatePostMutation.isPending ||
                    !formData.category
                  }
                  data-testid="button-save-post"
                >
                  {(createPostMutation.isPending || updatePostMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Post
                </Button>
              </DialogFooter>
            </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="news" className="w-full min-w-0">
          <TabsList className="mb-4 flex h-auto w-full max-w-full flex-nowrap justify-start gap-1 overflow-x-auto p-1 sm:flex-wrap sm:overflow-visible">
            <TabsTrigger value="news">News & Blog</TabsTrigger>
            <TabsTrigger value="pages">Static Pages</TabsTrigger>
            <TabsTrigger value="translations">Translations</TabsTrigger>
          </TabsList>

          <TabsContent value="news" className="space-y-4">
            {postsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No posts found. Click "Create New Post" to add one.</div>
            ) : (
              posts.map((post) => (
                <Card key={post.id} className="overflow-hidden" data-testid={`card-post-${post.id}`}>
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-48 h-32 bg-zinc-100 relative">
                      {post.imageUrl ? (
                        <img src={post.imageUrl} alt={post.titleEn} className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ImageIcon className="h-12 w-12 text-zinc-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                           <div className="flex min-w-0 items-center gap-2">
                             <h3 className="font-bold text-lg line-clamp-1">{post.titleEn}</h3>
                             {post.isFeatured && (
                               <span className="shrink-0 rounded bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase text-amber-800">
                                 Home featured
                               </span>
                             )}
                           </div>
                          <span className="text-xs bg-zinc-100 px-2 py-1 rounded font-medium uppercase">{post.category}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{post.contentEn?.substring(0, 150)}...</p>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-muted-foreground">
                          {post.publishedAt ? `Published: ${new Date(post.publishedAt).toLocaleDateString()}` : `Created: ${new Date(post.createdAt).toLocaleDateString()}`}
                        </span>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="h-8" onClick={() => handleEdit(post)} data-testid={`button-edit-post-${post.id}`}>
                            <Edit className="mr-2 h-3 w-3" /> Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(post.id)}
                            data-testid={`button-delete-post-${post.id}`}
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
