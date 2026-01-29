import { Controller, Get, HttpStatus } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  getStatus(): HttpStatus {
    return HttpStatus.OK;
  }
}
