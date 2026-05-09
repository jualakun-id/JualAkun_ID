-- Referral events
CREATE TABLE referrals (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id  UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id  UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id          UUID        REFERENCES orders(id),   -- order pertama referred user
  credit_amount     INT         NOT NULL DEFAULT 5000,   -- kredit diberikan (Rupiah)
  status            VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, credited, expired
  credited_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(referrer_user_id, referred_user_id)
);
