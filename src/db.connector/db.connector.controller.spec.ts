import { Test, TestingModule } from '@nestjs/testing';
import { DbConnectorController } from './db.connector.controller';

describe('DbConnectorController', () => {
  let controller: DbConnectorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DbConnectorController],
    }).compile();

    controller = module.get<DbConnectorController>(DbConnectorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
