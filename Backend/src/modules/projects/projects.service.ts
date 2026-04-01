import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import type { CurrentAppUser } from '../../common/interfaces/request-context.interface';
import { CloudflareR2Service } from '../cloudflare/cloudflare-r2.service';
import { ActivationKeysRepository } from '../database/repositories/activation-keys.repository';
import { BillingRepository } from '../database/repositories/billing.repository';
import { ProjectsRepository } from '../database/repositories/projects.repository';
import { ProvisioningRepository } from '../database/repositories/provisioning.repository';
import { ActivateProjectDto } from './dto/activate-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly activationKeysRepository: ActivationKeysRepository,
    private readonly billingRepository: BillingRepository,
    private readonly projectsRepository: ProjectsRepository,
    private readonly provisioningRepository: ProvisioningRepository,
    private readonly cloudflareR2Service: CloudflareR2Service,
  ) {}

  async activate(appUser: CurrentAppUser, dto: ActivateProjectDto) {
    const subscription = await this.billingRepository.findActiveSubscriptionByUserId(appUser.id);
    if (!subscription) {
      throw new BadRequestException('Usuário não possui assinatura ativa.');
    }

    const maxProjects = this.resolveMaxProjects(subscription.entitlements_snapshot);
    const currentProjects = await this.projectsRepository.countActiveByOwnerUserId(appUser.id);

    if (currentProjects >= maxProjects) {
      throw new BadRequestException('Limite de projetos do plano atingido.');
    }

    const activationKey = await this.activationKeysRepository.findAvailableByCodeForUser({
      userId: appUser.id,
      code: dto.activationKey,
    });

    if (!activationKey) {
      throw new BadRequestException('Activation key inválida ou indisponível.');
    }

    const cloudflareBucket = this.cloudflareR2Service.getBucketName();

    const { project, storageRoot, release, projectCode } =
      await this.projectsRepository.createProjectSkeleton({
        ownerUserId: appUser.id,
        subscriptionId: subscription.id,
        activationKeyId: activationKey.id,
        name: dto.name,
        cloudflareBucket,
      });

    const provisioningRun = await this.provisioningRepository.createRun(project.id);

    try {
      await this.provisioningRepository.markStep(provisioningRun.id, {
        step: 'r2.bootstrap_started',
        details: {
          bucket: storageRoot.bucket,
          prefix: storageRoot.prefix,
          manifestKey: storageRoot.manifest_key,
        },
      });

      const bootstrap = await this.cloudflareR2Service.provisionProjectBootstrap({
        bucket: storageRoot.bucket,
        prefix: storageRoot.prefix,
        manifestKey:
          storageRoot.manifest_key ?? `${storageRoot.prefix}/releases/v1/manifest.json`,
        projectId: project.id,
        projectSlug: project.slug,
        projectName: project.name,
        releaseVersion: release.version,
      });

      await this.provisioningRepository.markStep(provisioningRun.id, {
        step: 'db.activation_key_redeem',
        details: {
          writtenKeys: bootstrap.writtenKeys.length,
          environments: bootstrap.environments,
        },
      });

      await this.activationKeysRepository.redeem({
        activationKeyId: activationKey.id,
        projectId: project.id,
      });

      await this.projectsRepository.markSetupReady({
        projectId: project.id,
        storageRootId: storageRoot.id,
      });

      await this.provisioningRepository.markSuccess(provisioningRun.id, {
        projectId: project.id,
        storageRootId: storageRoot.id,
        releaseId: release.id,
        bucket: storageRoot.bucket,
        prefix: storageRoot.prefix,
        manifestKey: storageRoot.manifest_key,
        environments: bootstrap.environments,
        writtenKeys: bootstrap.writtenKeys,
      });

      return {
        project,
        storageRoot,
        release,
        projectCode,
        provisioningRunId: provisioningRun.id,
        bootstrap,
      };
    } catch (error) {
      await this.projectsRepository.markSetupFailed({
        projectId: project.id,
        storageRootId: storageRoot.id,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });

      await this.provisioningRepository.markFailure(provisioningRun.id, {
        step: 'r2.bootstrap',
        errorCode: 'PROJECT_ACTIVATION_FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  async testPing() {
    return {
      ok: true,
      module: 'projects',
      timestamp: new Date().toISOString(),
    };
  }

  async testR2Connection() {
    return this.cloudflareR2Service.runWriteDeleteHealthcheck();
  }

  async inspectBootstrap(appUser: CurrentAppUser, projectId: string) {
    const context = await this.projectsRepository.findProjectBootstrapContextForOwner({
      projectId,
      ownerUserId: appUser.id,
    });

    if (!context) {
      throw new NotFoundException('Projeto não encontrado para este usuário.');
    }

    const expectedKeys = this.cloudflareR2Service.buildExpectedBootstrapKeys({
      prefix: context.storageRoot.prefix,
      manifestKey:
        context.storageRoot.manifest_key
        ?? `${context.storageRoot.prefix}/releases/v1/manifest.json`,
    });

    const existingKeys = await this.cloudflareR2Service.listKeys(
      context.storageRoot.bucket,
      context.storageRoot.prefix,
      200,
    );

    const existing = new Set(existingKeys);

    return {
      project: context.project,
      storageRoot: context.storageRoot,
      expectedKeys: expectedKeys.map((key) => ({
        key,
        exists: existing.has(key),
      })),
      existingKeys,
    };
  }

  async rebuildBootstrap(appUser: CurrentAppUser, projectId: string) {
    const context = await this.projectsRepository.findProjectBootstrapContextForOwner({
      projectId,
      ownerUserId: appUser.id,
    });

    if (!context) {
      throw new NotFoundException('Projeto não encontrado para este usuário.');
    }

    const provisioningRun = await this.provisioningRepository.createRun(context.project.id);

    try {
      await this.provisioningRepository.markStep(provisioningRun.id, {
        step: 'r2.bootstrap_rebuild_started',
        details: {
          bucket: context.storageRoot.bucket,
          prefix: context.storageRoot.prefix,
        },
      });

      const bootstrap = await this.cloudflareR2Service.provisionProjectBootstrap({
        bucket: context.storageRoot.bucket,
        prefix: context.storageRoot.prefix,
        manifestKey:
          context.storageRoot.manifest_key
          ?? `${context.storageRoot.prefix}/releases/v1/manifest.json`,
        projectId: context.project.id,
        projectSlug: context.project.slug,
        projectName: context.project.name,
        releaseVersion: 1,
      });

      await this.projectsRepository.markSetupReady({
        projectId: context.project.id,
        storageRootId: context.storageRoot.id,
      });

      await this.provisioningRepository.markSuccess(provisioningRun.id, {
        projectId: context.project.id,
        storageRootId: context.storageRoot.id,
        writtenKeys: bootstrap.writtenKeys,
      });

      return {
        ok: true,
        provisioningRunId: provisioningRun.id,
        bootstrap,
      };
    } catch (error) {
      await this.projectsRepository.markSetupFailed({
        projectId: context.project.id,
        storageRootId: context.storageRoot.id,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });

      await this.provisioningRepository.markFailure(provisioningRun.id, {
        step: 'r2.bootstrap_rebuild',
        errorCode: 'PROJECT_REBUILD_FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });

      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Falha ao recriar bootstrap do projeto.',
      );
    }
  }

  private resolveMaxProjects(entitlementsSnapshot: unknown): number {
    if (!entitlementsSnapshot || typeof entitlementsSnapshot !== 'object') {
      return 1;
    }

    const raw = (entitlementsSnapshot as Record<string, unknown>).maxProjects
      ?? (entitlementsSnapshot as Record<string, unknown>).max_projects;

    const parsed = Number(raw ?? 1);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }
}
