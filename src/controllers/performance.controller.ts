import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { PerformanceService } from '../services/performance.service';
import { PeriodType, RoleTier } from 'src/models/helper';

/**
 * 📊 PerformanceController
 * Controller for APIs providing performance (efficiency) data for teams, sales (users), or the whole company (company-wide)
 * - Supplies performance info by period (week, month)
 * - Supports queries/statistics for admin dashboards, reports, etc.
 * - All endpoints require authentication (AuthGuard)
 */
@UseGuards(AuthGuard)
@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  /**
   * 🔄 Calculate and initialize all performance data based on current deposit agreements and appointments.
   * POST /performance/calculate
   */
  @Post('calculate')
  async calculateAllPerformance(@Req() request: Request) {
    const requestorID = request['resourceRequestUserID'] as string; // 👤 Extract user ID
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[]; // 🏷️ Extract role IDs
    return await this.performanceService.calculateAllPerformance(
      requestorID,
      requestorRoleIDs,
    );
  }

  /**
   * 📈 Get performance info filtered by period (week/month) and role tier (collaborator, saler, team, company).
   * GET /performance
   * @param periodType - 'week' | 'month'
   * @param periodName - string (e.g. '2025-W27' or '2025-07')
   * @param roleTier - 'collaborator' | 'saler' | 'team' | 'company'
   */
  @Get()
  async getPerformance(
    @Req() request: Request,
    @Query('periodType') periodType: PeriodType, // 🏷️ Use enum PeriodType
    @Query('periodName') periodName: string,
    @Query('roleTier') roleTier: RoleTier, // 🏷️ Use enum RoleTier
  ) {
    const requestorID = request['resourceRequestUserID'] as string; // 👤 Extract user ID
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[]; // 🏷️ Extract role IDs
    return await this.performanceService.getPerformance(
      periodType,
      periodName,
      roleTier,
      requestorID,
      requestorRoleIDs,
    );
  }

  /**
   * 🏷️ Get all deposit agreements related to a specific Deposit Agreement entity.
   * GET /performance/:depositAgreementID/deposit-agreements
   * @param depositAgreementID - Deposit Agreement entity ID
   */
  @Get(':depositAgreementID/deposit-agreements')
  async getDepositAgreements(
    @Req() request: Request,
    @Param('depositAgreementID') depositAgreementID: number,
  ) {
    const requestorID = request['resourceRequestUserID'] as string; // 👤 Extract user ID
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[]; // 🏷️ Extract role IDs
    return await this.performanceService.getDepositAgreementsByPerformance(
      depositAgreementID,
      requestorID,
      requestorRoleIDs,
    );
  }

  /**
   * 📊 Get basic performance info as array for charting/graphing.
   * GET /performance/chart-data
   * @param periodType - 'week' | 'month'
   * @param periodName - string (e.g. '2025-W27' or '2025-07')
   * @param roleTier - 'collaborator' | 'saler' | 'team' | 'company'
   * @param performanceID - optional: performance entity ID
   */
  @Get('chart-data')
  async getPerformanceChartData(
    @Req() request: Request,
    @Query('periodType') periodType: PeriodType, // 🏷️ Use enum PeriodType
    @Query('periodName') periodName: string,
    @Query('roleTier') roleTier: RoleTier, // 🏷️ Use enum RoleTier
    @Query('performanceID') performanceID?: string,
  ) {
    const requestorID = request['resourceRequestUserID'] as string; // 👤 Extract user ID
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[]; // 🏷️ Extract role IDs
    return await this.performanceService.getPerformanceChartData(
      periodType,
      periodName,
      roleTier,
      performanceID,
      requestorID,
      requestorRoleIDs,
    );
  }
}
