import React from 'react';
import { Library, DollarSign, Clock, AlertCircle } from 'lucide-react';

interface MyBooksProps {
  books: any[];
  onBookSelect: (bookId: string) => void;
  onReclaim: (bookId: string) => void;
}

const MyBooks: React.FC<MyBooksProps> = ({ books, onBookSelect, onReclaim }) => {
  if (books.length === 0) {
    return (
      <div className="text-center py-16">
        <Library size={56} className="mx-auto text-cyan-700 mb-4 drop-shadow-lg" />
        <h2 className="text-2xl font-bold text-cyan-200 mb-2">No Books Listed Yet</h2>
        <p className="text-cyan-400">Add a book to start earning by renting it out!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2">
      {books.map((book) => (
        <div
          key={book.id}
          className="relative bg-[#181824]/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-cyan-500/10 flex flex-col md:flex-row transition-transform hover:scale-[1.015]"
        >
          {/* Book Cover */}
          <div
            className="md:w-40 w-full flex-shrink-0 cursor-pointer overflow-hidden rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none"
            onClick={() => onBookSelect(book.id)}
            title="View Details"
            style={{
              background:
                'linear-gradient(135deg, rgba(34,193,195,0.25) 0%, rgba(253,187,45,0.15) 100%)'
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
                className="object-cover w-full h-56 md:h-56"
              />
            ) : (
              <div className="w-full h-56 flex items-center justify-center bg-cyan-900/30 text-cyan-300">
                <span>No Image</span>
              </div>
            )}
          </div>
          {/* Details */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3
                  className="text-xl font-bold text-cyan-100 cursor-pointer hover:text-cyan-400 transition"
                  onClick={() => onBookSelect(book.id)}
                >
                  {book.title}
                </h3>
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
              <p className="text-cyan-300 mb-4 line-clamp-2">{book.description}</p>
              <div className="flex flex-wrap gap-x-8 gap-y-2 text-cyan-400 text-sm mb-4">
                <div className="flex items-center">
                  <DollarSign size={16} className="mr-1" />
                  <span>{book.dailyPrice} ETH/day</span>
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="mr-1" />
                  <span>{book.deposit} ETH deposit</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => onBookSelect(book.id)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-500 text-white font-semibold shadow-md hover:from-cyan-700 hover:to-blue-600 transition"
              >
                View Details
              </button>
              {!book.isAvailable && (
                <button
                  onClick={() => onReclaim(book.id)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold shadow-md hover:from-pink-600 hover:to-red-600 transition flex items-center"
                >
                  <AlertCircle size={16} className="mr-1" />
                  Reclaim Book
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyBooks;
