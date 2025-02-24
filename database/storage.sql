-- Enable RLS for all buckets
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create buckets if they don't exist
INSERT INTO storage.buckets (id, name)
VALUES 
  ('profile_images', 'profile_images'),
  ('user_documents', 'user_documents'),
  ('resumes', 'resumes')
ON CONFLICT DO NOTHING;

-- Policy for profile_images bucket
CREATE POLICY "Users can view their own profile image"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile_images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own profile image"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'profile_images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own profile image"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'profile_images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile image"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'profile_images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy for user_documents bucket (PWD IDs)
CREATE POLICY "Users can view their own documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'user_documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'user_documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own documents"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'user_documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'user_documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy for resumes bucket
CREATE POLICY "Users can view their own resume"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own resume"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own resume"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own resume"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Additional security policies
CREATE POLICY "Prohibit bucket deletion"
  ON storage.buckets FOR DELETE
  USING (false);

CREATE POLICY "Prohibit bucket updates"
  ON storage.buckets FOR UPDATE
  USING (false);