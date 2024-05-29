import { Test, TestingModule } from '@nestjs/testing';
import { WebQuotationsService } from './web-quotes.service';

describe('WebQuotationsService', () => {
  let service: WebQuotationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebQuotationsService],
    }).compile();

    service = module.get<WebQuotationsService>(WebQuotationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
