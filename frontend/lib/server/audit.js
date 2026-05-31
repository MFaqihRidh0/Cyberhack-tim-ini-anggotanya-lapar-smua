import supabase from './db';

/**
 * Log an action to the audit trail.
 * Silently fails if audit_logs table doesn't exist yet.
 */
export async function logAudit({ action, entityType, entityId, description, metadata, user }) {
  try {
    await supabase.from('audit_logs').insert({
      action,
      entity_type: entityType,
      entity_id: entityId,
      description,
      metadata: metadata || null,
      actor_id: user.id,
      actor_name: user.name,
      actor_role: user.role,
    });
  } catch {
    // Silently fail if table doesn't exist
  }
}
