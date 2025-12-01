import React from 'react';

export interface NavItem {
  label: string;
  href: string;
}

export interface Feature {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

export interface Step {
  number: number;
  title: string;
  description: string;
}

export interface ComparisonRow {
  feature: string;
  traditional: boolean;
  uangCerdas: boolean;
}

export interface DashboardStat {
  label: string;
  value: string;
  trend: number; // percentage
  trendUp: boolean; // true if good (income up or expense down)
}

export interface AIAlert {
  id: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  date: string;
  amount?: string;
  recommendation?: string;
  status: 'new' | 'in_progress' | 'resolved';
  suggestedActions: string[];
  userNotes?: string;
  impact?: string; // e.g., "Hemat Rp 500k"
  category?: string;
}

export interface Transaction {
  id: string;
  date: string;
  desc: string;
  category: string;
  amount: number;
  type: 'in' | 'out';
  source: 'Bank' | 'E-Wallet' | 'POS' | 'Cash' | 'Import';
  status: 'completed' | 'pending';
}

export interface HPPData {
  totalRevenue: number;
  rawMaterialCost: number;
  productionCost: number;
  grossProfit: number;
  marginPercent: number;
}