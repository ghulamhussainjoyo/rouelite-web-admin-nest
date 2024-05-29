import { Test, TestingModule } from '@nestjs/testing';
import { WebLeadService } from './web-lead.service';

describe('WebLeadService', () => {
  let service: WebLeadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebLeadService],
    }).compile();

    service = module.get<WebLeadService>(WebLeadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
