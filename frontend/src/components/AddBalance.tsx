import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";

const cryptoLogos = [
  { name: "Bitcoin", symbol: "BTC", color: "bg-orange-500" },
  { name: "Ethereum", symbol: "ETH", color: "bg-blue-500" },
  { name: "Litecoin", symbol: "LTC", color: "bg-gray-400" },
  { name: "Ripple", symbol: "XRP", color: "bg-neutral-700" },
];

export function AddBalance() {
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-cyan-400 to-cyan-500 text-white p-6">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
      
      <div className="relative z-10">
        <h2 className="mb-6">Add balance</h2>
        
        {/* Crypto Icons */}
        <div className="flex gap-3 mb-6">
          {cryptoLogos.map((crypto, index) => (
            <button
              key={index}
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors flex items-center justify-center"
            >
              <div className={`w-8 h-8 ${crypto.color} rounded-full flex items-center justify-center text-white text-xs`}>
                {crypto.symbol.charAt(0)}
              </div>
            </button>
          ))}
        </div>
        
        <Button className="w-full bg-white text-cyan-500 hover:bg-white/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Funds
        </Button>
      </div>
    </Card>
  );
}
