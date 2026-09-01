import { Controller, Get } from "@nestjs/common";

@Controller('hello')
export class AppController {
    @Get('aaa')
    async hello() {
        return "aaaaaaaaaaaaaaaaaaa";
    }
}