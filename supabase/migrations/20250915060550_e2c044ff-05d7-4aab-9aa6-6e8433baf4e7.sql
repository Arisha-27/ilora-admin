-- Enable Row Level Security on Contact Form Submission table
ALTER TABLE "Contact Form Submission" ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert contact form submissions (for the contact form to work)
CREATE POLICY "Allow anonymous contact form submissions" 
ON "Contact Form Submission" 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Only authenticated users can view contact form submissions
CREATE POLICY "Authenticated users can view contact submissions" 
ON "Contact Form Submission" 
FOR SELECT 
TO authenticated
USING (true);

-- Only authenticated users can update contact form submissions
CREATE POLICY "Authenticated users can update contact submissions" 
ON "Contact Form Submission" 
FOR UPDATE 
TO authenticated
USING (true);

-- Only authenticated users can delete contact form submissions
CREATE POLICY "Authenticated users can delete contact submissions" 
ON "Contact Form Submission" 
FOR DELETE 
TO authenticated
USING (true);