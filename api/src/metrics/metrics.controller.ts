import { Controller, Get } from '@nestjs/common';

// TODO: Implement GET /metrics endpoint (Stage 6)
@Controller('metrics')
export class MetricsController {
  @Get()
  getMetrics() {
    return 'Metrics endpoint - TODO';
  }
}
