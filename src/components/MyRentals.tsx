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

  const formatDate = (timestamp: string) =>
    (!timestamp || timestamp === '0'
      ? 'N/A'
      : new Date(parseInt(timestamp) * 1000).toLocaleString()
    );

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-cyan-400 shadow-lg"></div>
        <span className="mt-4 text-cyan-300 font-medium">Loading your rentals...</span>
      </div>
    );
  }

  if (rentals.length === 0) {
    return (
      <div className="text-center py-16">
        <BookOpen size={56} className="mx-auto text-cyan-700 mb-4 drop-shadow-lg" />
        <h2 className="text-2xl font-bold text-cyan-200 mb-2">No Rented Books Yet</h2>
        <p className="text-cyan-400">Browse the library and rent your first book!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2">
      {rentals.map((rental) => (
        <div
          key={rental.id}
          className="relative bg-[#181824]/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-cyan-500/10 flex flex-col md:flex-row transition-transform hover:scale-[1.015]"
        >
          {/* Book Cover */}
          <div
            className="md:w-40 w-full flex-shrink-0 cursor-pointer overflow-hidden rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none"
            onClick={() => onBookSelect(rental.id)}
            title="View Details"
            style={{
              background:
                'linear-gradient(135deg, rgba(34,193,195,0.25) 0%, rgba(253,187,45,0.15) 100%)'
            }}
          >
            {rental.coverImage ? (
              <img
                src={
                  rental.coverImage.startsWith('data:')
                    ? rental.coverImage
                    : `data:image/jpeg;base64,${rental.coverImage}`
                }
                alt={rental.title}
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
              <h3
                className="text-xl font-bold text-cyan-100 mb-2 cursor-pointer hover:text-cyan-400 transition"
                onClick={() => onBookSelect(rental.id)}
              >
                {rental.title}
              </h3>
              <p className="text-cyan-300 mb-4 line-clamp-2">{rental.description}</p>
              <div className="flex flex-wrap gap-x-8 gap-y-2 text-cyan-400 text-sm mb-4">
                <div className="flex items-center">
                  <DollarSign size={16} className="mr-1" />
                  <span>{rental.dailyPrice} ETH/day</span>
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="mr-1" />
                  <span>Rented: {formatDate(rental.rentedAt)}</span>
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="mr-1" />
                  <span>Due: {formatDate(rental.rentalPeriod)}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => onBookSelect(rental.id)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-500 text-white font-semibold shadow-md hover:from-cyan-700 hover:to-blue-600 transition"
              >
                View Details
              </button>
              <button
                onClick={() => onReturn(rental.id)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-cyan-400 text-white font-semibold shadow-md hover:from-green-600 hover:to-cyan-500 transition"
              >
                Return Book
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyRentals;
