import { Module } from '@nestjs/common';
import { DbConnectorService } from './db.connector.service';
import { DbConnectorController } from './db.connector.controller';

@Module({
  providers: [DbConnectorService],
  controllers: [DbConnectorController],
})
export class DbConnectorModule {}
