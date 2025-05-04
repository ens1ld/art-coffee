-- Function to execute SQL directly
-- This is used by the setup page to apply migrations
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  BEGIN
    EXECUTE sql;
    result := jsonb_build_object('success', true);
  EXCEPTION WHEN OTHERS THEN
    result := jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'code', SQLSTATE
    );
  END;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 