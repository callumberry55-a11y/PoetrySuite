interface CommentsSectionProps {
  postId: string;
}

export function CommentsSection({ postId }: CommentsSectionProps) {
  return (
    <div className="mt-4 p-4 bg-surface rounded">
      <h3 className="font-semibold mb-2">Comments</h3>
      <p className="text-sm text-muted-foreground">No comments yet for post {postId}</p>
    </div>
  );
}

export default CommentsSection;
