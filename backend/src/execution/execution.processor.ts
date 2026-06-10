import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { exec } from 'child_process';
import { join } from 'path';
import { ExecutionService } from './execution.service';
import { ExecutionStatus } from './execution.entity';
import { decrypt } from './crypto.util';
import * as fs from 'fs';

@Processor('execution')
export class ExecutionProcessor {
  private readonly logger = new Logger(ExecutionProcessor.name);

  constructor(private executionService: ExecutionService) {}

  @Process('mobile')
  async runMobile(job: Job) {
    this.logger.log(`Processing mobile job ${job.id}`);
    const { username, executionId } = job.data;
    const password = decrypt(job.data.password);
    const vaultToken = this.executionService.storeSecret(password);

    await this.executionService.updateExecution(executionId, {
      status: ExecutionStatus.RUNNING,
    });

    return new Promise((resolve, reject) => {
      const runnerPath = join(
        __dirname, '..', '..', '..', 'runners', 'mobile',
      );

      exec(`npm run wdio`, {
        cwd: runnerPath,
        env: {
          ...process.env,
          MOBILE_USERNAME: username,
          VAULT_TOKEN: vaultToken,
          VAULT_URL: 'http://localhost:3000/executions/vault',
        },
      }, async (error, stdout, stderr) => {
        if (error) {
          await this.executionService.updateExecution(executionId, {
            status: ExecutionStatus.FAILED,
            output: stdout,
            error: stderr || error.message,
            finishedAt: new Date(),
          });
          reject(stderr || error.message);
          return;
        }
        await this.executionService.updateExecution(executionId, {
          status: ExecutionStatus.PASSED,
          output: stdout,
          finishedAt: new Date(),
        });
        this.logger.log(`Mobile job ${job.id} completed successfully`);
        resolve(stdout);
      });
    });
  }

  @Process('web')
  async runWeb(job: Job) {
    this.logger.log(`Processing web job ${job.id}`);
    const { username, url, executionId } = job.data;
    const password = decrypt(job.data.password);
    const vaultToken = this.executionService.storeSecret(password);

    await this.executionService.updateExecution(executionId, {
      status: ExecutionStatus.RUNNING,
    });

    return new Promise((resolve, reject) => {
      const runnerPath = join(
        __dirname, '..', '..', '..', 'runners', 'playwright',
      );

      exec(`npm test`, {
        cwd: runnerPath,
        env: {
          ...process.env,
          WEB_USERNAME: username,
          WEB_BASE_URL: url,
          VAULT_TOKEN: vaultToken,
          VAULT_URL: 'http://localhost:3000/executions/vault',
        },
      }, async (error, stdout, stderr) => {
        if (error) {
          await this.executionService.updateExecution(executionId, {
            status: ExecutionStatus.FAILED,
            output: stdout,
            error: stderr || error.message,
            finishedAt: new Date(),
          });
          reject(stderr || error.message);
          return;
        }
        await this.executionService.updateExecution(executionId, {
          status: ExecutionStatus.PASSED,
          output: stdout,
          finishedAt: new Date(),
        });
        this.logger.log(`Web job ${job.id} completed successfully`);
        resolve(stdout);
      });
    });
  }

  @Process('visual-web')
  async runVisualWeb(job: Job) {
    this.logger.log(`Processing visual web job ${job.id}`);
    const { username, url, engine, featureTitle, scenarioTitle, steps, executionId } = job.data;
    const password = decrypt(job.data.password);
    const vaultToken = this.executionService.storeSecret(password);

    await this.executionService.updateExecution(executionId, {
      status: ExecutionStatus.RUNNING,
    });

    // Generate feature file content
    const stepsText = steps
      .map((s: any) => `    ${s.keyword} ${s.title}`)
      .join('\n');

    const featureContent = `Feature: ${featureTitle}\n\n  Scenario: ${scenarioTitle}\n${stepsText}\n`;

    // Write feature file to the correct runner
    const runnerName = engine === 'selenium' ? 'selenium' : 'playwright';
    const runnerPath = join(__dirname, '..', '..', '..', 'runners', runnerName);
    const uniqueFileName = `visual_test_${job.id}_${executionId}.feature`;
    const featurePath = join(runnerPath, 'features', uniqueFileName);

    fs.writeFileSync(featurePath, featureContent, 'utf8');
    this.logger.log(`Feature file written to: ${featurePath}`);

    // Build env vars including screenshot flags
    const screenshotSteps = steps
      .filter((s: any) => s.captureScreenshot)
      .map((s: any) => s.title)
      .join(',');

    return new Promise((resolve, reject) => {
      exec(`npx cucumber-js ./features/${uniqueFileName} --profile visual`, {
        cwd: runnerPath,
        env: {
          ...process.env,
          WEB_USERNAME: username,
          WEB_BASE_URL: url,
          CAPTURE_SCREENSHOTS: 'true',
          SCREENSHOT_STEPS: screenshotSteps,
          VAULT_TOKEN: vaultToken,
          VAULT_URL: 'http://localhost:3000/executions/vault',
        },
      }, async (error, stdout, stderr) => {
        // Clean up the temporary feature file
        try {
          if (fs.existsSync(featurePath)) {
            fs.unlinkSync(featurePath);
            this.logger.log(`Cleaned up feature file: ${featurePath}`);
          }
        } catch (cleanupError) {
          this.logger.error(`Failed to clean up files: ${cleanupError}`);
        }

        if (error) {
          await this.executionService.updateExecution(executionId, {
            status: ExecutionStatus.FAILED,
            output: stdout,
            error: stderr || error.message,
            finishedAt: new Date(),
          });
          reject(stderr || error.message);
          return;
        }
        await this.executionService.updateExecution(executionId, {
          status: ExecutionStatus.PASSED,
          output: stdout,
          finishedAt: new Date(),
        });
        this.logger.log(`Visual web job ${job.id} completed successfully`);
        resolve(stdout);
      });
    });
  }
}