import React from 'react';
import { BookCopy } from 'lucide-react';

interface HeaderProps {
  account: string;
}

const Header: React.FC<HeaderProps> = ({ account }) => {
  return (
    <header className="bg-gradient-to-r from-[#232946]/90 via-[#121212]/90 to-[#232946]/90 shadow-xl border-b border-cyan-900/30 backdrop-blur-lg">
      <div className="container mx-auto px-4 py-5 flex justify-between items-center">
        <div className="flex items-center">
          <span className="inline-flex items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 p-2 shadow-lg mr-3">
            <BookCopy size={28} className="text-white drop-shadow-lg" />
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow tracking-tight">
            Decentralized Book Rental
          </h1>
        </div>
        <div className="flex items-center">
          {account ? (
            <div className="flex items-center bg-cyan-900/60 border border-cyan-600/30 px-5 py-2 rounded-2xl shadow-inner">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-2" title="Wallet Connected"></span>
              <span className="text-sm text-cyan-200 mr-2">Connected:</span>
              <span className="font-mono text-cyan-100 tracking-wider">
                {account.substring(0, 6)}...{account.substring(account.length - 4)}
              </span>
            </div>
          ) : (
            <div className="flex items-center bg-red-900/60 border border-red-600/30 px-5 py-2 rounded-2xl shadow-inner">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse mr-2" title="Wallet Not Connected"></span>
              <span className="text-red-200 font-semibold">Not Connected</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
