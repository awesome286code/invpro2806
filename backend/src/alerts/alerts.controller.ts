import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('alerts')
@UseGuards(JwtAuthGuard)
export class AlertsController {
    constructor(private readonly alertsService: AlertsService) { }

    @Post()
    create(@Request() req, @Body() createAlertDto: CreateAlertDto) {
        return this.alertsService.create(req.user.id, createAlertDto);
    }

    @Get()
    findAll(@Request() req) {
        return this.alertsService.findAll(req.user.id);
    }

    @Get('active')
    findActive(@Request() req) {
        return this.alertsService.findActive(req.user.id);
    }

    @Get('stats')
    getStats(@Request() req) {
        return this.alertsService.getStats(req.user.id);
    }

    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
        return this.alertsService.findOne(id, req.user.id);
    }

    @Post(':id/trigger')
    trigger(@Request() req, @Param('id') id: string) {
        return this.alertsService.trigger(id, req.user.id);
    }

    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() updateAlertDto: UpdateAlertDto) {
        return this.alertsService.update(id, req.user.id, updateAlertDto);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.alertsService.remove(id, req.user.id);
    }
}
