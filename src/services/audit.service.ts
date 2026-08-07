import { AuditRecord } from '../types';

/**
 * AuditService handles ERC-8004 compatible audit trails.
 * ERC-8004 provides a standard for on-chain feedback and auditability for AI agents.
 */
export class AuditService {
  private records: AuditRecord[] = [];

  constructor() {
    this.generateMockRecords();
  }

  private generateMockRecords() {
    const now = new Date();
    this.records = [
      {
        id: 'audit_1',
        timestamp: new Date(now.getTime() - 3600000).toISOString(),
        action: 'SWAP_EXECUTION',
        status: 'COMPLETED',
        details: { amount: 25, token: 'WETH', price: 3150 },
        txHash: '0xabcdef1234567890'
      },
      {
        id: 'audit_2',
        timestamp: new Date(now.getTime() - 7200000).toISOString(),
        action: 'CONFIG_CHANGE',
        status: 'SUCCESS',
        details: { oldAmount: 20, newAmount: 25 },
      }
    ];
  }

  getRecords() {
    return this.records;
  }

  addRecord(record: Omit<AuditRecord, 'id' | 'timestamp'>) {
    const newRecord: AuditRecord = {
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...record
    };
    this.records.unshift(newRecord);
    return newRecord;
  }
}

export const auditService = new AuditService();
