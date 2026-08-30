import { DataSource } from "typeorm";
import * as bcrypt from 'bcrypt';
import { User, Investment, Transaction, Alert, UserSettings, Portfolio, Asset, StockReport } from './entities';

const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5433,
    username: "postgres",
    password: "postgres",
    database: "investment_db",
    entities: [User, Investment, Transaction, Alert, UserSettings, Portfolio, Asset, StockReport],
    synchronize: true,
    dropSchema: true,
    logging: false,
});

async function seed() {
    try {
        await AppDataSource.initialize();
        console.log("Data Source has been initialized!");

        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();

        // Disable foreign keys to allow truncate
        // await queryRunner.query(`SET session_replication_role = 'replica';`); 
        // Postgres specific usually. Or just safe order delete.

        await queryRunner.startTransaction();

        try {
            console.log("Cleaning database...");
            await queryRunner.query(`TRUNCATE TABLE transactions CASCADE`);
            await queryRunner.query(`TRUNCATE TABLE investments CASCADE`);
            await queryRunner.query(`TRUNCATE TABLE portfolios CASCADE`);
            await queryRunner.query(`TRUNCATE TABLE assets CASCADE`);
            await queryRunner.query(`TRUNCATE TABLE users CASCADE`);
            await queryRunner.query(`TRUNCATE TABLE stock_reports CASCADE`);
            console.log("Database cleaned.");

            console.log("Seeding Assets...");
            const assets = [
                // US Stocks
                { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', price: 178.25, sector: 'Technology', currency: 'USD' },
                { symbol: 'MSFT', name: 'Microsoft Corp.', type: 'stock', price: 368.45, sector: 'Technology', currency: 'USD' },
                { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock', price: 142.80, sector: 'Technology', currency: 'USD' },
                { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock', price: 242.84, sector: 'Consumer Cyclical', currency: 'USD' },
                { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock', price: 145.24, sector: 'Consumer Cyclical', currency: 'USD' },
                { symbol: 'NVDA', name: 'NVIDIA Corp.', type: 'stock', price: 485.40, sector: 'Technology', currency: 'USD' },
                { symbol: 'META', name: 'Meta Platforms Inc.', type: 'stock', price: 350.20, sector: 'Technology', currency: 'USD' },
                { symbol: 'JNJ', name: 'Johnson & Johnson', type: 'stock', price: 162.45, sector: 'Healthcare', currency: 'USD' },
                { symbol: 'PG', name: 'Procter & Gamble', type: 'stock', price: 148.90, sector: 'Consumer Defensive', currency: 'USD' },
                { symbol: 'KO', name: 'Coca-Cola', type: 'stock', price: 60.25, sector: 'Consumer Defensive', currency: 'USD' },
                { symbol: 'JPM', name: 'JPMorgan Chase & Co.', type: 'stock', price: 170.30, sector: 'Financial', currency: 'USD' },
                { symbol: 'V', name: 'Visa Inc.', type: 'stock', price: 260.50, sector: 'Financial', currency: 'USD' },
                { symbol: 'DIS', name: 'Walt Disney Co.', type: 'stock', price: 95.40, sector: 'Entertainment', currency: 'USD' },
                { symbol: 'NFLX', name: 'Netflix Inc.', type: 'stock', price: 485.20, sector: 'Entertainment', currency: 'USD' },

                // VN Stocks
                { symbol: 'VNM', name: 'Vinamilk', type: 'stock', price: 78500, sector: 'Consumer Goods', currency: 'VND' },
                { symbol: 'VCB', name: 'Vietcombank', type: 'stock', price: 92500, sector: 'Banking', currency: 'VND' },
                { symbol: 'HPG', name: 'Hoa Phat Group', type: 'stock', price: 28200, sector: 'Steel', currency: 'VND' },
                { symbol: 'VHM', name: 'Vinhomes', type: 'stock', price: 55800, sector: 'Real Estate', currency: 'VND' },
                { symbol: 'VIC', name: 'Vingroup', type: 'stock', price: 42300, sector: 'Conglomerate', currency: 'VND' },
                { symbol: 'FPT', name: 'FPT Corporation', type: 'stock', price: 125000, sector: 'Technology', currency: 'VND' },
                { symbol: 'MWG', name: 'Mobile World', type: 'stock', price: 58400, sector: 'Retail', currency: 'VND' },
                { symbol: 'TCB', name: 'Techcombank', type: 'stock', price: 48500, sector: 'Banking', currency: 'VND' },

                // Crypto
                { symbol: 'BTC', name: 'Bitcoin', type: 'crypto', price: 42650.00, sector: 'Cryptocurrency', currency: 'USD' },
                { symbol: 'ETH', name: 'Ethereum', type: 'crypto', price: 2245.00, sector: 'Cryptocurrency', currency: 'USD' },
                { symbol: 'SOL', name: 'Solana', type: 'crypto', price: 102.30, sector: 'Cryptocurrency', currency: 'USD' },
                { symbol: 'ADA', name: 'Cardano', type: 'crypto', price: 0.55, sector: 'Cryptocurrency', currency: 'USD' },
                { symbol: 'DOT', name: 'Polkadot', type: 'crypto', price: 7.20, sector: 'Cryptocurrency', currency: 'USD' },
                { symbol: 'BNB', name: 'Binance Coin', type: 'crypto', price: 315.40, sector: 'Cryptocurrency', currency: 'USD' },
                { symbol: 'XRP', name: 'Ripple', type: 'crypto', price: 0.62, sector: 'Cryptocurrency', currency: 'USD' },

                // Real Estate
                { symbol: 'VNQ', name: 'Vanguard Real Estate ETF', type: 'real_estate', price: 85.20, sector: 'Real Estate', currency: 'USD' },
                { symbol: 'SCHH', name: 'Schwab US REIT ETF', type: 'real_estate', price: 22.45, sector: 'Real Estate', currency: 'USD' },
                { symbol: 'IYR', name: 'iShares US Real Estate ETF', type: 'real_estate', price: 89.30, sector: 'Real Estate', currency: 'USD' },
                { symbol: 'XLRE', name: 'Real Estate Select Sector SPDR', type: 'real_estate', price: 38.75, sector: 'Real Estate', currency: 'USD' },

                // Funds
                { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', type: 'fund', price: 410.50, sector: 'Index Fund', currency: 'USD' },
                { symbol: 'QQQ', name: 'Invesco QQQ Trust', type: 'fund', price: 395.20, sector: 'Technology', currency: 'USD' },
                { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', type: 'fund', price: 235.80, sector: 'Index Fund', currency: 'USD' },
                { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', type: 'fund', price: 458.30, sector: 'Index Fund', currency: 'USD' },
                { symbol: 'VEA', name: 'Vanguard FTSE Developed Markets ETF', type: 'fund', price: 48.65, sector: 'International', currency: 'USD' },

                // Bonds
                { symbol: 'AGG', name: 'iShares Core US Aggregate Bond ETF', type: 'bond', price: 102.45, sector: 'Bonds', currency: 'USD' },
                { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', type: 'bond', price: 75.80, sector: 'Bonds', currency: 'USD' },
                { symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF', type: 'bond', price: 95.20, sector: 'Government Bonds', currency: 'USD' },
                { symbol: 'LQD', name: 'iShares iBoxx Investment Grade Corporate Bond ETF', type: 'bond', price: 112.35, sector: 'Corporate Bonds', currency: 'USD' },
            ];

            const assetMap = new Map(); // symbol -> uuid

            for (const asset of assets) {
                const res = await queryRunner.query(`
                    INSERT INTO assets (symbol, name, type, current_price, sector, currency, created_at, updated_at)
                    VALUES ('${asset.symbol}', '${asset.name}', '${asset.type}', ${asset.price}, '${asset.sector}', '${asset.currency}', NOW(), NOW())
                    RETURNING id;
                `);
                assetMap.set(asset.symbol, res[0].id);
            }

            console.log("Seeding Users...");
            const userId = '550e8400-e29b-41d4-a716-446655440000';
            const hashedPassword = await bcrypt.hash('password123', 10);
            await queryRunner.query(`
                INSERT INTO users (id, email, password, name, created_at, updated_at)
                VALUES ('${userId}', 'test@example.com', '${hashedPassword}', 'Test User', NOW(), NOW());
            `);

            console.log("Seeding Portfolios...");
            const p1 = 'd290f1ee-6c54-4b01-90e6-d701748f0851'; // Growth
            const p2 = 'd290f1ee-6c54-4b01-90e6-d701748f0852'; // Dividend
            const p3 = 'd290f1ee-6c54-4b01-90e6-d701748f0853'; // Crypto
            const p4 = 'd290f1ee-6c54-4b01-90e6-d701748f0854'; // Real Estate

            await queryRunner.query(`
                INSERT INTO portfolios (id, "userId", name, description, status, "createdAt", "updatedAt")
                VALUES 
                    ('${p1}', '${userId}', 'Growth Portfolio', 'High growth technology stocks', 'active', NOW(), NOW()),
                    ('${p2}', '${userId}', 'Dividend Portfolio', 'Stable income generating assets', 'active', NOW(), NOW()),
                    ('${p3}', '${userId}', 'Crypto Portfolio', 'Digital assets and web3', 'active', NOW(), NOW()),
                    ('${p4}', '${userId}', 'Real Estate', 'REITs and property funds', 'archived', NOW(), NOW());
            `);

            console.log("Seeding Investments...");
            // Helper to insert investment
            const insertInv = async (pid: string, symbol: string, qty: number, price: number) => {
                const assetId = assetMap.get(symbol);
                if (!assetId) {
                    console.error(`Asset ${symbol} not found!`);
                    return null;
                }
                const res = await queryRunner.query(`
                    INSERT INTO investments (user_id, portfolio_id, asset_id, quantity, average_price, created_at, updated_at)
                    VALUES ('${userId}', '${pid}', '${assetId}', ${qty}, ${price}, NOW(), NOW())
                    RETURNING id;
                `);
                return res[0].id;
            };

            // Growth
            const inv1 = await insertInv(p1, 'AAPL', 150, 165.40);
            const inv2 = await insertInv(p1, 'MSFT', 75, 355.20);
            const inv3 = await insertInv(p1, 'GOOGL', 50, 138.50);
            const inv4 = await insertInv(p1, 'TSLA', 50, 235.60);
            const inv_nvda = await insertInv(p1, 'NVDA', 20, 420.00);

            // Dividend
            const inv5 = await insertInv(p2, 'JNJ', 100, 158.30);
            const inv6 = await insertInv(p2, 'PG', 80, 145.20);
            const inv7 = await insertInv(p2, 'KO', 200, 58.40);
            const inv_jpm = await insertInv(p2, 'JPM', 50, 150.00);

            // Crypto
            const inv8 = await insertInv(p3, 'BTC', 1.25, 38200);
            const inv9 = await insertInv(p3, 'ETH', 8.5, 2180);
            const inv10 = await insertInv(p3, 'SOL', 150, 60.50); // increased quantity

            // Real Estate
            const inv11 = await insertInv(p4, 'VNQ', 100, 82.50);

            console.log("Seeding Transactions...");
            // Transactions (linked to investments)
            const insertTxn = async (invId: string, symbol: string, type: string, amount: number, qty: number, price: number, dateOffsetDays: number) => {
                if (!invId) return;
                await queryRunner.query(`
                    INSERT INTO transactions ("userId", "investmentId", type, amount, quantity, price, status, "transactionDate", symbol, notes, "createdAt", "updatedAt")
                    VALUES ('${userId}', '${invId}', '${type}', ${amount}, ${qty}, ${price}, 'completed', NOW() - INTERVAL '${dateOffsetDays} days', '${symbol}', 'Seeded transaction', NOW(), NOW())
                `);
            };

            // Generate some history
            await insertTxn(inv1, 'AAPL', 'buy', 24810, 150, 165.40, 90);
            await insertTxn(inv2, 'MSFT', 'buy', 26640, 75, 355.20, 120);
            await insertTxn(inv8, 'BTC', 'buy', 47750, 1.25, 38200, 180);
            await insertTxn(inv9, 'ETH', 'buy', 18530, 8.5, 2180, 150);

            // Some recent activity
            await insertTxn(inv1, 'AAPL', 'dividend', 82.50, 0, 0, 30); // Dividend
            await insertTxn(inv3, 'GOOGL', 'buy', 6925, 50, 138.50, 45);

            console.log("Seeding Stock Reports...");
            const reports = [
                { symbol: 'AAPL', title: 'Apple Intelligence: The New Growth Driver', summary: 'AI features in iOS 18 are expected to drive a massive iPhone upgrade cycle in 2024-2025.', author: 'John Smith', type: 'report', category: 'Technology' },
                { symbol: 'AAPL', title: 'Supply Chain Optimizations in Vietnam', summary: 'Apple continues to diversify its manufacturing base, with Vietnam playing a critical role in MacBook production.', author: 'Market Insights', type: 'news', category: 'Operations' },
                { symbol: 'MSFT', title: 'Azure AI Scale: Breaking Down the Q3 Earnings', summary: 'Microsoft\'\'s cloud business remains the dominant force in enterprise AI adoption.', author: 'Tech Analyst', type: 'report', category: 'Technology' },
                { symbol: 'BTC', title: 'The Halving Effect: Historical Patterns and Future Outlook', summary: 'Analyzing the potential price impact of the upcoming Bitcoin halving event based on previous cycles.', author: 'Crypto Whale', type: 'report', category: 'Crypto' },
                { symbol: 'TSLA', title: 'FDS v12: Is Full Self-Driving Finally Here?', summary: 'The latest software update shows significant improvement in end-to-end neural networks.', author: 'EV Daily', type: 'news', category: 'Automotive' }
            ];

            for (const report of reports) {
                await queryRunner.query(`
                    INSERT INTO stock_reports (title, summary, author, symbol, type, category, "publishedDate", "createdAt", "updatedAt")
                    VALUES ('${report.title}', '${report.summary}', '${report.author}', '${report.symbol}', '${report.type}', '${report.category}', NOW() - INTERVAL '2 days', NOW(), NOW())
                `);
            }

            await queryRunner.commitTransaction();
            console.log("Seed completed successfully!");

        } catch (err) {
            console.error("Error during seed:", err);
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }

    } catch (error) {
        console.error("Error connecting to database:", error);
    } finally {
        await AppDataSource.destroy();
    }
}

seed();
