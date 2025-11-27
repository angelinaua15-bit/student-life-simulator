-- Create rewards table for level-up rewards
create table if not exists public.level_rewards (
  id uuid primary key default gen_random_uuid(),
  level integer not null unique,
  reward_type text not null, -- 'skin', 'coins', 'booster', 'location', 'badge', 'effect'
  reward_value text not null, -- JSON string with reward details
  reward_name text not null,
  reward_description text not null,
  rarity text default 'common', -- 'common', 'rare', 'epic', 'legendary'
  created_at timestamp with time zone default now()
);

-- Insert predefined rewards for levels 1-30
insert into public.level_rewards (level, reward_type, reward_value, reward_name, reward_description, rarity) values
(2, 'coins', '{"amount": 100}', '100 монет', 'Базова винагорода за досягнення 2 рівня', 'common'),
(3, 'skin', '{"skin": "casual"}', 'Скін "Кежуал"', 'Розслаблений стиль для студента', 'common'),
(4, 'booster', '{"type": "xp", "multiplier": 1.5, "duration": 3600}', 'Бустер XP x1.5', 'Збільшення досвіду на 50% протягом 1 години', 'rare'),
(5, 'coins', '{"amount": 250}', '250 монет', 'Непогана нагорода!', 'common'),
(6, 'skin', '{"skin": "geek"}', 'Скін "Гік"', 'Для справжніх ботаників', 'rare'),
(7, 'badge', '{"badge": "week_survivor"}', 'Бейдж "Вижив тиждень"', 'Ти продержався цілий тиждень!', 'rare'),
(8, 'booster', '{"type": "money", "multiplier": 2, "duration": 3600}', 'Бустер грошей x2', 'Подвійний заробіток протягом години', 'rare'),
(9, 'coins', '{"amount": 500}', '500 монет', 'Солідна сума!', 'rare'),
(10, 'skin', '{"skin": "rich"}', 'Скін "Багатій"', 'Стиль успішної людини', 'epic'),
(11, 'effect', '{"effect": "golden_aura"}', 'Золота Аура', 'Твій персонаж світиться золотом', 'epic'),
(12, 'coins', '{"amount": 750}', '750 монет', 'Ого!', 'rare'),
(13, 'booster', '{"type": "stress", "reduction": 50, "duration": 7200}', 'Антистрес', 'Зменшення стресу на 50% протягом 2 годин', 'epic'),
(14, 'badge', '{"badge": "month_survivor"}', 'Бейдж "Пережив місяць"', 'Цілий місяць у грі!', 'epic'),
(15, 'skin', '{"skin": "business"}', 'Скін "Бізнесмен"', 'Діловий стиль лідера', 'epic'),
(16, 'coins', '{"amount": 1000}', '1000 монет', 'Тисяча!', 'epic'),
(17, 'effect', '{"effect": "rainbow_trail"}', 'Райдужний слід', 'За тобою залишається райдужний слід', 'epic'),
(18, 'booster', '{"type": "energy", "multiplier": 1.5, "duration": 7200}', 'Енергетик', 'Енергія витрачається на 50% повільніше', 'epic'),
(19, 'coins', '{"amount": 1500}', '1500 монет', 'Велика нагорода!', 'epic'),
(20, 'skin', '{"skin": "legend"}', 'Скін "Легенда"', 'Для справжніх легенд!', 'legendary'),
(21, 'effect', '{"effect": "sparkle_burst"}', 'Вибух блискучок', 'Блискучі частинки навколо тебе', 'legendary'),
(22, 'badge', '{"badge": "pro_gamer"}', 'Бейдж "Про-геймер"', 'Ти досяг неймовірних висот!', 'legendary'),
(23, 'coins', '{"amount": 2000}', '2000 монет', 'Епічна сума!', 'legendary'),
(24, 'booster', '{"type": "all", "multiplier": 2, "duration": 10800}', 'Мега-бустер', 'Все х2 протягом 3 годин!', 'legendary'),
(25, 'skin', '{"skin": "champion"}', 'Скін "Чемпіон"', 'Для переможців', 'legendary'),
(26, 'effect', '{"effect": "cosmic_glow"}', 'Космічне сяйво', 'Космічна аура навколо персонажа', 'legendary'),
(27, 'coins', '{"amount": 3000}', '3000 монет', 'Неймовірно!', 'legendary'),
(28, 'badge', '{"badge": "ultimate"}', 'Бейдж "Ультімейт"', 'Ти досяг максимуму!', 'legendary'),
(29, 'booster', '{"type": "luck", "multiplier": 3, "duration": 14400}', 'Удача х3', 'Потрійна удача в лотереї на 4 години', 'legendary'),
(30, 'skin', '{"skin": "god_mode"}', 'Скін "Режим Бога"', 'Найкрутіший скін у грі!', 'legendary');

-- Enable RLS
alter table public.level_rewards enable row level security;

-- Anyone can read rewards
create policy "rewards_select_all"
  on public.level_rewards for select
  using (true);

-- Add status field to track player titles/achievements
alter table public.player_profiles 
add column if not exists status text default 'Новачок';

-- Create leaderboard view for public access
create or replace view public.leaderboard as
select 
  id,
  nickname,
  skin,
  level,
  experience,
  coins,
  status,
  cafe_high_score + library_high_score + care_packages_high_score as total_score,
  updated_at
from public.player_profiles
order by level desc, experience desc, total_score desc
limit 100;

-- Grant access to leaderboard view
grant select on public.leaderboard to anon, authenticated;
