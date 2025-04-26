
import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, DollarSign } from 'lucide-react';
import Web3 from 'web3';

interface MyRentalsProps {
  contract: any;
  account: string;
  web3: Web3 | null;
  onBookSelect: (bookId: string) => void;
  onReturn: (bookId: string) => void;
}

const MyRentals: React.FC<MyRentalsProps> = ({ 
  contract, account, web3, onBookSelect, onReturn 
}) => {
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadRentals = async () => {
      if (!contract || !account || !web3) return;
      try {
        setLoading(true);
        const rentalIds = await contract.methods.getUserRentals(account).call();
        const rentalDetails = await Promise.all(
          rentalIds.map(async (id: string) => {
            const details = await contract.methods.getBookDetails(id).call();
            return {
              id,
              title: details[0],
              description: details[1],
              coverImage: details[2],
              dailyPrice: web3.utils.fromWei(details[3], 'ether'),
              deposit: web3.utils.fromWei(details[4], 'ether'),
              owner: details[5],
              renter: details[6],
              rentedAt: details[7],
              isAvailable: details[8],
              rentalPeriod: details[9]
            };
          })
        );
        setRentals(rentalDetails);
      } catch (error) {
        console.error("Error loading rentals:", error);
      } finally {
        setLoading(false);
      }
    };
    loadRentals();
  }, [contract, account, web3]);

  const formatDate = (timestamp: string) => (!timestamp || timestamp === '0' ? 'N/A' : new Date(parseInt(timestamp) * 1000).toLocaleString());

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (rentals.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-600">You haven't rented any books yet</h2>
        <p className="mt-2 text-gray-500">Browse the library to find books to rent</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {rentals.map((rental) => (
        <div key={rental.id} className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden border border-blue-100/10">
          <div className="p-6 flex flex-col md:flex-row">
            <div 
              className="md:w-1/4 mb-4 md:mb-0 md:mr-6 cursor-pointer"
              onClick={() => onBookSelect(rental.id)}
            >
              <div className="bg-gray-200 rounded-lg overflow-hidden h-48">
                {rental.coverImage ? (
                  <img 
                    src={rental.coverImage.startsWith('data:') ? rental.coverImage : `data:image/jpeg;base64,${rental.coverImage}`} 
                    alt={rental.title}
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
              <h3 
                className="text-xl font-semibold text-gray-800 mb-2 cursor-pointer hover:text-blue-600"
                onClick={() => onBookSelect(rental.id)}
              >
                {rental.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{rental.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                <div className="flex items-center text-gray-600">
                  <DollarSign size={16} className="mr-1" />
                  <span>{rental.dailyPrice} ETH per day</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock size={16} className="mr-1" />
                  <span>Rented on: {formatDate(rental.rentedAt)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock size={16} className="mr-1" />
                  <span>Due by: {formatDate(rental.rentalPeriod)}</span>
                </div>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => onBookSelect(rental.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  View Details
                </button>
                <button 
                  onClick={() => onReturn(rental.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                >
                  Return Book
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyRentals;
