import { Controller, Get, Put, Post, Delete, Body, UseGuards, Request } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    findSettings(@Request() req) {
        return this.settingsService.findOrCreate(req.user.id);
    }

    @Put()
    update(@Request() req, @Body() updateSettingsDto: UpdateSettingsDto) {
        return this.settingsService.update(req.user.id, updateSettingsDto);
    }

    @Post('api-key')
    generateApiKey(@Request() req) {
        return this.settingsService.generateApiKey(req.user.id);
    }

    @Delete('api-key')
    revokeApiKey(@Request() req) {
        return this.settingsService.revokeApiKey(req.user.id);
    }
}
