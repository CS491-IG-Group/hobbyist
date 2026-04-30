/* Performance indexes focused on timeline/auth/profile hot paths.
   These are safe to run repeatedly with IF NOT EXISTS guards. */

/* Timeline feed and profile post lists */
CREATE INDEX IF NOT EXISTS idx_posts_created_at_desc
  ON public.posts (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_user_created_at_desc
  ON public.posts (user_id, created_at DESC);

/* Likes and follows fan-out lookups */
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id
  ON public.post_likes (post_id);

CREATE INDEX IF NOT EXISTS idx_user_follows_followed_status
  ON public.user_follows (followed_id, status);

CREATE INDEX IF NOT EXISTS idx_user_follows_follower_status
  ON public.user_follows (follower_id, status);

/* Lists sidebar and per-list item fetch/count */
CREATE INDEX IF NOT EXISTS idx_lists_user_created_at
  ON public.lists (user_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_list_items_list_created_at
  ON public.list_items (list_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_list_items_list_item
  ON public.list_items (list_id, item_id);

/* Goals/profile sidebar */
CREATE INDEX IF NOT EXISTS idx_user_goals_user_created_at
  ON public.user_goals (user_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_goals_owner_created_at
  ON public.goals (owner_user_id, created_at ASC);

/* Recommendation reads are mostly user-scoped and time-ordered */
CREATE INDEX IF NOT EXISTS idx_content_events_user_event_created
  ON public.content_events (user_id, event_type, created_at DESC);

/* Reverse lookup for hobby memberships (already have PK(user_id, hobby_id)). */
CREATE INDEX IF NOT EXISTS idx_user_hobbies_hobby_user
  ON public.user_hobbies (hobby_id, user_id);

/* Optional tables that exist in some environments only. */
DO $$
BEGIN
  IF to_regclass('public.comments') IS NOT NULL THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_comments_post_created_at ON public.comments (post_id, created_at ASC)';
  END IF;

  IF to_regclass('public.item_reviews') IS NOT NULL THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_item_reviews_item_updated_at ON public.item_reviews (item_id, updated_at DESC)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_item_reviews_user_item ON public.item_reviews (user_id, item_id)';
  END IF;
END $$;
