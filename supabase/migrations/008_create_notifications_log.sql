-- Log notifikasi (WhatsApp & email)
CREATE TABLE notifications_log (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id   UUID        REFERENCES orders(id) ON DELETE SET NULL,
  type       VARCHAR(50) NOT NULL,
  -- order_created, payment_confirmed, account_delivered, guarantee_active,
  -- ticket_opened, ticket_resolved, stock_low_alert (admin only)
  channel    VARCHAR(20) NOT NULL,   -- whatsapp, email
  recipient  VARCHAR(100) NOT NULL,  -- nomor WA atau email
  payload    JSONB        NOT NULL DEFAULT '{}',
  status     VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending, sent, failed
  error_msg  TEXT,
  sent_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
