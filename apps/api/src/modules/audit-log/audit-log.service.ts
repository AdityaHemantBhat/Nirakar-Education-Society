import { AuditLogRepository, AuditQuery } from './audit-log.repository.js';

export class AuditLogService {
  constructor(private repo = new AuditLogRepository()) {}

  async list(query: AuditQuery) {
    return this.repo.list(query);
  }

  async facets() {
    return this.repo.facets();
  }
}
