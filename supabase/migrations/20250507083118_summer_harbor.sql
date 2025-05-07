/*
  # Create clans table and update profiles schema

  1. New Tables
    - `clans` table for storing clan information
      - `id` (uuid, primary key)
      - `nom_clan` (text, required)
      - `tagline` (text)
      - `description` (text)
      - `rituel_entree` (text)
      - `image_url` (text)
      - `couleur_theme` (text)
      - `created_at` (timestamp)

  2. Changes
    - Add `clan_id` to profiles table
    - Add foreign key constraint
    - Update RLS policies

  3. Security
    - Enable RLS on clans table
    - Add policy for public read access
*/

-- Create clans table
CREATE TABLE IF NOT EXISTS public.clans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_clan text NOT NULL,
  tagline text,
  description text,
  rituel_entree text,
  image_url text,
  couleur_theme text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on clans
ALTER TABLE public.clans ENABLE ROW LEVEL SECURITY;

-- Allow public read access to clans
CREATE POLICY "Allow public read access to clans"
  ON public.clans
  FOR SELECT
  TO public
  USING (true);

-- Add clan_id to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS clan_id uuid REFERENCES public.clans(id);

-- Insert initial clan data
INSERT INTO public.clans (nom_clan, tagline, description, rituel_entree, image_url, couleur_theme) 
VALUES 
  (
    'ONOTKA',
    'La force brute. La résistance mentale.',
    'Pour ceux qui veulent prendre en masse, construire un corps solide et fiable. Tu forges ta structure. Tu deviens le socle.',
    'Rituel de force et de persévérance',
    'https://images.pexels.com/photos/7674497/pexels-photo-7674497.jpeg',
    '#F77C6F'
  ),
  (
    'EKLOA',
    'La vitesse. L''explosivité.',
    'Pour ceux qui veulent bondir, frapper, performer. Un corps rapide, réactif, pensé pour l''action du sportif.',
    'Rituel de vitesse et d''agilité',
    'https://images.pexels.com/photos/2468339/pexels-photo-2468339.jpeg',
    '#4CC3FF'
  ),
  (
    'OKWÁHO',
    'La fluidité. L''adaptabilité. L''équilibre.',
    'Pour ceux qui veulent bouger mieux, plus librement, sans contrainte. Tu construis un corps souple, mobile, intelligent.',
    'Rituel de fluidité et d''équilibre',
    'https://images.pexels.com/photos/2123573/pexels-photo-2123573.jpeg',
    '#4FD1C5'
  );