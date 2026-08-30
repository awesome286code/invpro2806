import { useEffect, useRef, useState } from "react";
import Phaser from "phaser@3.87.0";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { toast } from "sonner@2.0.3";
import { Gift, Sparkles, DollarSign, Crown, Zap, TrendingUp } from "lucide-react";
import { SubscriptionTier } from "../subscription/SubscriptionManager";

interface SpinningWheelProps {
  currentTier: SubscriptionTier;
  onReward: (reward: WheelReward) => void;
}

export interface WheelReward {
  type: "balance" | "subscription" | "ai_credits" | "discount" | "analysis" | "nothing";
  value: number;
  label: string;
  icon: any;
  color: string;
}

const rewards: WheelReward[] = [
  { type: "balance", value: 100, label: "$100 Bonus", icon: DollarSign, color: "#10b981" },
  { type: "ai_credits", value: 50, label: "50 AI Credits", icon: Sparkles, color: "#8b5cf6" },
  { type: "nothing", value: 0, label: "Try Again", icon: Gift, color: "#6b7280" },
  { type: "balance", value: 500, label: "$500 Bonus", icon: DollarSign, color: "#10b981" },
  { type: "subscription", value: 7, label: "7 Days Pro", icon: Crown, color: "#06b6d4" },
  { type: "discount", value: 20, label: "20% Off Fees", icon: TrendingUp, color: "#f59e0b" },
  { type: "balance", value: 250, label: "$250 Bonus", icon: DollarSign, color: "#10b981" },
  { type: "analysis", value: 1, label: "Premium Analysis", icon: Zap, color: "#ec4899" },
];

class WheelScene extends Phaser.Scene {
  private wheel?: Phaser.GameObjects.Graphics;
  private pointer?: Phaser.GameObjects.Graphics;
  private centerText?: Phaser.GameObjects.Text;
  private spinning: boolean = false;
  private currentRotation: number = 0;
  private targetRotation: number = 0;
  private spinSpeed: number = 0;
  private rewards: WheelReward[];
  private onSpinComplete?: (reward: WheelReward) => void;

  constructor() {
    super({ key: "WheelScene" });
    this.rewards = rewards;
  }

  init(data: { onSpinComplete: (reward: WheelReward) => void }) {
    this.onSpinComplete = data.onSpinComplete;
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    // Create background circle
    const bg = this.add.circle(centerX, centerY, radius + 20, 0x1a1a1a);
    bg.setStrokeStyle(4, 0x3b3b3b);

    // Create wheel
    this.wheel = this.add.graphics();
    this.drawWheel(centerX, centerY, radius);

    // Create center circle
    const centerCircle = this.add.circle(centerX, centerY, 40, 0x0a0a0a);
    centerCircle.setStrokeStyle(4, 0x06b6d4);

    // Create pointer/arrow at top
    this.pointer = this.add.graphics();
    this.pointer.fillStyle(0xef4444);
    this.pointer.fillTriangle(
      centerX, centerY - radius - 30,
      centerX - 15, centerY - radius - 10,
      centerX + 15, centerY - radius - 10
    );
    this.pointer.lineStyle(2, 0xffffff);
    this.pointer.strokeTriangle(
      centerX, centerY - radius - 30,
      centerX - 15, centerY - radius - 10,
      centerX + 15, centerY - radius - 10
    );

    // Center text
    this.centerText = this.add.text(centerX, centerY, "SPIN", {
      fontSize: "24px",
      color: "#06b6d4",
      fontFamily: "Arial",
      fontStyle: "bold"
    });
    this.centerText.setOrigin(0.5);

    // Make wheel interactive
    const hitArea = new Phaser.Geom.Circle(centerX, centerY, radius);
    this.wheel.setInteractive(hitArea, Phaser.Geom.Circle.Contains);
    this.wheel.on("pointerdown", () => this.startSpin());

    // Add glow effect
    this.tweens.add({
      targets: centerCircle,
      alpha: 0.6,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
  }

  drawWheel(centerX: number, centerY: number, radius: number) {
    if (!this.wheel) return;

    this.wheel.clear();
    const segments = this.rewards.length;
    const anglePerSegment = (2 * Math.PI) / segments;

    for (let i = 0; i < segments; i++) {
      const startAngle = i * anglePerSegment - Math.PI / 2 + this.currentRotation;
      const endAngle = (i + 1) * anglePerSegment - Math.PI / 2 + this.currentRotation;
      
      // Alternate colors for better visibility
      const color = Phaser.Display.Color.HexStringToColor(this.rewards[i].color).color;
      
      this.wheel.fillStyle(color, 0.9);
      this.wheel.slice(centerX, centerY, radius, startAngle, endAngle, false);
      this.wheel.fillPath();
      
      // Border
      this.wheel.lineStyle(3, 0xffffff, 0.3);
      this.wheel.strokePath();

      // Add text
      const textAngle = startAngle + anglePerSegment / 2;
      const textRadius = radius * 0.7;
      const textX = centerX + Math.cos(textAngle) * textRadius;
      const textY = centerY + Math.sin(textAngle) * textRadius;

      const text = this.add.text(textX, textY, this.rewards[i].label, {
        fontSize: "14px",
        color: "#ffffff",
        fontFamily: "Arial",
        fontStyle: "bold",
        align: "center"
      });
      text.setOrigin(0.5);
      text.setRotation(textAngle + Math.PI / 2);
    }
  }

  startSpin() {
    if (this.spinning) return;

    this.spinning = true;
    this.spinSpeed = 0.3;
    
    // Random target (3-5 full rotations plus random position)
    const fullRotations = Phaser.Math.Between(3, 5);
    const randomSegment = Phaser.Math.Between(0, this.rewards.length - 1);
    const segmentAngle = (2 * Math.PI) / this.rewards.length;
    
    this.targetRotation = this.currentRotation + (fullRotations * 2 * Math.PI) + (randomSegment * segmentAngle);

    if (this.centerText) {
      this.centerText.setText("...");
    }
  }

  update() {
    if (!this.spinning) return;

    const diff = this.targetRotation - this.currentRotation;
    
    if (Math.abs(diff) > 0.01) {
      // Ease out effect
      this.spinSpeed = Math.max(0.01, this.spinSpeed * 0.98);
      this.currentRotation += this.spinSpeed;
      
      const width = this.scale.width;
      const height = this.scale.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.35;
      
      this.drawWheel(centerX, centerY, radius);
    } else {
      this.spinning = false;
      this.currentRotation = this.targetRotation;
      
      // Determine winning segment
      const normalizedRotation = (this.currentRotation % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      const segmentAngle = (2 * Math.PI) / this.rewards.length;
      const pointerAngle = Math.PI / 2; // Pointer is at top
      const relativeAngle = (pointerAngle - normalizedRotation + 2 * Math.PI) % (2 * Math.PI);
      const winningIndex = Math.floor(relativeAngle / segmentAngle);
      
      const reward = this.rewards[winningIndex];
      
      if (this.centerText) {
        this.centerText.setText("SPIN");
      }
      
      if (this.onSpinComplete) {
        this.onSpinComplete(reward);
      }
    }
  }
}

export function SpinningWheel({ currentTier, onReward }: SpinningWheelProps) {
  const gameRef = useRef<HTMLDivElement>(null);
  const [game, setGame] = useState<Phaser.Game | null>(null);
  const [spinsLeft, setSpinsLeft] = useState(3);
  const [lastReward, setLastReward] = useState<WheelReward | null>(null);

  useEffect(() => {
    // Load spins from localStorage
    const saved = localStorage.getItem("wheel_spins");
    if (saved) {
      const data = JSON.parse(saved);
      const today = new Date().toDateString();
      if (data.date === today) {
        setSpinsLeft(data.spins);
      } else {
        // Reset daily
        const dailySpins = currentTier === "premium" ? 5 : currentTier === "pro" ? 3 : 1;
        setSpinsLeft(dailySpins);
        localStorage.setItem("wheel_spins", JSON.stringify({ date: today, spins: dailySpins }));
      }
    }
  }, [currentTier]);

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: 600,
      height: 600,
      backgroundColor: "#0a0a0a",
      scene: WheelScene,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };

    const newGame = new Phaser.Game(config);
    
    newGame.scene.start("WheelScene", {
      onSpinComplete: handleSpinComplete
    });

    setGame(newGame);

    return () => {
      newGame.destroy(true);
    };
  }, []);

  const handleSpinComplete = (reward: WheelReward) => {
    setLastReward(reward);
    onReward(reward);
    
    const newSpins = Math.max(0, spinsLeft - 1);
    setSpinsLeft(newSpins);
    
    // Save to localStorage
    const today = new Date().toDateString();
    localStorage.setItem("wheel_spins", JSON.stringify({ date: today, spins: newSpins }));

    // Show toast
    if (reward.type === "nothing") {
      toast.info("Better luck next time! Try again.");
    } else {
      toast.success(`🎉 Congratulations! You won: ${reward.label}`);
    }
  };

  const triggerSpin = () => {
    if (spinsLeft <= 0) {
      toast.error("No spins left today! Come back tomorrow.");
      return;
    }

    if (game) {
      const scene = game.scene.getScene("WheelScene") as WheelScene;
      scene.startSpin();
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wheel Container */}
        <div className="lg:col-span-2">
          <Card className="bg-neutral-900/50 border-neutral-800 p-6">
            <div className="mb-4">
              <h3 className="text-xl mb-2 flex items-center gap-2">
                <Gift className="w-6 h-6 text-cyan-400" />
                Spin the Wheel
              </h3>
              <p className="text-sm text-neutral-500">
                Try your luck and win amazing rewards!
              </p>
            </div>

            <div 
              ref={gameRef} 
              className="rounded-lg overflow-hidden border-2 border-neutral-800"
              style={{ maxWidth: "600px", margin: "0 auto" }}
            />

            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-lg px-4 py-2">
                  {spinsLeft} {spinsLeft === 1 ? "Spin" : "Spins"} Left Today
                </Badge>
              </div>
              
              <Button
                onClick={triggerSpin}
                disabled={spinsLeft <= 0}
                className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-lg px-6 py-6"
              >
                <Sparkles className="w-5 h-5" />
                Spin Now!
              </Button>
            </div>
          </Card>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-4">
          {/* Last Reward */}
          {lastReward && (
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 p-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full flex items-center justify-center">
                  <lastReward.icon className="w-8 h-8 text-green-400" />
                </div>
                <h4 className="text-lg mb-1">Last Win!</h4>
                <p className="text-2xl text-green-400 mb-2">{lastReward.label}</p>
                <p className="text-xs text-neutral-500">
                  {lastReward.type === "nothing" ? "Better luck next time!" : "Reward has been applied!"}
                </p>
              </div>
            </Card>
          )}

          {/* Daily Spins Info */}
          <Card className="bg-neutral-900/50 border-neutral-800 p-6">
            <h4 className="text-lg mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              Daily Spins
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-400">Free:</span>
                <span>1 spin/day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Pro:</span>
                <span className="text-cyan-400">3 spins/day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Premium:</span>
                <span className="text-purple-400">5 spins/day</span>
              </div>
            </div>
            
            {currentTier === "free" && (
              <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                <p className="text-xs text-neutral-300 text-center">
                  Upgrade to get more daily spins!
                </p>
              </div>
            )}
          </Card>

          {/* Possible Rewards */}
          <Card className="bg-neutral-900/50 border-neutral-800 p-6">
            <h4 className="text-lg mb-3 flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-400" />
              Possible Rewards
            </h4>
            <div className="space-y-2">
              {rewards.filter(r => r.type !== "nothing").map((reward, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: reward.color }}
                  />
                  <span className="text-neutral-300">{reward.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
