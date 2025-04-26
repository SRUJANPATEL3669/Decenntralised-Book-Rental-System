
import React from 'react';
import { BookCopy } from 'lucide-react';

interface HeaderProps {
  account: string;
}

const Header: React.FC<HeaderProps> = ({ account }) => {
  return (
    <header className="bg-gradient-to-r from-blue-700 to-purple-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <BookCopy size={28} className="mr-2" />
          <h1 className="text-2xl font-bold">Decentralized Book Rental</h1>
        </div>
        <div className="flex items-center">
          {account ? (
            <div className="bg-blue-900 px-4 py-2 rounded-lg">
              <span className="text-sm mr-2">Connected:</span>
              <span className="font-mono">
                {account.substring(0, 6)}...{account.substring(account.length - 4)}
              </span>
            </div>
          ) : (
            <div className="bg-red-500 px-4 py-2 rounded-lg">
              <span>Not Connected</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
