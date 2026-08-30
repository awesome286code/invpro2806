import { CreateTransactionDto } from './create-transaction.dto';

export class UpdateTransactionDto implements Partial<CreateTransactionDto> {
    investmentId?: string;
    type?: 'buy' | 'sell' | 'dividend' | 'split' | 'transfer' | 'fee';
    amount?: number;
    quantity?: number;
    price?: number;
    fees?: number;
    status?: 'pending' | 'completed' | 'failed' | 'cancelled';
    transactionDate?: string;
    notes?: string;
    symbol?: string;
}
