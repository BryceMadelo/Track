import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { exec } from 'child_process';
import { join } from 'path';
import { ExecutionService } from './execution.service';
import { ExecutionStatus } from './execution.entity';

@Processor('execution')
export class ExecutionProcessor {
  private readonly logger = new Logger(ExecutionProcessor.name);

  constructor(private executionService: ExecutionService) {}

  @Process('mobile')
  async runMobile(job: Job) {
    this.logger.log(`Processing mobile job ${job.id}`);
    const { username, password, executionId } = job.data;

    await this.executionService.updateExecution(executionId, {
      status: ExecutionStatus.RUNNING,
    });

    return new Promise((resolve, reject) => {
      const runnerPath = join(__dirname, '..', '..', '..', 'runners', 'mobile');

      exec(
        'npm run wdio',
        {
          cwd: runnerPath,
          env: {
            ...process.env,
            MOBILE_USERNAME: username,
            MOBILE_PASSWORD: password,
          },
        },
        async (error, stdout, stderr) => {
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
        },
      );
    });
  }

  @Process('web')
  async runWeb(job: Job) {
    this.logger.log(`Processing web job ${job.id}`);
    const { username, password, url, executionId } = job.data;

    await this.executionService.updateExecution(executionId, {
      status: ExecutionStatus.RUNNING,
    });

    return new Promise((resolve, reject) => {
      const runnerPath = join(
        __dirname,
        '..',
        '..',
        '..',
        'runners',
        'playwright',
      );

      exec(
        'npm test',
        {
          cwd: runnerPath,
          env: {
            ...process.env,
            WEB_USERNAME: username,
            WEB_PASSWORD: password,
            WEB_BASE_URL: url,
          },
        },
        async (error, stdout, stderr) => {
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
        },
      );
    });
  }

  @Process('visual-web')
  async runVisualWeb(job: Job) {
    this.logger.log(`Processing visual web job ${job.id}`);
    const {
      username,
      password,
      url,
      engine,
      featureTitle,
      scenarioTitle,
      steps,
      executionId,
    } = job.data;

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

    const fs = require('fs');
    const os = require('os');
    const tmpDir = fs.mkdtempSync(join(os.tmpdir(), `qat-visual-${job.id}-`));
    const featurePath = join(tmpDir, 'visual_test.feature');

    fs.writeFileSync(featurePath, featureContent, 'utf8');
    this.logger.log(`Feature file written to: ${featurePath}`);

    // Build env vars including screenshot flags
    const screenshotSteps = steps
      .filter((s: any) => s.captureScreenshot)
      .map((s: any) => s.title)
      .join(',');

    return new Promise((resolve, reject) => {
      exec(
        `npx cucumber-js "${featurePath}" --profile visual`,
        {
          cwd: runnerPath,
          env: {
            ...process.env,
            WEB_USERNAME: username,
            WEB_PASSWORD: password,
            WEB_BASE_URL: url,
            CAPTURE_SCREENSHOTS: 'true',
            SCREENSHOT_STEPS: screenshotSteps,
          },
        },
        async (error, stdout, stderr) => {
          // Clean up the temporary feature file and directory
          try {
            if (fs.existsSync(featurePath)) {
              fs.unlinkSync(featurePath);
            }
            if (fs.existsSync(tmpDir)) {
              fs.rmdirSync(tmpDir);
            }
            this.logger.log(`Cleaned up temp directory: ${tmpDir}`);
          } catch (cleanupError) {
            this.logger.error(
              `Failed to clean up temp directory: ${cleanupError}`,
            );
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
        },
      );
    });
  }
}
