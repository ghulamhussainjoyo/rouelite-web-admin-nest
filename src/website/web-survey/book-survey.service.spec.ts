import { Test, TestingModule } from '@nestjs/testing';
import { BookSurveyService } from './book-survey.service';

describe('BookedSurveyService', () => {
  let service: BookSurveyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookSurveyService],
    }).compile();

    service = module.get<BookSurveyService>(BookSurveyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
