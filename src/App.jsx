import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { AlertCircle, TrendingUp, DollarSign, Shield, Target, Zap } from 'lucide-react';

const ACCOUNT_OPTIONS = [5000, 10000, 25000, 50000, 100000, 200000];
const RISK_OPTIONS = [0.5, 1, 1.5, 2];
const LEVERAGE_OPTIONS = [50, 100, 200, 500];

const ChipSelect = ({ options, value, onChange, onCustom, customValue, onCustomChange, formatLabel, customLabel, customPlaceholder }) => {
  const isCustom = !options.includes(value);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => { onChange(opt); onCustom && onCustom(false); }}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border-2 ${
              value === opt && !isCustom
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 scale-105'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:shadow-md'
            }`}
          >
            {formatLabel(opt)}
          </button>
        ))}
        <button
          onClick={() => onCustom && onCustom(true)}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border-2 border-dashed ${
            isCustom
              ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 scale-105'
              : 'bg-white text-gray-400 border-gray-300 hover:border-blue-300 hover:text-blue-600'
          }`}
        >
          {customLabel}
        </button>
      </div>
      {isCustom && (
        <div className="mt-2 animate-fadeIn">
          <Input
            type="number"
            value={customValue}
            onChange={onCustomChange}
            placeholder={customPlaceholder}
            className="border-2 border-blue-300 focus:border-blue-500 bg-blue-50"
            step="any"
            autoFocus
          />
        </div>
      )}
    </div>
  );
};

const ForexCalculator = () => {
  const [accountSize, setAccountSize] = useState(5000);
  const [customAccountMode, setCustomAccountMode] = useState(false);
  const [customAccountValue, setCustomAccountValue] = useState('');
  const [riskPercent, setRiskPercent] = useState(0.5);
  const [customRiskMode, setCustomRiskMode] = useState(false);
  const [customRiskValue, setCustomRiskValue] = useState('');
  const [leverage, setLeverage] = useState(100);
  const [customLeverageMode, setCustomLeverageMode] = useState(false);
  const [customLeverageValue, setCustomLeverageValue] = useState('');
  const [entryPrice, setEntryPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [selectedPair, setSelectedPair] = useState('XAUUSD');

  const forexPairs = {
    'XAUUSD': { label: 'XAUUSD (Gold)', pipValue: 0.1, typical: 1900 },
    'XAGUSD': { label: 'XAGUSD (Silver)', pipValue: 0.01, typical: 24 },
    'EURUSD': { label: 'EUR/USD', pipValue: 0.0001, typical: 1.1 },
    'GBPUSD': { label: 'GBP/USD', pipValue: 0.0001, typical: 1.26 },
    'USDJPY': { label: 'USD/JPY', pipValue: 0.01, typical: 148 },
    'AUDUSD': { label: 'AUD/USD', pipValue: 0.0001, typical: 0.65 },
    'USDCAD': { label: 'USD/CAD', pipValue: 0.0001, typical: 1.35 },
    'NZDUSD': { label: 'NZD/USD', pipValue: 0.0001, typical: 0.61 },
  };

  const handleAccountChange = (val) => {
    setAccountSize(val);
    setCustomAccountMode(false);
  };

  const handleAccountCustomToggle = (isCustom) => {
    setCustomAccountMode(isCustom);
    if (isCustom && customAccountValue) {
      setAccountSize(Number(customAccountValue));
    }
  };

  const handleRiskChange = (val) => {
    setRiskPercent(val);
    setCustomRiskMode(false);
  };

  const handleRiskCustomToggle = (isCustom) => {
    setCustomRiskMode(isCustom);
    if (isCustom && customRiskValue) {
      setRiskPercent(Number(customRiskValue));
    }
  };

  const handleLeverageChange = (val) => {
    setLeverage(val);
    setCustomLeverageMode(false);
  };

  const handleLeverageCustomToggle = (isCustom) => {
    setCustomLeverageMode(isCustom);
    if (isCustom && customLeverageValue) {
      setLeverage(Number(customLeverageValue));
    }
  };

  const calculatePositionSize = () => {
    if (!entryPrice || !stopLoss) return null;

    const riskAmount = accountSize * (riskPercent / 100);
    const entry = parseFloat(entryPrice);
    const stop = parseFloat(stopLoss);
    const direction = entry > stop ? 1 : -1;
    const riskDistance = Math.abs(entry - stop);

    let pipDiff;
    if (selectedPair === 'USDJPY') {
      pipDiff = Math.abs(entry - stop) / 0.01;
    } else if (selectedPair === 'XAUUSD') {
      pipDiff = Math.abs(entry - stop) / 0.1;
    } else if (selectedPair === 'XAGUSD') {
      pipDiff = Math.abs(entry - stop) / 0.01;
    } else {
      pipDiff = Math.abs(entry - stop) / 0.0001;
    }

    let positionSize, lotValue;

    if (selectedPair === 'XAUUSD') {
      const units = (riskAmount / (pipDiff * 0.1));
      positionSize = (units / 100).toFixed(2);
      lotValue = units.toFixed(3);
    } else if (selectedPair === 'XAGUSD') {
      const lots = riskAmount / (pipDiff * 50);
      positionSize = lots.toFixed(2);
      lotValue = (lots * 5000).toFixed(0);
    } else if (selectedPair === 'USDJPY') {
      const pipValueUSD = (0.01 / entry) * 100000;
      const lots = riskAmount / (pipDiff * pipValueUSD);
      positionSize = lots.toFixed(2);
      lotValue = (lots * 100000).toFixed(0);
    } else {
      const lots = riskAmount / (pipDiff * 10);
      positionSize = lots.toFixed(2);
      lotValue = (lots * 100000).toFixed(0);
    }

    const leveragedValue = selectedPair === 'XAUUSD'
      ? (parseFloat(lotValue) * entry).toFixed(2)
      : selectedPair === 'XAGUSD'
      ? (parseFloat(positionSize) * 5000 * entry).toFixed(2)
      : (parseFloat(positionSize) * 100000 * entry).toFixed(2);

    const actualMargin = (parseFloat(leveragedValue) / leverage).toFixed(2);
    const accountUsagePercentage = ((parseFloat(actualMargin) / accountSize) * 100).toFixed(2);

    const formatTarget = (multiplier) => {
      const target = entry + (riskDistance * multiplier * direction);
      return target.toFixed(selectedPair === 'USDJPY' ? 3 : selectedPair === 'XAGUSD' ? 2 : 5);
    };

    return {
      positionSize,
      pipValue: pipDiff.toFixed(1),
      riskAmount: riskAmount.toFixed(2),
      leveragedValue,
      actualMargin,
      accountUsagePercentage,
      target3R: formatTarget(3),
      target4R: formatTarget(4),
      target5R: formatTarget(5),
      isLong: direction === 1
    };
  };

  const result = calculatePositionSize();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 py-6 px-4">
      <div className="w-full max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-2xl backdrop-blur">
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Position Size Calculator
            </h1>
          </div>
          <p className="text-blue-300/70 text-sm">
            Calculate your optimal position size with precision risk management
          </p>
        </div>

        {/* Account Size Section */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <Label className="text-white font-semibold text-base">Account Size</Label>
            </div>
            <ChipSelect
              options={ACCOUNT_OPTIONS}
              value={customAccountMode ? -1 : accountSize}
              onChange={handleAccountChange}
              onCustom={handleAccountCustomToggle}
              customValue={customAccountValue}
              onCustomChange={(e) => {
                setCustomAccountValue(e.target.value);
                if (e.target.value) setAccountSize(Number(e.target.value));
              }}
              formatLabel={(v) => `$${v.toLocaleString()}`}
              customLabel="Custom"
              customPlaceholder="Enter custom account size..."
            />
            <p className="text-blue-300/50 text-xs mt-2">
              Selected: <span className="text-blue-300 font-semibold">${accountSize.toLocaleString()}</span>
            </p>
          </CardContent>
        </Card>

        {/* Risk % Section */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-amber-400" />
              <Label className="text-white font-semibold text-base">Risk Per Trade</Label>
            </div>
            <ChipSelect
              options={RISK_OPTIONS}
              value={customRiskMode ? -1 : riskPercent}
              onChange={handleRiskChange}
              onCustom={handleRiskCustomToggle}
              customValue={customRiskValue}
              onCustomChange={(e) => {
                setCustomRiskValue(e.target.value);
                if (e.target.value) setRiskPercent(Number(e.target.value));
              }}
              formatLabel={(v) => `${v}%`}
              customLabel="Custom %"
              customPlaceholder="Enter custom risk percentage..."
            />
            <p className="text-blue-300/50 text-xs mt-2">
              Risk: <span className="text-amber-400 font-semibold">{riskPercent}%</span>
              {' '}= <span className="text-amber-400 font-semibold">${(accountSize * riskPercent / 100).toFixed(2)}</span> per trade
            </p>
          </CardContent>
        </Card>

        {/* Leverage Section */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-cyan-400" />
              <Label className="text-white font-semibold text-base">Leverage</Label>
            </div>
            <ChipSelect
              options={LEVERAGE_OPTIONS}
              value={customLeverageMode ? -1 : leverage}
              onChange={handleLeverageChange}
              onCustom={handleLeverageCustomToggle}
              customValue={customLeverageValue}
              onCustomChange={(e) => {
                setCustomLeverageValue(e.target.value);
                if (e.target.value) setLeverage(Number(e.target.value));
              }}
              formatLabel={(v) => `1:${v}`}
              customLabel="Custom"
              customPlaceholder="Enter custom leverage (e.g. 300)..."
            />
            <p className="text-blue-300/50 text-xs mt-2">
              Selected: <span className="text-cyan-400 font-semibold">1:{leverage}</span>
            </p>
          </CardContent>
        </Card>

        {/* Trade Setup */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-purple-400" />
              <Label className="text-white font-semibold text-base">Trade Setup</Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="pair" className="text-blue-200/70 text-sm mb-1 block">Currency Pair</Label>
                <select
                  id="pair"
                  value={selectedPair}
                  onChange={(e) => {
                    setSelectedPair(e.target.value);
                    setEntryPrice(forexPairs[e.target.value].typical.toString());
                  }}
                  className="w-full p-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-colors"
                >
                  {Object.entries(forexPairs).map(([pair, info]) => (
                    <option key={pair} value={pair} className="bg-slate-800 text-white">
                      {info.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="entry" className="text-blue-200/70 text-sm mb-1 block">Entry Price</Label>
                <Input
                  id="entry"
                  type="number"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  placeholder={forexPairs[selectedPair].typical.toString()}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-blue-400"
                  step="any"
                />
              </div>
              <div>
                <Label htmlFor="stop" className="text-blue-200/70 text-sm mb-1 block">Stop Loss</Label>
                <Input
                  id="stop"
                  type="number"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  placeholder="Enter stop loss"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-blue-400"
                  step="any"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur border border-blue-400/20 rounded-2xl p-4">
                <p className="text-blue-300/70 text-xs font-medium mb-1">Volume (Lots)</p>
                <p className="text-2xl md:text-3xl font-bold text-white">{result.positionSize}</p>
                <p className="text-blue-300/40 text-xs mt-1">
                  {selectedPair === 'XAUUSD' ? '1.000 = 0.01 lots' :
                   selectedPair === 'XAGUSD' ? '1 lot = 5,000 oz' :
                   '1 lot = 100K units'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 backdrop-blur border border-red-400/20 rounded-2xl p-4">
                <p className="text-red-300/70 text-xs font-medium mb-1">Risk Amount</p>
                <p className="text-2xl md:text-3xl font-bold text-white">${result.riskAmount}</p>
                <p className="text-red-300/40 text-xs mt-1">{riskPercent}% of account</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur border border-purple-400/20 rounded-2xl p-4">
                <p className="text-purple-300/70 text-xs font-medium mb-1">Position Value</p>
                <p className="text-2xl md:text-3xl font-bold text-white">${Number(result.leveragedValue).toLocaleString()}</p>
                <p className="text-purple-300/40 text-xs mt-1">Total exposure</p>
              </div>
              <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 backdrop-blur border border-amber-400/20 rounded-2xl p-4">
                <p className="text-amber-300/70 text-xs font-medium mb-1">Margin Required</p>
                <p className="text-2xl md:text-3xl font-bold text-white">${Number(result.actualMargin).toLocaleString()}</p>
                <p className="text-amber-300/40 text-xs mt-1">{result.accountUsagePercentage}% of account</p>
              </div>
            </div>

            {/* Profit Targets */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <span className="text-white font-semibold">
                    Profit Targets
                  </span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                    result.isLong
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30'
                      : 'bg-red-500/20 text-red-400 border border-red-400/30'
                  }`}>
                    {result.isLong ? 'LONG' : 'SHORT'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: '1:3 R:R', value: result.target3R, multiplier: '3x' },
                    { label: '1:4 R:R', value: result.target4R, multiplier: '4x' },
                    { label: '1:5 R:R', value: result.target5R, multiplier: '5x' },
                  ].map((t) => (
                    <div key={t.label} className="text-center p-3 bg-emerald-500/10 border border-emerald-400/20 rounded-xl">
                      <p className="text-emerald-300/60 text-xs mb-1">{t.label}</p>
                      <p className="text-lg md:text-xl font-bold text-emerald-400">{t.value}</p>
                      <p className="text-emerald-300/40 text-xs mt-1">{t.multiplier} Risk</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Disclaimer */}
        <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-400/20 rounded-xl">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-200/70">
            Always verify calculations and manage your risk carefully. Trading involves substantial risk of loss.
          </p>
        </div>

        <p className="text-center text-blue-300/30 text-xs pb-4">
          Position Size Calculator &bull; {leverage}x Leverage
        </p>
      </div>
    </div>
  );
};

const App = () => <ForexCalculator />;

export default App;
