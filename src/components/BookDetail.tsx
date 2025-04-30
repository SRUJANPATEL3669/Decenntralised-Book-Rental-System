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
  const formatDate = (timestamp: string) =>
    (!timestamp || timestamp === '0'
      ? 'N/A'
      : new Date(parseInt(timestamp) * 1000).toLocaleString()
    );
  const rentalPeriodEnd =
    book.rentalPeriod && parseInt(book.rentalPeriod) > 0
      ? formatDate(book.rentalPeriod)
      : 'N/A';

  return (
    <div className="bg-[#181824]/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-cyan-500/10 overflow-hidden">
      <div className="p-8">
        <button
          onClick={onBack}
          className="flex items-center text-cyan-300 hover:text-cyan-100 mb-6 font-semibold transition"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Library
        </button>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Book Cover */}
          <div className="md:w-1/3 w-full flex-shrink-0">
            <div
              className="rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-900/40 to-blue-900/30 border border-cyan-800/20 h-72 flex items-center justify-center"
              style={{
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
              }}
            >
              {book.coverImage ? (
                <img
                  src={
                    book.coverImage.startsWith('data:')
                      ? book.coverImage
                      : `data:image/jpeg;base64,${book.coverImage}`
                  }
                  alt={book.title}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-cyan-400 text-lg">No Image</span>
              )}
            </div>
          </div>
          {/* Book Info */}
          <div className="md:w-2/3 w-full flex flex-col">
            <h1 className="text-3xl md:text-4xl font-extrabold text-cyan-100 mb-2 tracking-tight drop-shadow">
              {book.title}
            </h1>
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center text-cyan-300">
                <DollarSign size={20} className="mr-1" />
                <span className="font-semibold">{book.dailyPrice} ETH/day</span>
              </div>
              <div className="flex items-center text-cyan-300">
                <Clock size={20} className="mr-1" />
                <span className="font-semibold">{book.deposit} ETH deposit</span>
              </div>
              <div className="flex items-center text-cyan-300">
                <User size={20} className="mr-1" />
                <span>
                  Owner: {book.owner.substring(0, 6)}...{book.owner.substring(book.owner.length - 4)}
                </span>
              </div>
              <div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow
                    ${book.isAvailable
                      ? 'bg-green-900/50 text-green-300 border border-green-500/30'
                      : 'bg-red-900/50 text-red-300 border border-red-500/30'
                    }`}
                >
                  {book.isAvailable ? 'Available' : 'Rented'}
                </span>
              </div>
            </div>
            {isRented && (
              <div className="mb-4 p-4 rounded-2xl bg-cyan-900/30 border border-cyan-700/20 shadow-inner">
                <h3 className="font-semibold text-cyan-200 mb-2">Rental Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-cyan-300">
                  <div className="flex items-center">
                    <User size={16} className="mr-1" />
                    <span>
                      Renter: {book.renter.substring(0, 6)}...{book.renter.substring(book.renter.length - 4)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-1" />
                    <span>Rented At: {formatDate(book.rentedAt)}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-1" />
                    <span>Due By: {rentalPeriodEnd}</span>
                  </div>
                </div>
              </div>
            )}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-cyan-100 mb-2">Description</h3>
              <p className="text-cyan-200">{book.description}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {book.isAvailable && !isOwner && (
                <button
                  onClick={() => onRent(book.id)}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-500 text-white font-semibold shadow-md hover:from-cyan-700 hover:to-blue-600 transition"
                >
                  Rent Book
                </button>
              )}
              {isRenter && (
                <button
                  onClick={() => onReturn(book.id)}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-green-500 to-cyan-400 text-white font-semibold shadow-md hover:from-green-600 hover:to-cyan-500 transition"
                >
                  Return Book
                </button>
              )}
              {canReclaim && (
                <button
                  onClick={() => onReclaim(book.id)}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold shadow-md hover:from-pink-600 hover:to-red-600 transition"
                >
                  Reclaim Book
                </button>
              )}
              {isOwner && (
                <span className="px-4 py-2 bg-cyan-900/50 text-cyan-200 rounded-xl font-semibold border border-cyan-700/30">
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
