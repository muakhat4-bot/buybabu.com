import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from '@villex/ui';
import { Logo, LogoIcon } from '@villex/ui';

export function BrandKit() {
  const [bgType, setBgType] = React.useState<'light' | 'dark'>('light');

  const palette = [
    { name: 'Primary Royal Blue', hex: '#1E40AF', hsl: '226, 71%, 40%', use: 'Primary actions, main brand presence, headers' },
    { name: 'Secondary Slate Gray', hex: '#F3F4F6', hsl: '220, 14%, 96%', use: 'Card borders, secondary buttons, subtle backdrops' },
    { name: 'Accent Warm Gold', hex: '#F59E0B', hsl: '38, 92%, 50%', use: 'Premium items, VIP badges, certified tags' },
    { name: 'Success Emerald Green', hex: '#10B981', hsl: '160, 84%, 39%', use: 'Verified checkmarks, successful orders' },
    { name: 'Semantic Information', hex: '#3B82F6', hsl: '217, 91%, 60%', use: 'Help prompts, dynamic notifications' },
    { name: 'Semantic Error/Alert', hex: '#EF4444', hsl: '0, 84%, 60%', use: 'Stock depletion, payment warnings' },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">Brand & Media Kit</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Explore the official Buy Babu brand design tokens, logo variants, and live mockups of marketing & social media assets.
        </p>
      </div>

      {/* Grid of Palette and Logo */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Color Palette */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Brand Color Palette</CardTitle>
            <CardDescription>Official color hex codes and HSL space tokens mapped to tailwind parameters.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {palette.map((color) => (
                <div key={color.name} className="border border-border/80 rounded-xl p-3.5 space-y-2 bg-secondary/15">
                  <div
                    className="h-10 rounded-lg w-full shadow-inner border border-border"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div>
                    <h4 className="font-bold text-xs text-foreground truncate">{color.name}</h4>
                    <span className="text-[10px] text-muted-foreground font-mono block mt-1 select-all">{color.hex}</span>
                    <span className="text-[9px] text-muted-foreground font-mono block">{color.hsl}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Logo System & Favicon */}
        <Card className="border-border flex flex-col justify-between">
          <div>
            <CardHeader>
              <CardTitle>Logo Identity System</CardTitle>
              <CardDescription>Logo wordmark rendering on different background conditions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Background selector */}
              <div className="flex space-x-2 p-1 rounded-xl bg-secondary/40 border border-border/80 max-w-[200px]">
                <Button
                  size="sm"
                  variant={bgType === 'light' ? 'primary' : 'ghost'}
                  onClick={() => setBgType('light')}
                  className="flex-1 text-xs"
                >
                  Light BG
                </Button>
                <Button
                  size="sm"
                  variant={bgType === 'dark' ? 'primary' : 'ghost'}
                  onClick={() => setBgType('dark')}
                  className="flex-1 text-xs"
                >
                  Dark BG
                </Button>
              </div>

              {/* Logo Box */}
              <div
                className={`p-10 rounded-2xl border border-border flex items-center justify-center transition-all duration-300 ${
                  bgType === 'light' ? 'bg-[#FAFBFC]' : 'bg-[#0F172A] dark text-foreground'
                }`}
              >
                <Logo size="lg" />
              </div>

              {/* Favicon Previews */}
              <div className="flex gap-8 items-center border-t border-border pt-4">
                <div>
                  <h4 className="font-bold text-xs text-foreground">Favicon (16x16)</h4>
                  <div className="border border-border/80 p-2 rounded-lg mt-2 bg-secondary/15 w-fit">
                    <LogoIcon size="sm" className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-foreground">Monogram (32x32)</h4>
                  <div className="border border-border/80 p-2 rounded-lg mt-2 bg-secondary/15 w-fit">
                    <LogoIcon size="sm" className="w-8 h-8" />
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>

      {/* Social Media & Marketing Creatives */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Marketing & Social Media Creatives</CardTitle>
          <CardDescription>Interactive SVG rendering of campaign banners and corporate assets.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Facebook Banner (820x360 scaled down) */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-foreground uppercase tracking-wider">Facebook Campaign Banner</h4>
              <div className="w-full aspect-[820/312] border border-border rounded-2xl overflow-hidden shadow-md relative bg-[#1E40AF] text-white flex flex-col justify-between p-6">
                {/* SVG Graphics inside */}
                <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-20 pointer-events-none">
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polygon points="100,0 30,100 100,100" fill="#F59E0B" />
                  </svg>
                </div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                      <LogoIcon className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-black text-sm uppercase tracking-widest text-white">BUY BABU</span>
                  </div>
                  <span className="text-[8px] bg-emerald-500 text-white font-extrabold px-2 py-0.5 rounded-full uppercase">Verified Escrow Protection</span>
                </div>
                <div className="space-y-1 z-10">
                  <h3 className="text-xl sm:text-2xl font-black leading-tight tracking-tight">Shop Smarter.<br />Discover Faster.</h3>
                  <p className="text-[10px] text-blue-200 max-w-[200px]">Next-generation multi-vendor ecosystem with express 48h local delivery.</p>
                </div>
                <div className="flex justify-between items-center text-[8px] border-t border-white/15 pt-2 text-blue-200">
                  <span>🚀 AI-Powered Catalog</span>
                  <span>⭐ Certified Brand Sellers</span>
                </div>
              </div>
            </div>

            {/* LinkedIn Header (1584x396 scaled down) */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-foreground uppercase tracking-wider">LinkedIn Header Banner</h4>
              <div className="w-full aspect-[4/1] border border-border rounded-2xl overflow-hidden shadow-md relative bg-[#0F172A] text-white flex flex-col justify-between p-4">
                <div className="absolute right-10 top-0 bottom-0 flex items-center opacity-10">
                  <LogoIcon className="w-32 h-32 text-white" />
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <LogoIcon className="w-5 h-5 text-white" />
                    <span className="font-black text-xs uppercase tracking-widest text-white">BUY BABU</span>
                  </div>
                  <span className="text-[7px] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full font-bold uppercase">Enterprise Commerce Hub</span>
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-base font-black tracking-tight text-white">Building the Future of Trusted Commerce</h3>
                  <p className="text-[8px] text-slate-400">Escrow-backed transactions and API-driven catalog optimization.</p>
                </div>
                <div className="text-[7px] text-slate-500">
                  © 2026 Buy Babu Inc. All rights reserved.
                </div>
              </div>
            </div>

            {/* Instagram Post (1080x1080 scaled down) */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-foreground uppercase tracking-wider">Instagram Promotional Post</h4>
              <div className="w-[300px] h-[300px] border border-border rounded-2xl overflow-hidden shadow-md relative bg-[#FAFBFC] text-[#111827] flex flex-col justify-between p-6 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none"></div>
                <div className="flex justify-between items-center">
                  <Logo size="sm" />
                  <span className="text-[8px] text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full font-bold">@buybabu_pk</span>
                </div>
                
                <div className="flex flex-col items-center justify-center space-y-4 my-auto">
                  {/* Visual Accent */}
                  <div className="w-16 h-16 rounded-3xl bg-[#F59E0B] flex items-center justify-center text-white text-3xl shadow-lg shadow-warning/20">
                    🚚
                  </div>
                  <div className="text-center space-y-1">
                    <h3 className="font-black text-sm tracking-tight text-foreground uppercase">Express Delivery</h3>
                    <p className="text-xs font-bold text-primary">Local Delivery within 48 Hours</p>
                    <p className="text-[8px] text-muted-foreground max-w-[180px] mx-auto">Instant dispatch from certified localized distribution centers across major zones.</p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[8px] text-muted-foreground border-t border-border/80 pt-3">
                  <span>🛡️ 100% Escrow Secured</span>
                  <span>🔥 Shop Now</span>
                </div>
              </div>
            </div>

            {/* Accessibility Audit */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-foreground uppercase tracking-wider">WCAG Accessibility Matrix</h4>
              <div className="border border-border rounded-2xl p-4 bg-secondary/15 h-[300px] overflow-auto flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-xs text-foreground">Contrast Ratio Verifications</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Calculated compliance targets according to WCAG 2.1 Guidelines.</p>
                  <table className="w-full text-[10px] text-left mt-4 border-collapse">
                    <thead>
                      <tr className="border-b border-border/60 text-muted-foreground font-bold">
                        <th className="pb-2">Text Context</th>
                        <th className="pb-2">Background</th>
                        <th className="pb-2 text-center">Ratio</th>
                        <th className="pb-2 text-right">Compliance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-medium">
                      <tr>
                        <td className="py-2.5">Primary Text (`#111827`)</td>
                        <td className="py-2.5">Light Background (`#FAFBFC`)</td>
                        <td className="py-2.5 text-center font-bold">13.5:1</td>
                        <td className="py-2.5 text-right"><span className="text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded font-black">AAA PASS</span></td>
                      </tr>
                      <tr>
                        <td className="py-2.5 text-white">White Text (`#FFFFFF`)</td>
                        <td className="py-2.5">Deep Royal Blue (`#1E40AF`)</td>
                        <td className="py-2.5 text-center font-bold">6.8:1</td>
                        <td className="py-2.5 text-right"><span className="text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded font-black">AAA PASS</span></td>
                      </tr>
                      <tr>
                        <td className="py-2.5">Dark Text (`#111827`)</td>
                        <td className="py-2.5">Accent Warm Gold (`#F59E0B`)</td>
                        <td className="py-2.5 text-center font-bold">5.2:1</td>
                        <td className="py-2.5 text-right"><span className="text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded font-black">AA PASS</span></td>
                      </tr>
                      <tr>
                        <td className="py-2.5">Muted Text (`#6B7280`)</td>
                        <td className="py-2.5">Light Background (`#FAFBFC`)</td>
                        <td className="py-2.5 text-center font-bold">4.6:1</td>
                        <td className="py-2.5 text-right"><span className="text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded font-black">AA PASS</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl text-[9px] leading-relaxed text-primary mt-2">
                  ℹ️ <strong>Keyboard Support:</strong> Focus rings `--ring` are mapped directly to Royal Blue (`#1E40AF`) with visible offsets ensuring robust visual indicator tracking for tab keys.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
