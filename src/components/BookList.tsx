
import React from 'react';
import { Clock, DollarSign } from 'lucide-react';

interface BookListProps {
  books: any[];
  onBookSelect: (bookId: string) => void;
  account: string;
}

const BookList: React.FC<BookListProps> = ({ books, onBookSelect, account }) => {
  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-600">No books available</h2>
        <p className="mt-2 text-gray-500">Be the first to list a book!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {books.map((book) => (
        <div 
          key={book.id} 
          className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg overflow-hidden hover:scale-[1.03] transition-transform cursor-pointer border border-blue-100/10"
          onClick={() => onBookSelect(book.id)}
        >
          <div className="h-48 overflow-hidden bg-gray-200">
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
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">{book.title}</h3>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <DollarSign size={16} className="mr-1" />
              <span>{book.dailyPrice} ETH per day</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 mb-3">
              <Clock size={16} className="mr-1" />
              <span>{book.deposit} ETH deposit</span>
            </div>
            <div className="flex justify-between items-center">
              <span 
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  book.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {book.isAvailable ? 'Available' : 'Rented'}
              </span>
              {book.owner.toLowerCase() === account.toLowerCase() && (
                <span className="text-xs text-blue-600 font-medium">Your Book</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookList;
