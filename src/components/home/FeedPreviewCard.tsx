import { Heart, MessageCircle } from 'lucide-react';
import { FeedPost } from '../../types/marketplace';
import ProfileAvatar from '../ProfileAvatar';

interface FeedPreviewCardProps {
  post: FeedPost;
}

export default function FeedPreviewCard({ post }: FeedPreviewCardProps) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex items-center gap-3">
        <ProfileAvatar
          profileImage={post.authorAvatar}
          alt={post.authorName}
          className="h-10 w-10 rounded-full object-cover"
        />
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{post.authorName}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-zinc-700 dark:text-zinc-200">{post.content}</p>
      {post.image ? <img src={post.image} alt="Feed post" className="mt-3 h-44 w-full rounded-xl object-cover" loading="lazy" /> : null}
      <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="inline-flex items-center gap-1">
          <Heart size={13} /> {post.likes}
        </span>
        <span className="inline-flex items-center gap-1">
          <MessageCircle size={13} /> {post.comments}
        </span>
      </div>
    </article>
  );
}
