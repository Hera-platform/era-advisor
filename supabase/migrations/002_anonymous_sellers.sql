-- Allow anonymous seller rows (no auth_id yet)
ALTER TABLE public.sellers
  ALTER COLUMN auth_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS is_anonymous boolean NOT NULL DEFAULT false;

-- Add session token to conversations for anonymous lookup
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS session_token text,
  ADD COLUMN IF NOT EXISTS seller_id uuid REFERENCES public.sellers(id) ON DELETE SET NULL;

-- Unique constraint for upsert on session_token
ALTER TABLE public.conversations
  ADD CONSTRAINT conversations_session_token_key UNIQUE (session_token);

-- Index for session token lookup
CREATE INDEX idx_conversations_session_token ON public.conversations(session_token)
  WHERE session_token IS NOT NULL;

-- Allow authenticated users to claim their anonymous seller row on signup
CREATE POLICY "sellers_claim_anonymous" ON public.sellers
  FOR UPDATE USING (is_anonymous = true)
  WITH CHECK (auth.uid() IS NOT NULL);
