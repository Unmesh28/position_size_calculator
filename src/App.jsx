import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { AlertCircle, TrendingUp, DollarSign } from 'lucide-react';

const ForexCalculator = ({ initialCapital = 5000 }) => {
  const [accountSize, setAccountSize] = useState(initialCapital);
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

  const calculatePositionSize = () => {
    if (!entryPrice || !stopLoss) return null;

    const riskAmount = accountSize * 0.005;
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
    
    const actualMargin = (parseFloat(leveragedValue) / 100).toFixed(2);
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
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-2xl border-0">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8" />
            <CardTitle className="text-3xl font-bold text-white">
              Forex Position Calculator
            </CardTitle>
          </div>
          <p className="text-center text-blue-100">
            ${initialCapital.toLocaleString()} Account • 0.5% Risk • 100x Leverage
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="account-size" className="text-gray-700 font-semibold">Account Size ($)</Label>
                <Input
                  id="account-size"
                  type="number"
                  value={accountSize}
                  onChange={(e) => setAccountSize(Number(e.target.value))}
                  className="mt-1 border-2 border-gray-300 focus:border-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="pair" className="text-gray-700 font-semibold">Currency Pair</Label>
                <select
                  id="pair"
                  value={selectedPair}
                  onChange={(e) => {
                    setSelectedPair(e.target.value);
                    setEntryPrice(forexPairs[e.target.value].typical.toString());
                  }}
                  className="w-full mt-1 p-2.5 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                >
                  {Object.entries(forexPairs).map(([pair, info]) => (
                    <option key={pair} value={pair}>
                      {info.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="entry" className="text-gray-700 font-semibold">Entry Price</Label>
                <Input
                  id="entry"
                  type="number"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  placeholder={forexPairs[selectedPair].typical.toString()}
                  className="mt-1 border-2 border-gray-300 focus:border-blue-500"
                  step="any"
                />
              </div>
              <div>
                <Label htmlFor="stop" className="text-gray-700 font-semibold">Stop Loss</Label>
                <Input
                  id="stop"
                  type="number"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="mt-1 border-2 border-gray-300 focus:border-blue-500"
                  step="any"
                />
              </div>
            </div>

            {result && (
              <div className="mt-6">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-blue-200">
                  <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                    Position Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded-lg shadow-md">
                      <p className="text-sm text-gray-600 mb-1">Volume (Lots)</p>
                      <p className="text-3xl font-bold text-blue-600">{result.positionSize}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedPair === 'XAUUSD' ? '(1.000 = 0.01 lots)' : 
                         selectedPair === 'XAGUSD' ? '(1 lot = 5,000 oz)' :
                         '(1 lot = 100,000 units)'}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md">
                      <p className="text-sm text-gray-600 mb-1">Risk Amount</p>
                      <p className="text-3xl font-bold text-red-600">${result.riskAmount}</p>
                      <p className="text-xs text-gray-500 mt-1">(0.5% of account)</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md">
                      <p className="text-sm text-gray-600 mb-1">Position Value</p>
                      <p className="text-3xl font-bold text-purple-600">${result.leveragedValue}</p>
                      <p className="text-xs text-gray-500 mt-1">(Total position)</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md">
                      <p className="text-sm text-gray-600 mb-1">Required Margin</p>
                      <p className="text-3xl font-bold text-orange-600">${result.actualMargin}</p>
                      <p className="text-xs text-gray-500 mt-1">({result.accountUsagePercentage}% of account)</p>
                    </div>
                  </div>

                  <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                    <h4 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      Profit Targets ({result.isLong ? 'Long ↑' : 'Short ↓'})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                        <p className="text-sm text-gray-600 mb-1">1:3 R:R</p>
                        <p className="text-2xl font-bold text-green-600">{result.target3R}</p>
                        <p className="text-xs text-gray-500 mt-1">3x Risk</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                        <p className="text-sm text-gray-600 mb-1">1:4 R:R</p>
                        <p className="text-2xl font-bold text-green-600">{result.target4R}</p>
                        <p className="text-xs text-gray-500 mt-1">4x Risk</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                        <p className="text-sm text-gray-600 mb-1">1:5 R:R</p>
                        <p className="text-2xl font-bold text-green-600">{result.target5R}</p>
                        <p className="text-xs text-gray-500 mt-1">5x Risk</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2 mt-2 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                Always verify calculations and manage your risk carefully. Trading involves substantial risk of loss.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const App = () => {
  const [selectedAccount, setSelectedAccount] = useState('5k');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-8">
      <div className="max-w-4xl mx-auto mb-6 px-4">
        <select
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
          className="w-full p-3 border-2 border-blue-300 rounded-lg bg-white shadow-lg font-semibold text-gray-700 focus:outline-none focus:border-blue-500"
        >
          <option value="5k">💰 $5,000 Account Calculator</option>
          <option value="10k">💎 $10,000 Account Calculator</option>
        </select>
      </div>

      {selectedAccount === '5k' ? 
        <ForexCalculator initialCapital={5000} /> : 
        <ForexCalculator initialCapital={10000} />
      }

      <div className="text-center mt-8 text-gray-600">
        <p className="text-sm">Built for traders • 0.5% risk management • 100x leverage</p>
      </div>
    </div>
  );
};

export default App;
