// Adicione ao seu src/modules/database/database.module.ts
import { BillingRepository } from './repositories/billing.repository';
import { ActivationKeysRepository } from './repositories/activation-keys.repository';
import { ProjectsRepository } from './repositories/projects.repository';
import { ProvisioningRepository } from './repositories/provisioning.repository';

// E inclua em providers/exports:
BillingRepository,
ActivationKeysRepository,
ProjectsRepository,
ProvisioningRepository,
