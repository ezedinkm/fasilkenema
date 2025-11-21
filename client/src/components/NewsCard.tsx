import { Link } from 'wouter';
import { Calendar, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface NewsCardProps {
  post: {
    id: number;
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    image: string;
    category: string;
  };
}

export default function NewsCard({ post }: NewsCardProps) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col bg-card cursor-pointer">
        <div className="relative h-56 overflow-hidden">
          <div className="absolute top-3 left-3 z-10">
            <Badge variant="secondary" className="bg-primary text-white hover:bg-primary/90 uppercase font-bold tracking-wider text-xs rounded-sm">
              {post.category}
            </Badge>
          </div>
          <img 
            src={post.image} 
            alt={post.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
        </div>
        
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2 font-medium">
            <Calendar className="h-3.5 w-3.5" />
            {post.date}
          </div>
          <h3 className="font-display text-xl md:text-2xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 uppercase">
            {post.title}
          </h3>
        </CardHeader>
        
        <CardContent className="flex-grow">
          <p className="text-muted-foreground text-sm line-clamp-3">
            {post.excerpt}
          </p>
        </CardContent>
        
        <CardFooter className="pt-0 pb-6">
          <div className="text-sm font-bold text-primary flex items-center gap-1 group-hover:gap-2 transition-all uppercase tracking-wide">
            Read More <ArrowRight className="h-4 w-4" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
