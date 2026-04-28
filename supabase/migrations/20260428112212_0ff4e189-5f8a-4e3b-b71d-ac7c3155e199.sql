INSERT INTO public.plans (code, name, price, daily_return, duration_days, total_return, net_profit, sort_order, is_active) VALUES
('T6', 'Plano T6', 5000, 145, 70, 10150, 5150, 6, true),
('T7', 'Plano T7', 10000, 140, 100, 14000, 4000, 7, true),
('T8', 'Plano T8', 20000, 138, 150, 20700, 700, 8, true),
('T9', 'Plano T9', 35000, 135, 200, 27000, -8000, 9, true),
('T10', 'Plano T10', 50000, 130, 300, 39000, -11000, 10, true)
ON CONFLICT DO NOTHING;

-- Better: replace with a sensible scaling beyond T5. The negative net_profit above is wrong; let's compute properly.
DELETE FROM public.plans WHERE code IN ('T6','T7','T8','T9','T10');

INSERT INTO public.plans (code, name, price, daily_return, duration_days, total_return, net_profit, sort_order, is_active) VALUES
('T6',  'Plano T6',  5000,  280,  30, 8400,   3400,  6,  true),
('T7',  'Plano T7',  10000, 540,  35, 18900,  8900,  7,  true),
('T8',  'Plano T8',  20000, 1050, 40, 42000,  22000, 8,  true),
('T9',  'Plano T9',  35000, 1800, 45, 81000,  46000, 9,  true),
('T10', 'Plano T10', 50000, 2600, 50, 130000, 80000, 10, true);