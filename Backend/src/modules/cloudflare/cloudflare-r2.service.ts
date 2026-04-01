import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeleteObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomBytes } from 'crypto';

type ProvisionProjectBootstrapInput = {
  bucket: string;
  prefix: string;
  manifestKey: string;
  projectId: string;
  projectSlug: string;
  projectName: string;
  releaseVersion: number;
  environments?: string[];
};

@Injectable()
export class CloudflareR2Service {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly endpoint: string;
  private readonly publicBaseUrl?: string;
  private readonly defaultEnvironments: string[];

  constructor(private readonly configService: ConfigService) {
    const accountId = this.required('cloudflare.accountId', 'CF_ACCOUNT_ID');
    const accessKeyId = this.required('cloudflare.r2AccessKeyId', 'CF_R2_ACCESS_KEY_ID');
    const secretAccessKey = this.required(
      'cloudflare.r2SecretAccessKey',
      'CF_R2_SECRET_ACCESS_KEY',
    );

    this.bucket = this.required('cloudflare.bucket', 'CF_R2_BUCKET');
    this.publicBaseUrl = this.configService.get<string>('cloudflare.publicBaseUrl') || undefined;
    this.defaultEnvironments = this.resolveDefaultEnvironments();
    this.endpoint = `https://${accountId}.r2.cloudflarestorage.com`;

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: this.endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  getBucketName(): string {
    return this.bucket;
  }

  getEndpoint(): string {
    return this.endpoint;
  }

  getDefaultEnvironments(): string[] {
    return [...this.defaultEnvironments];
  }

  async runWriteDeleteHealthcheck(): Promise<Record<string, unknown>> {
    const key = `__healthchecks/backend/${Date.now()}-${randomBytes(4).toString('hex')}.json`;
    const payload = {
      ok: true,
      source: 'backend',
      createdAt: new Date().toISOString(),
    };

    await this.putJsonObject(this.bucket, key, payload);
    const keysAfterWrite = await this.listKeys(this.bucket, key, 5);
    await this.deleteObject(this.bucket, key);

    return {
      ok: true,
      bucket: this.bucket,
      endpoint: this.endpoint,
      probeKey: key,
      visibleAfterWrite: keysAfterWrite.includes(key),
      publicBaseUrl: this.publicBaseUrl ?? null,
    };
  }

  async provisionProjectBootstrap(input: ProvisionProjectBootstrapInput) {
    const environments = input.environments?.length
      ? input.environments
      : this.getDefaultEnvironments();

    const expectedKeys = this.buildExpectedBootstrapKeys({
      prefix: input.prefix,
      manifestKey: input.manifestKey,
      environments,
    });

    const releaseManifest = this.buildReleaseManifest({
      projectId: input.projectId,
      projectSlug: input.projectSlug,
      projectName: input.projectName,
      prefix: input.prefix,
      manifestKey: input.manifestKey,
      releaseVersion: input.releaseVersion,
      environments,
    });

    await this.putJsonObject(input.bucket, input.manifestKey, releaseManifest);

    for (const environment of environments) {
      const environmentManifestKey = `${input.prefix}/envs/${environment}/manifest.json`;
      const homePageKey = `${input.prefix}/envs/${environment}/pages/home.json`;
      const settingsPageKey = `${input.prefix}/envs/${environment}/pages/settings.json`;

      await this.putJsonObject(input.bucket, environmentManifestKey, {
        schemaVersion: 1,
        projectId: input.projectId,
        projectSlug: input.projectSlug,
        projectName: input.projectName,
        environment,
        createdAt: new Date().toISOString(),
        entryPage: 'home',
        pages: [
          {
            id: 'home',
            slug: 'home',
            key: homePageKey,
            title: `Home ${environment.toUpperCase()}`,
          },
          {
            id: 'settings',
            slug: 'settings',
            key: settingsPageKey,
            title: `Settings ${environment.toUpperCase()}`,
          },
        ],
      });

      await this.putJsonObject(input.bucket, homePageKey, this.buildDefaultPage({
        projectId: input.projectId,
        projectSlug: input.projectSlug,
        projectName: input.projectName,
        environment,
        pageId: 'home',
        title: `Página inicial ${environment.toUpperCase()}`,
        description: 'Página criada automaticamente na ativação da chave.',
      }));

      await this.putJsonObject(input.bucket, settingsPageKey, this.buildDefaultPage({
        projectId: input.projectId,
        projectSlug: input.projectSlug,
        projectName: input.projectName,
        environment,
        pageId: 'settings',
        title: `Configurações ${environment.toUpperCase()}`,
        description: 'Página inicial de configurações do ambiente.',
      }));
    }

    return {
      bucket: input.bucket,
      prefix: input.prefix,
      manifestKey: input.manifestKey,
      publicBaseUrl: this.publicBaseUrl ?? null,
      environments,
      writtenKeys: expectedKeys,
    };
  }

  buildExpectedBootstrapKeys(input: {
    prefix: string;
    manifestKey: string;
    environments?: string[];
  }): string[] {
    const environments = input.environments?.length
      ? input.environments
      : this.getDefaultEnvironments();

    const keys = [input.manifestKey];

    for (const environment of environments) {
      keys.push(`${input.prefix}/envs/${environment}/manifest.json`);
      keys.push(`${input.prefix}/envs/${environment}/pages/home.json`);
      keys.push(`${input.prefix}/envs/${environment}/pages/settings.json`);
    }

    return keys;
  }

  async listKeys(bucket: string, prefix: string, maxKeys = 100): Promise<string[]> {
    const response = await this.s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        MaxKeys: maxKeys,
      }),
    );

    return (response.Contents ?? [])
      .map((item) => item.Key)
      .filter((value): value is string => Boolean(value));
  }

  async putJsonObject(bucket: string, key: string, payload: Record<string, unknown>): Promise<void> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: JSON.stringify(payload, null, 2),
        ContentType: 'application/json; charset=utf-8',
      }),
    );
  }

  async deleteObject(bucket: string, key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
  }

  private buildReleaseManifest(input: {
    projectId: string;
    projectSlug: string;
    projectName: string;
    prefix: string;
    manifestKey: string;
    releaseVersion: number;
    environments: string[];
  }): Record<string, unknown> {
    return {
      schemaVersion: 1,
      projectId: input.projectId,
      projectSlug: input.projectSlug,
      projectName: input.projectName,
      release: {
        version: input.releaseVersion,
        manifestKey: input.manifestKey,
        status: 'draft',
      },
      createdAt: new Date().toISOString(),
      environments: input.environments.map((environment) => ({
        id: environment,
        manifestKey: `${input.prefix}/envs/${environment}/manifest.json`,
        entryPageKey: `${input.prefix}/envs/${environment}/pages/home.json`,
      })),
    };
  }

  private buildDefaultPage(input: {
    projectId: string;
    projectSlug: string;
    projectName: string;
    environment: string;
    pageId: string;
    title: string;
    description: string;
  }): Record<string, unknown> {
    return {
      schemaVersion: 1,
      id: input.pageId,
      slug: input.pageId,
      title: input.title,
      description: input.description,
      projectId: input.projectId,
      projectSlug: input.projectSlug,
      projectName: input.projectName,
      environment: input.environment,
      createdAt: new Date().toISOString(),
      layout: {
        type: 'page',
        sections: [
          {
            id: 'hero',
            type: 'hero',
            title: `${input.projectName} · ${input.environment.toUpperCase()}`,
            subtitle: 'Estrutura inicial criada automaticamente pelo backend.',
          },
          {
            id: 'empty-state',
            type: 'empty-state',
            title: 'Sua página está pronta para edição',
            message: 'Agora você pode começar a adicionar widgets, tabelas e gráficos.',
          },
        ],
      },
      widgets: [],
    };
  }

  private resolveDefaultEnvironments(): string[] {
    const raw = this.configService.get<string>('cloudflare.defaultEnvironments')
      || 'dev,hml,prod';

    const values = raw
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

    return values.length ? values : ['dev', 'hml', 'prod'];
  }

  private required(path: string, envName: string): string {
    const value = this.configService.get<string>(path);

    if (!value) {
      throw new InternalServerErrorException(`${envName} não foi configurado.`);
    }

    return value;
  }
}
