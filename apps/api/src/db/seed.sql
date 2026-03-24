-- Données de test pour démarrer rapidement

-- Pharmacie démo
INSERT INTO pharmacies (id, name, plan) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Pharmacie Martin', 'pro')
ON CONFLICT DO NOTHING;

-- Produits démo (catalogue)
INSERT INTO products (pharmacy_id, name, category, tags, price, description) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Magnésium Marin 300mg', 'complement', ARRAY['magnesium', 'stress', 'sleep'], 12.90, 'Magnesium marin haute biodisponibilite'),
  ('00000000-0000-0000-0000-000000000001', 'Oméga-3 Premium', 'complement', ARRAY['omega3', 'heart'], 18.50, 'EPA/DHA issus de poissons sauvages'),
  ('00000000-0000-0000-0000-000000000001', 'Vitamine D3 2000UI', 'complement', ARRAY['vitamine_d', 'immunity'], 9.90, 'Vitamine D3 naturelle d''origine lanoline'),
  ('00000000-0000-0000-0000-000000000001', 'Mélatonine 1mg', 'complement', ARRAY['melatonine', 'sleep'], 7.50, 'Mélatonine à libération prolongée'),
  ('00000000-0000-0000-0000-000000000001', 'Zinc Bisglycinate 15mg', 'complement', ARRAY['zinc', 'immunity'], 11.20, 'Zinc chelaté haute absorption'),
  ('00000000-0000-0000-0000-000000000001', 'Protéines Whey Vanille', 'complement', ARRAY['proteine', 'sport'], 29.90, 'Whey isolate 90% protéines'),
  ('00000000-0000-0000-0000-000000000001', 'Probiotiques 10 souches', 'complement', ARRAY['probiotique', 'immunity'], 22.00, '10 milliards UFC, 10 souches'),
  ('00000000-0000-0000-0000-000000000001', 'Ashwagandha KSM-66', 'complement', ARRAY['ashwagandha', 'stress', 'sleep'], 19.90, 'Extrait breveté 5% withanolides'),
  ('00000000-0000-0000-0000-000000000001', 'Vitamine C 1000mg', 'complement', ARRAY['vitamine_c', 'immunity'], 8.90, 'Vitamine C tamponnée avec bioflavonoïdes'),
  ('00000000-0000-0000-0000-000000000001', 'Fer Bisglycinate 14mg', 'complement', ARRAY['fer', 'sport'], 13.50, 'Fer non-heminique, sans constipation'),
  ('00000000-0000-0000-0000-000000000001', 'Spiruline Bio 500mg', 'complement', ARRAY['spiruline', 'sport', 'weight'], 16.90, 'Spiruline certifiée bio, 180 comprimés'),
  ('00000000-0000-0000-0000-000000000001', 'Coenzyme Q10 100mg', 'complement', ARRAY['q10', 'heart', 'sport'], 24.50, 'Ubiquinol forme active'),
  ('00000000-0000-0000-0000-000000000001', 'Crème hydratante SPF30', 'parapharmacie', ARRAY['hygiene', 'soin'], 14.90, 'Protection solaire quotidienne'),
  ('00000000-0000-0000-0000-000000000001', 'Gel douche surgras', 'hygiene', ARRAY['hygiene'], 6.50, 'Sans savon, pour peaux sensibles')
ON CONFLICT DO NOTHING;
