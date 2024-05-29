import { Test, TestingModule } from '@nestjs/testing';
import { BookedSurveyController } from './book-survey.controller';

describe('BookedSurveyController', () => {
  let controller: BookedSurveyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookedSurveyController],
    }).compile();

    controller = module.get<BookedSurveyController>(BookedSurveyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
