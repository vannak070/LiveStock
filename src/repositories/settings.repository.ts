import { query } from '../config/database';
import { MasterSetup, UserRoleItem, CustomRoleDefinition, DEFAULT_ROLE_PERMISSIONS } from '../lib/types';
import { PoolClient } from 'pg';

const DEFAULT_ROLES: CustomRoleDefinition[] = [
  { id: 'ROLE-01', name: 'Super Admin', description: 'Full system management and security authority.', permissions: DEFAULT_ROLE_PERMISSIONS['Super Admin'], isSystem: true },
  { id: 'ROLE-02', name: 'Admin', description: 'Full business operations control and user creation privileges.', permissions: DEFAULT_ROLE_PERMISSIONS['Admin'], isSystem: true },
  { id: 'ROLE-03', name: 'Company', description: 'Manages user accounts, permissions, and multiple farms under them.', permissions: DEFAULT_ROLE_PERMISSIONS['Company'], isSystem: true },
  { id: 'ROLE-04', name: 'Farm Owner', description: 'Full operational control and lifecycle management of their specific farm.', permissions: DEFAULT_ROLE_PERMISSIONS['Farm Owner'], isSystem: true },
  { id: 'ROLE-05', name: 'Farm Staff', description: 'Records weights, health logs, and tracks daily checklists based on custom permissions.', permissions: DEFAULT_ROLE_PERMISSIONS['Farm Staff'], isSystem: true },
  { id: 'ROLE-06', name: 'Veterinarian', description: 'Responsible for health tracking, medical records, deworming, and diagnostics.', permissions: DEFAULT_ROLE_PERMISSIONS['Veterinarian'], isSystem: true }
];

const DEFAULT_USERS: UserRoleItem[] = [
  { id: '1', name: 'Vannak Admin', email: 'vannak@snrfarm.com', role: 'Super Admin', status: 'Active', password: 'password123', permissions: DEFAULT_ROLE_PERMISSIONS['Super Admin'] },
  { id: '2', name: 'Sokha Manager', email: 'sokha.m@snrfarm.com', role: 'Admin', status: 'Active', password: 'password123', permissions: DEFAULT_ROLE_PERMISSIONS['Admin'] },
  { id: '3', name: 'Chay Pang', email: 'pang@snrfarm.com', role: 'Company', status: 'Active', password: 'password123', permissions: DEFAULT_ROLE_PERMISSIONS['Company'] },
  { id: '4', name: 'Bona Owner', email: 'bona.v@snrfarm.com', role: 'Farm Owner', status: 'Active', password: 'password123', permissions: DEFAULT_ROLE_PERMISSIONS['Farm Owner'] },
  { id: '5', name: 'Dara Staff', email: 'dara.s@snrfarm.com', role: 'Farm Staff', status: 'Active', password: 'password123', permissions: DEFAULT_ROLE_PERMISSIONS['Farm Staff'] },
  { id: '6', name: 'Dara Rath', email: 'rath@snrfarm.com', role: 'Veterinarian', status: 'Active', password: 'password123', permissions: DEFAULT_ROLE_PERMISSIONS['Veterinarian'] }
];

export class SettingsRepository {
  private async executeQuery(sql: string, params?: unknown[], client?: PoolClient) {
    if (client) {
      return client.query(sql, params);
    }
    return query(sql, params);
  }

  async getSettings(): Promise<MasterSetup> {
    const res = await query("SELECT data FROM master_settings WHERE key = 'master_setup'");
    let settings: MasterSetup;

    if (res.rows.length === 0) {
      settings = {
        breeds: ['គោទន្លេ', 'កាត់ Brahman', 'កាត់ Wagyu'],
        locations: ['រទាំង', 'ព្រៃវែង', 'បន្ទាយមានជ័យ', 'ក្រោល A', 'ក្រោល B'],
        buyTypes: ['Lumsum', 'Weight', 'Born in Farm', 'Transfer', 'Partnership'],
        healthStatuses: ['Good', 'Fair', 'Poor', 'Dead'],
        vaccineTypes: ['Foot and Mouth', 'Brucellosis', 'Anthrax', 'Dewormer A', 'Vitamin Boost'],
        feedTypes: ['Silage', 'Concentrate Feed', 'Fresh Grass', 'Hay Mix'],
        expenseCategories: ['Feed', 'Medicine', 'Maintenance', 'Labor', 'Utilities', 'Other'],
        paymentMethods: ['ABA Pay', 'Cash', 'Bank Transfer'],
        sexes: ['Male', 'Female'],
        diseaseTypes: ['Foot and Mouth Disease (FMD)', 'Brucellosis', 'Anthrax', 'Pneumonia', 'Parasite Infection'],
        batchTypes: ['Fattening Program', 'Quanrantin & Vet Card', 'Selling Pool'],
        weightUnits: ['kg', 'lbs'],
        revenueTypes: ['Livestock Sale', 'Manure Sale', 'Milk Sale', 'Partnership Share'],
        purchaseTypes: ['Purchase', 'Born in Farm', 'Transfer', 'Partnership'],
        users: DEFAULT_USERS,
        roles: DEFAULT_ROLES
      };
    } else {
      settings = res.rows[0].data;
      if (!settings.roles || settings.roles.length === 0) {
        settings.roles = DEFAULT_ROLES;
      }
    }

    const usersRes = await query('SELECT * FROM users ORDER BY created_at ASC');
    if (usersRes.rows.length === 0) {
      for (const u of DEFAULT_USERS) {
        await query(
          `INSERT INTO users (id, name, email, role, status, password, permissions)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO UPDATE SET name=$2, email=$3, role=$4, status=$5, password=$6, permissions=$7`,
          [u.id, u.name, u.email, u.role, u.status, u.password, JSON.stringify(u.permissions || DEFAULT_ROLE_PERMISSIONS[u.role] || [])]
        );
      }
      settings.users = DEFAULT_USERS;
    } else {
      settings.users = usersRes.rows.map(row => {
        let perms = row.permissions;
        if (typeof perms === 'string') {
          try { perms = JSON.parse(perms); } catch { perms = []; }
        }
        if (!perms || (Array.isArray(perms) && perms.length === 0)) {
          perms = DEFAULT_ROLE_PERMISSIONS[row.role] || [];
        }

        return {
          id: row.id,
          name: row.name,
          email: row.email,
          role: row.role,
          status: row.status,
          password: row.password,
          permissions: perms
        };
      });
    }

    return settings;
  }

  async updateSettings(settings: MasterSetup, client?: PoolClient): Promise<MasterSetup> {
    const sql = `
      INSERT INTO master_settings (key, data, updated_at)
      VALUES ('master_setup', $1, CURRENT_TIMESTAMP)
      ON CONFLICT (key) DO UPDATE SET data = $1, updated_at = CURRENT_TIMESTAMP
    `;
    await this.executeQuery(sql, [JSON.stringify(settings)], client);

    if (settings.users && settings.users.length > 0) {
      for (const u of settings.users) {
        const permsToSave = u.permissions || DEFAULT_ROLE_PERMISSIONS[u.role] || [];
        await this.executeQuery(
          `INSERT INTO users (id, name, email, role, status, password, permissions)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO UPDATE SET name=$2, email=$3, role=$4, status=$5, password=$6, permissions=$7`,
          [u.id, u.name, u.email, u.role, u.status || 'Active', u.password || 'password123', JSON.stringify(permsToSave)],
          client
        );
      }
    }

    return this.getSettings();
  }
}

export const settingsRepository = new SettingsRepository();
