'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input } from '@villex/ui';

interface PlatformSettingsProps {
  defaultCommissionRate: number;
  escrowDelayHours: number;
  isMaintenanceMode: boolean;
  onSaveSettings: (commission: number, escrowDelay: number, maintenance: boolean) => void;
}

export function PlatformSettings({
  defaultCommissionRate,
  escrowDelayHours,
  isMaintenanceMode,
  onSaveSettings,
}: PlatformSettingsProps) {
  const [commission, setCommission] = React.useState(defaultCommissionRate);
  const [escrowDelay, setEscrowDelay] = React.useState(escrowDelayHours);
  const [maintenance, setMaintenance] = React.useState(isMaintenanceMode);
  
  const [isSaved, setIsSaved] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(commission, escrowDelay, maintenance);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <Card className="bg-card/50 border-border backdrop-blur-md">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-base font-black uppercase tracking-wider text-foreground">
            Platform Commissions & Fees
          </CardTitle>
          <CardDescription className="text-xs">
            Configure default platform service fees and commission overrides.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              Default Platform Commission Rate (%)
            </label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                min="0"
                max="100"
                value={commission}
                onChange={(e) => setCommission(Number(e.target.value))}
                required
                className="text-xs font-bold max-w-[120px]"
              />
              <span className="text-sm font-bold text-muted-foreground">%</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-normal">
              This commission percentage is automatically charged on all orders unless customized overrides are defined for specific stores in the Vendor registry.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border backdrop-blur-md">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-base font-black uppercase tracking-wider text-foreground">
            Buy Babu Escrow Parameters
          </CardTitle>
          <CardDescription className="text-xs">
            Configure secure escrow release timers and holding policies.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              Escrow Payout Release Delay (Hours)
            </label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                min="0"
                value={escrowDelay}
                onChange={(e) => setEscrowDelay(Number(e.target.value))}
                required
                className="text-xs font-bold max-w-[120px]"
              />
              <span className="text-sm font-bold text-muted-foreground">Hours</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-normal">
              Defines the buffer window after delivery confirmation before escrow funds are transferred to the merchant store balance, allowing customers time to inspect products.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border backdrop-blur-md">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-base font-black uppercase tracking-wider text-foreground text-destructive">
            Critical Systems Override
          </CardTitle>
          <CardDescription className="text-xs">
            Manage system-wide maintenance status toggles.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between p-4 bg-destructive/5 border border-destructive/10 rounded-xl">
            <div className="space-y-0.5">
              <span className="text-xs font-black uppercase tracking-wider text-destructive block">
                Platform Maintenance Mode
              </span>
              <span className="text-[10px] text-muted-foreground leading-normal font-semibold max-w-sm block">
                Activating maintenance mode will immediately lock the customer storefront website and merchant dashboards for scheduled upgrades.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMaintenance(!maintenance)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                maintenance ? 'bg-destructive' : 'bg-secondary'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  maintenance ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center space-x-4">
        <Button
          type="submit"
          variant="primary"
          className="text-[10px] font-black uppercase tracking-wider h-10 px-6 rounded-xl"
        >
          Save Platform Changes
        </Button>
        {isSaved && (
          <span className="text-xs font-bold text-emerald-500 animate-pulse uppercase tracking-wider">
            ✓ Settings updated successfully.
          </span>
        )}
      </div>
    </form>
  );
}
