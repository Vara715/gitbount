export type Mode = "profile" | "repo";
export interface Signals { [k: string]: number }
export interface Category { key: string; label: string; score: number; weight: number; note: string; share: number }
export interface Tier { name: string; min: number; color: string; description: string }
export interface BountyResult {
  mode: Mode; id: string; name: string; handle: string; url: string; avatar: string;
  bounty: number; score: number; tier: Tier; categories: Category[];
  stats: { label: string; value: string }[]; generatedAt: string;
}
