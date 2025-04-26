
import React from 'react';
import { ArrowLeft, Clock, DollarSign, User, Calendar } from 'lucide-react';

interface BookDetailProps {
  book: any;
  account: string;
  onRent: (bookId: string) => void;
  onReturn: (bookId: string) => void;
  onReclaim: (bookId: string) => void;
  onBack: () => void;
}

const BookDetail: React.FC<BookDetailProps> = ({ 
  book, account, onRent, onReturn, onReclaim, onBack 
}) => {
  if (!book) return null;

  const isOwner = book.owner.toLowerCase() === account.toLowerCase();
  const isRenter = book.renter && book.renter.toLowerCase() === account.toLowerCase();
  const isRented = !book.isAvailable;
  const zeroAddress = '0x0000000000000000000000000000000000000000';
  const canReclaim = isOwner && isRented && book.renter !== zeroAddress;
  const formatDate = (timestamp: string) => (!timestamp || timestamp === '0' ? 'N/A' : new Date(parseInt(timestamp) * 1000).toLocaleString());
  const rentalPeriodEnd = book.rentalPeriod && parseInt(book.rentalPeriod) > 0 ? formatDate(book.rentalPeriod) : 'N/A';

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden border border-blue-100/10">
      <div className="p-8">
        <button 
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft size={18} className="mr-1" />
          Back to Library
        </button>
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 mb-6 md:mb-0 md:mr-6">
            <div className="bg-gray-200 rounded-lg overflow-hidden h-64 md:h-auto">
              {book.coverImage ? (
                <img 
                  src={book.coverImage.startsWith('data:') ? book.coverImage : `data:image/jpeg;base64,${book.coverImage}`} 
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-300">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
            </div>
          </div>
          <div className="md:w-2/3">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{book.title}</h1>
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center text-gray-600">
                <DollarSign size={18} className="mr-1" />
                <span>{book.dailyPrice} ETH per day</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock size={18} className="mr-1" />
                <span>{book.deposit} ETH deposit</span>
              </div>
              <div className="flex items-center text-gray-600">
                <User size={18} className="mr-1" />
                <span>Owner: {book.owner.substring(0, 6)}...{book.owner.substring(book.owner.length - 4)}</span>
              </div>
              <div className="flex items-center">
                <span 
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    book.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {book.isAvailable ? 'Available' : 'Rented'}
                </span>
              </div>
            </div>
            {isRented && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Rental Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center text-gray-700">
                    <User size={16} className="mr-1" />
                    <span>Renter: {book.renter.substring(0, 6)}...{book.renter.substring(book.renter.length - 4)}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Calendar size={16} className="mr-1" />
                    <span>Rented At: {formatDate(book.rentedAt)}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Calendar size={16} className="mr-1" />
                    <span>Due By: {rentalPeriodEnd}</span>
                  </div>
                </div>
              </div>
            )}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
              <p className="text-gray-600">{book.description}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {book.isAvailable && !isOwner && (
                <button 
                  onClick={() => onRent(book.id)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Rent Book
                </button>
              )}
              {isRenter && (
                <button 
                  onClick={() => onReturn(book.id)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                >
                  Return Book
                </button>
              )}
              {canReclaim && (
                <button 
                  onClick={() => onReclaim(book.id)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                >
                  Reclaim Book
                </button>
              )}
              {isOwner && (
                <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                  You own this book
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
