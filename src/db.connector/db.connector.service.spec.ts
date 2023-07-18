import { Test, TestingModule } from '@nestjs/testing';
import { DbConnectorService } from './db.connector.service';

describe('DbConnectorService', () => {
  let service: DbConnectorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DbConnectorService],
    }).compile();

    service = module.get<DbConnectorService>(DbConnectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
