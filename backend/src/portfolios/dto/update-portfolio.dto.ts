import { CreatePortfolioDto } from './create-portfolio.dto';

export class UpdatePortfolioDto implements Partial<CreatePortfolioDto> {
    name?: string;
    description?: string;
    status?: 'active' | 'archived';
    color?: string;
    icon?: string;
}
