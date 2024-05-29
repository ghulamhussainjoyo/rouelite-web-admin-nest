import { Test, TestingModule } from '@nestjs/testing';
import { WebLeadController } from './web-lead.controller';

describe('WebLeadController', () => {
  let controller: WebLeadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebLeadController],
    }).compile();

    controller = module.get<WebLeadController>(WebLeadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
