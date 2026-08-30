import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class SeedData1704556800000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create test user
        const hashedPassword = await bcrypt.hash('password123', 10);
        await queryRunner.query(`
            INSERT INTO users (id, email, password, name, created_at, updated_at)
            VALUES 
                ('550e8400-e29b-41d4-a716-446655440000', 'test@example.com', '${hashedPassword}', 'Test User', NOW(), NOW())
            ON CONFLICT (email) DO NOTHING;
        `);

        const userId = '550e8400-e29b-41d4-a716-446655440000';

        // Create portfolios
        await queryRunner.query(`
            INSERT INTO portfolios (id, "userId", name, description, status, created_at, updated_at)
            VALUES 
                ('portfolio-1', '${userId}', 'Growth Portfolio', 'Long-term growth focused investments', 'active', NOW(), NOW()),
                ('portfolio-2', '${userId}', 'Dividend Portfolio', 'Income generating assets', 'active', NOW(), NOW()),
                ('portfolio-3', '${userId}', 'Crypto Portfolio', 'Cryptocurrency investments', 'active', NOW(), NOW()),
                ('portfolio-4', '${userId}', 'Real Estate', 'Real estate and REITs', 'archived', NOW(), NOW())
            ON CONFLICT (id) DO NOTHING;
        `);

        // Create investments
        await queryRunner.query(`
            INSERT INTO investments (id, user_id, portfolio_id, symbol, name, quantity, purchase_price, current_price, type, created_at, updated_at)
            VALUES 
                -- Growth Portfolio
                ('inv-1', '${userId}', 'portfolio-1', 'AAPL', 'Apple Inc.', 150, 165.40, 178.25, 'stock', NOW(), NOW()),
                ('inv-2', '${userId}', 'portfolio-1', 'MSFT', 'Microsoft Corp.', 75, 355.20, 368.45, 'stock', NOW(), NOW()),
                ('inv-3', '${userId}', 'portfolio-1', 'GOOGL', 'Alphabet Inc.', 50, 138.50, 142.80, 'stock', NOW(), NOW()),
                ('inv-4', '${userId}', 'portfolio-1', 'TSLA', 'Tesla Inc.', 50, 235.60, 242.84, 'stock', NOW(), NOW()),
                
                -- Dividend Portfolio
                ('inv-5', '${userId}', 'portfolio-2', 'JNJ', 'Johnson & Johnson', 100, 158.30, 162.45, 'stock', NOW(), NOW()),
                ('inv-6', '${userId}', 'portfolio-2', 'PG', 'Procter & Gamble', 80, 145.20, 148.90, 'stock', NOW(), NOW()),
                ('inv-7', '${userId}', 'portfolio-2', 'KO', 'Coca-Cola', 200, 58.40, 60.25, 'stock', NOW(), NOW()),
                
                -- Crypto Portfolio
                ('inv-8', '${userId}', 'portfolio-3', 'BTC', 'Bitcoin', 1.25, 38200, 42650, 'crypto', NOW(), NOW()),
                ('inv-9', '${userId}', 'portfolio-3', 'ETH', 'Ethereum', 8.5, 2180, 2245, 'crypto', NOW(), NOW()),
                ('inv-10', '${userId}', 'portfolio-3', 'SOL', 'Solana', 50, 95.50, 102.30, 'crypto', NOW(), NOW()),
                
                -- Real Estate (archived)
                ('inv-11', '${userId}', 'portfolio-4', 'VNQ', 'Vanguard Real Estate ETF', 100, 82.50, 85.20, 'etf', NOW(), NOW())
            ON CONFLICT (id) DO NOTHING;
        `);

        // Create transactions
        await queryRunner.query(`
            INSERT INTO transactions (id, "userId", "investmentId", type, amount, quantity, price, fees, status, transaction_date, symbol, notes, created_at, updated_at)
            VALUES 
                -- AAPL transactions
                ('txn-1', '${userId}', 'inv-1', 'buy', 24810.00, 150, 165.40, 10.00, 'completed', NOW() - INTERVAL '90 days', 'AAPL', 'Initial purchase', NOW(), NOW()),
                ('txn-2', '${userId}', 'inv-1', 'dividend', 82.50, 0, 0, 0, 'completed', NOW() - INTERVAL '30 days', 'AAPL', 'Quarterly dividend', NOW(), NOW()),
                
                -- MSFT transactions
                ('txn-3', '${userId}', 'inv-2', 'buy', 26640.00, 75, 355.20, 15.00, 'completed', NOW() - INTERVAL '120 days', 'MSFT', 'Initial purchase', NOW(), NOW()),
                
                -- BTC transactions
                ('txn-4', '${userId}', 'inv-8', 'buy', 47750.00, 1.25, 38200, 50.00, 'completed', NOW() - INTERVAL '180 days', 'BTC', 'Bitcoin accumulation', NOW(), NOW()),
                ('txn-5', '${userId}', 'inv-8', 'buy', 9550.00, 0.25, 38200, 10.00, 'completed', NOW() - INTERVAL '60 days', 'BTC', 'Additional purchase', NOW(), NOW()),
                
                -- ETH transactions
                ('txn-6', '${userId}', 'inv-9', 'buy', 18530.00, 8.5, 2180, 20.00, 'completed', NOW() - INTERVAL '150 days', 'ETH', 'Ethereum position', NOW(), NOW()),
                
                -- Recent transactions
                ('txn-7', '${userId}', 'inv-3', 'buy', 6925.00, 50, 138.50, 5.00, 'completed', NOW() - INTERVAL '45 days', 'GOOGL', 'Google shares', NOW(), NOW()),
                ('txn-8', '${userId}', 'inv-4', 'buy', 11780.00, 50, 235.60, 10.00, 'completed', NOW() - INTERVAL '30 days', 'TSLA', 'Tesla position', NOW(), NOW()),
                ('txn-9', '${userId}', 'inv-5', 'buy', 15830.00, 100, 158.30, 10.00, 'completed', NOW() - INTERVAL '75 days', 'JNJ', 'Dividend stock', NOW(), NOW()),
                ('txn-10', '${userId}', 'inv-6', 'buy', 11616.00, 80, 145.20, 8.00, 'completed', NOW() - INTERVAL '60 days', 'PG', 'Consumer staples', NOW(), NOW()),
                ('txn-11', '${userId}', 'inv-7', 'buy', 11680.00, 200, 58.40, 5.00, 'completed', NOW() - INTERVAL '90 days', 'KO', 'Dividend income', NOW(), NOW()),
                ('txn-12', '${userId}', 'inv-10', 'buy', 4775.00, 50, 95.50, 5.00, 'completed', NOW() - INTERVAL '40 days', 'SOL', 'Solana crypto', NOW(), NOW()),
                ('txn-13', '${userId}', 'inv-11', 'buy', 8250.00, 100, 82.50, 5.00, 'completed', NOW() - INTERVAL '200 days', 'VNQ', 'REIT investment', NOW(), NOW())
            ON CONFLICT (id) DO NOTHING;
        `);

        console.log('Seed data inserted successfully');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const userId = '550e8400-e29b-41d4-a716-446655440000';

        await queryRunner.query(`DELETE FROM transactions WHERE "userId" = '${userId}';`);
        await queryRunner.query(`DELETE FROM investments WHERE user_id = '${userId}';`);
        await queryRunner.query(`DELETE FROM portfolios WHERE "userId" = '${userId}';`);
        await queryRunner.query(`DELETE FROM users WHERE id = '${userId}';`);

        console.log('Seed data removed successfully');
    }
}
