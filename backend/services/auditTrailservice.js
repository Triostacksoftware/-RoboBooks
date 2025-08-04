const auditTrail = [];

export function logAction({ user, type, entity, entityId, message }) {
  auditTrail.push({
    user,
    type,
    entity,
    entityId,
    message,
    timestamp: new Date(),
  });
  console.log(`🔍 Audit log:`, message);
}

export function getAuditTrail() {
  return auditTrail;
}
