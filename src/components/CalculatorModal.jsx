import React, { useState } from 'react';
import { X, Delete, RotateCcw, Calculator as CalcIcon } from 'lucide-react';

export default function CalculatorModal({ isOpen, onClose }) {
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState(0);
  const [isRad, setIsRad] = useState(false); // Degrees vs Radians

  if (!isOpen) return null;

  const handleDigit = (digit) => {
    if (display === '0' || display === 'Error') {
      setDisplay(digit);
    } else {
      setDisplay(display + digit);
    }
  };

  const handleOperator = (op) => {
    if (display !== 'Error') {
      setDisplay(display + ' ' + op + ' ');
    }
  };

  const handleClear = () => {
    setDisplay('0');
  };

  const handleBackspace = () => {
    if (display.length <= 1 || display === 'Error') {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1).trim());
    }
  };

  const calculateResult = () => {
    try {
      // Clean up expression
      let expr = display.replace(/×/g, '*').replace(/÷/g, '/').replace(/mod/g, '%');
      // eslint-disable-next-line no-eval
      const result = Function(`"use strict"; return (${expr})`)();
      if (isNaN(result) || !isFinite(result)) {
        setDisplay('Error');
      } else {
        setDisplay(Number(result.toFixed(6)).toString());
      }
    } catch (e) {
      setDisplay('Error');
    }
  };

  const handleFunction = (fn) => {
    try {
      const val = parseFloat(display) || 0;
      let res = 0;
      const angle = isRad ? val : (val * Math.PI) / 180;

      switch (fn) {
        case 'sin': res = Math.sin(angle); break;
        case 'cos': res = Math.cos(angle); break;
        case 'tan': res = Math.tan(angle); break;
        case 'log': res = Math.log10(val); break;
        case 'ln': res = Math.log(val); break;
        case 'sqrt': res = Math.sqrt(val); break;
        case 'sqr': res = val * val; break;
        case 'cube': res = val * val * val; break;
        case 'inv': res = val !== 0 ? 1 / val : 'Error'; break;
        case 'fact': {
          if (val < 0 || Math.floor(val) !== val) {
            res = 'Error';
          } else {
            let f = 1;
            for (let i = 2; i <= Math.min(val, 20); i++) f *= i;
            res = f;
          }
          break;
        }
        case 'exp': res = Math.exp(val); break;
        default: res = val;
      }
      if (res === 'Error' || isNaN(res) || !isFinite(res)) {
        setDisplay('Error');
      } else {
        setDisplay(Number(res.toFixed(6)).toString());
      }
    } catch {
      setDisplay('Error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl max-w-sm w-full border border-slate-700 overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Title bar */}
        <div className="px-4 py-2.5 bg-slate-950 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <CalcIcon className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold tracking-wide uppercase text-slate-300">
              GATE Virtual Scientific Calculator
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Display Screen */}
        <div className="p-4 bg-slate-900 border-b border-slate-800">
          <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
            <button
              onClick={() => setIsRad(!isRad)}
              className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-bold hover:bg-slate-700 cursor-pointer"
            >
              Mode: {isRad ? 'RAD' : 'DEG'}
            </button>
            <span>Mem: {memory}</span>
          </div>
          <div className="bg-slate-950 rounded-xl p-3 text-right font-mono text-2xl font-bold tracking-wider text-emerald-400 overflow-x-auto whitespace-nowrap min-h-[52px] flex items-center justify-end shadow-inner">
            {display}
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="p-3 grid grid-cols-5 gap-1.5 text-xs font-semibold select-none bg-slate-900">
          {/* Row 1: Sci Functions */}
          <button onClick={() => handleFunction('sin')} className="p-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg">sin</button>
          <button onClick={() => handleFunction('cos')} className="p-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg">cos</button>
          <button onClick={() => handleFunction('tan')} className="p-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg">tan</button>
          <button onClick={() => handleFunction('log')} className="p-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg">log₁₀</button>
          <button onClick={() => handleFunction('ln')} className="p-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg">ln</button>

          {/* Row 2: Powers & Roots */}
          <button onClick={() => handleFunction('sqrt')} className="p-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg">√x</button>
          <button onClick={() => handleFunction('sqr')} className="p-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg">x²</button>
          <button onClick={() => handleFunction('cube')} className="p-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg">x³</button>
          <button onClick={() => handleFunction('fact')} className="p-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg">n!</button>
          <button onClick={() => handleFunction('inv')} className="p-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg">1/x</button>

          {/* Row 3: Memory & Clear */}
          <button onClick={handleClear} className="p-2 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-lg col-span-2 flex items-center justify-center gap-1">
            <RotateCcw className="w-3.5 h-3.5" /> Clear
          </button>
          <button onClick={handleBackspace} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center justify-center">
            <Delete className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => handleOperator('mod')} className="p-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg">mod</button>
          <button onClick={() => handleOperator('÷')} className="p-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg">÷</button>

          {/* Row 4: 7 8 9 * */}
          <button onClick={() => handleDigit('7')} className="p-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg">7</button>
          <button onClick={() => handleDigit('8')} className="p-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg">8</button>
          <button onClick={() => handleDigit('9')} className="p-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg">9</button>
          <button onClick={() => handleDigit('(')} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg">(</button>
          <button onClick={() => handleOperator('×')} className="p-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg">×</button>

          {/* Row 5: 4 5 6 - */}
          <button onClick={() => handleDigit('4')} className="p-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg">4</button>
          <button onClick={() => handleDigit('5')} className="p-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg">5</button>
          <button onClick={() => handleDigit('6')} className="p-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg">6</button>
          <button onClick={() => handleDigit(')')} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg">)</button>
          <button onClick={() => handleOperator('-')} className="p-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg">-</button>

          {/* Row 6: 1 2 3 + */}
          <button onClick={() => handleDigit('1')} className="p-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg">1</button>
          <button onClick={() => handleDigit('2')} className="p-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg">2</button>
          <button onClick={() => handleDigit('3')} className="p-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg">3</button>
          <button onClick={() => handleDigit('.')} className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg">.</button>
          <button onClick={() => handleOperator('+')} className="p-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg">+</button>

          {/* Row 7: 0 = */}
          <button onClick={() => handleDigit('0')} className="p-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg col-span-2">0</button>
          <button onClick={() => handleFunction('exp')} className="p-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg">eˣ</button>
          <button onClick={calculateResult} className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg col-span-2 text-base">=</button>
        </div>

      </div>
    </div>
  );
}
