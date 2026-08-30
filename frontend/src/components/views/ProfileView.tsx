import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Progress } from "../ui/progress";
import { Separator } from "../ui/separator";
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  TrendingUp,
  Target,
  DollarSign,
  Award,
  Upload,
  Edit,
  Linkedin,
  Twitter,
  Globe
} from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { SubscriptionStatusCard } from "../subscription/SubscriptionStatusCard";
import { useAuth } from "../../contexts/AuthContext";

export function ProfileView() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.name?.split(' ')[0] || "User",
    lastName: user?.name?.split(' ').slice(1).join(' ') || "",
    email: user?.email || "user@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    occupation: "Investor",
    bio: "Experienced investor focused on long-term growth strategies with a balanced approach to risk management.",
    investmentExperience: "5-10 years",
    riskTolerance: "Moderate",
    investmentGoals: "Long-term wealth building",
  });

  const handleSaveProfile = () => {
    setIsEditing(false);
    toast.success("Profile updated successfully!");
  };

  const handleUploadPhoto = () => {
    toast.info("Opening file picker for profile photo...");
  };

  const stats = [
    { label: "Total Invested", value: "$730K", icon: DollarSign, color: "cyan" },
    { label: "Total Return", value: "+11.2%", icon: TrendingUp, color: "green" },
    { label: "Active Portfolios", value: "4", icon: Briefcase, color: "blue" },
    { label: "Years Active", value: "2.5", icon: Calendar, color: "purple" },
  ];

  const achievements = [
    { title: "Early Adopter", description: "Joined in first year", unlocked: true },
    { title: "Diversified Investor", description: "Invested in 5+ categories", unlocked: true },
    { title: "High Roller", description: "Portfolio value over $500K", unlocked: true },
    { title: "Consistent Trader", description: "Traded for 90 consecutive days", unlocked: false },
  ];

  const connectedAccounts = [
    { name: "LinkedIn", connected: true, icon: Linkedin },
    { name: "Twitter", connected: false, icon: Twitter },
    { name: "Personal Website", connected: false, icon: Globe },
  ];

  // Get initials from user name
  const getInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl mb-1 text-foreground">Profile</h2>
        <p className="text-sm text-muted-foreground">Manage your personal information and preferences</p>
      </div>

      {/* Profile Overview Card */}
      <Card className="bg-card border-border p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-32 h-32">
              {user?.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
              <AvatarFallback className="text-3xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <Button
              onClick={handleUploadPhoto}
              variant="outline"
              size="sm"
              className="gap-2 border-border hover:border-cyan-500 text-foreground"
            >
              <Upload className="w-4 h-4" />
              Change Photo
            </Button>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl mb-1 text-foreground">
                  {user?.name || "User"}
                </h3>
                <p className="text-muted-foreground mb-2">{profileData.occupation}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                    Premium Member
                  </Badge>
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                    Verified
                  </Badge>
                </div>
              </div>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant="outline"
                size="sm"
                className="gap-2 border-border hover:border-cyan-500 text-foreground"
              >
                <Edit className="w-4 h-4" />
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                {user?.email || profileData.email}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                {profileData.phone}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {profileData.location}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                Member since {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats and Subscription Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.map((stat, idx) => (
            <Card key={idx} className="bg-card border-border p-6">
              <div className={`w-10 h-10 rounded-lg bg-${stat.color}-500/10 border border-${stat.color}-500/20 flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
              </div>
              <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
              <div className="text-2xl text-foreground">{stat.value}</div>
            </Card>
          ))}
        </div>
        <div className="lg:col-span-1">
          <SubscriptionStatusCard variant="full" showUpgradeButton={true} />
        </div>
      </div>

      {/* Profile Details */}
      {isEditing ? (
        <Card className="bg-card border-border p-6">
          <h3 className="text-lg mb-4">Edit Profile Information</h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editFirstName">First Name</Label>
                <Input
                  id="editFirstName"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  className="bg-accent/50 border-border focus:border-cyan-500 text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editLastName">Last Name</Label>
                <Input
                  id="editLastName"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  className="bg-accent/50 border-border focus:border-cyan-500 text-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editOccupation">Occupation</Label>
              <Input
                id="editOccupation"
                value={profileData.occupation}
                onChange={(e) => setProfileData({ ...profileData, occupation: e.target.value })}
                className="bg-accent/50 border-border focus:border-cyan-500 text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editLocation">Location</Label>
              <Input
                id="editLocation"
                value={profileData.location}
                onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                className="bg-accent/50 border-border focus:border-cyan-500 text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editBio">Bio</Label>
              <Textarea
                id="editBio"
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                className="bg-accent/50 border-border focus:border-cyan-500 text-foreground min-h-[100px]"
              />
            </div>

            <Button
              onClick={handleSaveProfile}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            >
              Save Changes
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="bg-card border-border p-6">
          <h3 className="text-lg mb-4 text-foreground">About</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{profileData.bio}</p>
        </Card>
      )}

      {/* Investment Profile */}
      <Card className="bg-card border-border p-6">
        <h3 className="text-lg mb-4">Investment Profile</h3>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Investment Experience</Label>
              {isEditing ? (
                <Select
                  value={profileData.investmentExperience}
                  onValueChange={(value: string) => setProfileData({ ...profileData, investmentExperience: value })}
                >
                  <SelectTrigger className="w-[180px] bg-accent/50 border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-foreground">
                    <SelectItem value="0-1 years">0-1 years</SelectItem>
                    <SelectItem value="1-3 years">1-3 years</SelectItem>
                    <SelectItem value="3-5 years">3-5 years</SelectItem>
                    <SelectItem value="5-10 years">5-10 years</SelectItem>
                    <SelectItem value="10+ years">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="secondary" className="bg-accent text-accent-foreground">
                  {profileData.investmentExperience}
                </Badge>
              )}
            </div>
            <Separator className="bg-border" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Risk Tolerance</Label>
              {isEditing ? (
                <Select
                  value={profileData.riskTolerance}
                  onValueChange={(value: string) => setProfileData({ ...profileData, riskTolerance: value })}
                >
                  <SelectTrigger className="w-[180px] bg-accent/50 border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-foreground">
                    <SelectItem value="Conservative">Conservative</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Aggressive">Aggressive</SelectItem>
                    <SelectItem value="Very Aggressive">Very Aggressive</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">
                  {profileData.riskTolerance}
                </Badge>
              )}
            </div>
            <Progress value={60} className="h-2" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Primary Investment Goal</Label>
              {isEditing ? (
                <Select
                  value={profileData.investmentGoals}
                  onValueChange={(value: string) => setProfileData({ ...profileData, investmentGoals: value })}
                >
                  <SelectTrigger className="w-[200px] bg-accent/50 border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-foreground">
                    <SelectItem value="Capital preservation">Capital preservation</SelectItem>
                    <SelectItem value="Income generation">Income generation</SelectItem>
                    <SelectItem value="Balanced growth">Balanced growth</SelectItem>
                    <SelectItem value="Long-term wealth building">Long-term wealth building</SelectItem>
                    <SelectItem value="Speculation">Speculation</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                  <Target className="w-3 h-3 mr-1" />
                  {profileData.investmentGoals}
                </Badge>
              )}
            </div>
            <Separator className="bg-border" />
          </div>
        </div>
      </Card>

      {/* Achievements */}
      <Card className="bg-card border-border p-6">
        <h3 className="text-lg mb-4 flex items-center gap-2 text-foreground">
          <Award className="w-5 h-5 text-amber-400" />
          Achievements
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border ${achievement.unlocked
                ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20'
                : 'bg-accent/20 border-border/50'
                }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${achievement.unlocked
                  ? 'bg-amber-500/20 border border-amber-500/30'
                  : 'bg-accent border border-border'
                  }`}>
                  <Award className={`w-5 h-5 ${achievement.unlocked ? 'text-amber-400' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1">
                  <div className="text-sm mb-1 text-foreground">{achievement.title}</div>
                  <div className="text-xs text-muted-foreground">{achievement.description}</div>
                  {achievement.unlocked && (
                    <Badge className="mt-2 bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">
                      Unlocked
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Connected Accounts */}
      <Card className="bg-card border-border p-6">
        <h3 className="text-lg mb-4 text-foreground">Connected Accounts</h3>

        <div className="space-y-3">
          {connectedAccounts.map((account, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-accent/30 border border-border/50">
              <div className="flex items-center gap-3">
                <account.icon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-foreground">{account.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {account.connected ? 'Connected' : 'Not connected'}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className={account.connected
                  ? "border-red-500/50 text-red-400 hover:bg-red-500/10"
                  : "border-border hover:border-cyan-500 hover:text-cyan-400 text-foreground"
                }
                onClick={() => toast.success(account.connected ? `Disconnected ${account.name}` : `Connected ${account.name}`)}
              >
                {account.connected ? 'Disconnect' : 'Connect'}
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
