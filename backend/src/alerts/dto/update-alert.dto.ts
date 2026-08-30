import { CreateAlertDto } from './create-alert.dto';

export class UpdateAlertDto implements Partial<CreateAlertDto> {
    symbol?: string;
    type?: 'price_above' | 'price_below' | 'percent_change' | 'volume';
    targetValue?: number;
    status?: 'active' | 'triggered' | 'expired' | 'disabled';
    expiresAt?: string;
    message?: string;
    notifyEmail?: boolean;
    notifyPush?: boolean;
}
