import { Subject, Observable, animationFrameScheduler, combineLatest, of } from 'rxjs';
import { map, distinctUntilChanged, observeOn, shareReplay, filter, startWith } from 'rxjs/operators';

export interface MarketTick {
    symbol: string;
    price: number;
    timestamp: string;
}

class MarketDataStreamService {
    private tick$ = new Subject<MarketTick>();
    private streams = new Map<string, Observable<number>>();

    /**
     * Push a new tick into the stream
     */
    pushTick(tick: MarketTick) {
        this.tick$.next(tick);
    }

    /**
     * Get an optimized price stream for a specific symbol
     */
    getPriceStream(symbol: string): Observable<number> {
        if (!this.streams.has(symbol)) {
            const optimizedStream = this.tick$.pipe(
                filter(tick => tick.symbol === symbol),
                map(tick => tick.price),
                distinctUntilChanged(),
                observeOn(animationFrameScheduler),
                shareReplay(1)
            );
            this.streams.set(symbol, optimizedStream);
        }
        return this.streams.get(symbol)!;
    }

    /**
     * Get an aggregate summary stream for a list of holdings
     */
    getSummaryStream(holdings: { symbol: string, quantity: number, costBasis: number }[]): Observable<{ totalValue: number, totalGL: number, totalGLPercent: number }> {
        if (holdings.length === 0) return of({ totalValue: 0, totalGL: 0, totalGLPercent: 0 });

        const priceStreams = holdings.map(h =>
            this.getPriceStream(h.symbol).pipe(startWith(0))
        );

        return combineLatest(priceStreams).pipe(
            map(prices => {
                let totalValue = 0;
                let totalCost = 0;

                holdings.forEach((h, i) => {
                    const price = prices[i];
                    if (price > 0) {
                        totalValue += price * h.quantity;
                        totalCost += h.costBasis * h.quantity;
                    }
                });

                const totalGL = totalValue - totalCost;
                const totalGLPercent = totalCost > 0 ? (totalGL / totalCost) * 100 : 0;

                return { totalValue, totalGL, totalGLPercent };
            }),
            distinctUntilChanged((prev, curr) =>
                Math.abs(prev.totalValue - curr.totalValue) < 0.01 &&
                Math.abs(prev.totalGL - curr.totalGL) < 0.01
            ),
            observeOn(animationFrameScheduler),
            shareReplay(1)
        );
    }
}

export const marketDataStream = new MarketDataStreamService();
