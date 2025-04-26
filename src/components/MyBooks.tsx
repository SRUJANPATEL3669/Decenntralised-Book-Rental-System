
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
      <div className="text-center py-12">
        <Library size={48} className="mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-600">You haven't listed any books yet</h2>
        <p className="mt-2 text-gray-500">Add a book to start renting it out</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {books.map((book) => (
        <div key={book.id} className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden border border-blue-100/10">
          <div className="p-6 flex flex-col md:flex-row">
            <div 
              className="md:w-1/4 mb-4 md:mb-0 md:mr-6 cursor-pointer"
              onClick={() => onBookSelect(book.id)}
            >
              <div className="bg-gray-200 rounded-lg overflow-hidden h-48">
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
            <div className="md:w-3/4">
              <div className="flex justify-between items-start mb-2">
                <h3 
                  className="text-xl font-semibold text-gray-800 cursor-pointer hover:text-blue-600"
                  onClick={() => onBookSelect(book.id)}
                >
                  {book.title}
                </h3>
                <span 
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    book.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {book.isAvailable ? 'Available' : 'Rented'}
                </span>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-2">{book.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                <div className="flex items-center text-gray-600">
                  <DollarSign size={16} className="mr-1" />
                  <span>{book.dailyPrice} ETH per day</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock size={16} className="mr-1" />
                  <span>{book.deposit} ETH deposit</span>
                </div>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => onBookSelect(book.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  View Details
                </button>
                {!book.isAvailable && (
                  <button 
                    onClick={() => onReclaim(book.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center"
                  >
                    <AlertCircle size={16} className="mr-1" />
                    Reclaim Book
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyBooks;
