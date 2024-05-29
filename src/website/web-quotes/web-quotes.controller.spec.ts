import { Test, TestingModule } from '@nestjs/testing';
import { WebQuotationsController } from './web-quotes.controller';

describe('WebQuotationsController', () => {
  let controller: WebQuotationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebQuotationsController],
    }).compile();

    controller = module.get<WebQuotationsController>(WebQuotationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
