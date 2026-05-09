-- Tiket garansi & support
CREATE TABLE support_tickets (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID        NOT NULL REFERENCES orders(id),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason       VARCHAR(50) NOT NULL,
  -- account_invalid, already_used, cant_login, wrong_product, other
  description  TEXT,
  screenshot_url TEXT,
  status       VARCHAR(20) NOT NULL DEFAULT 'open',
  -- open, in_review, resolved_replaced, resolved_refunded, rejected, closed
  resolution   TEXT,                             -- catatan resolusi dari admin
  new_account_stock_id UUID REFERENCES account_stock(id),
  admin_id     UUID REFERENCES auth.users(id),
  resolved_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
