-- rls.sql

-- Enable RLS on the events table
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own events
CREATE POLICY "Allow users to see their own events"
ON events
FOR SELECT
USING (auth.uid() = created_by);

-- Allow users to create events
CREATE POLICY "Allow users to create events"
ON events
FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Enable RLS on the guests table
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

-- Allow users to see guests for their own events
CREATE POLICY "Allow users to see guests for their own events"
ON guests
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM events
    WHERE events.id = guests.event_id AND events.created_by = auth.uid()
  )
);

-- Allow users to add guests to their own events
CREATE POLICY "Allow users to add guests to their own events"
ON guests
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM events
    WHERE events.id = guests.event_id AND events.created_by = auth.uid()
  )
);

-- Allow users to update guests for their own events
CREATE POLICY "Allow users to update guests for their own events"
ON guests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM events
    WHERE events.id = guests.event_id AND events.created_by = auth.uid()
  )
);
