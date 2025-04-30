import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Book, Library, Upload, BookOpen, ArrowLeft, Plus } from 'lucide-react';
import Web3 from 'web3';
import BookRentalABI from './contracts/BookRental.json';
import Header from './components/Header';
import BookList from './components/BookList';
import BookDetail from './components/BookDetail';
import AddBookForm from './components/AddBookForm';
import MyRentals from './components/MyRentals';
import MyBooks from './components/MyBooks';

const CONTRACT_ADDRESS = "0xE440448dA1f762A46bB6893eFbF1dbc0703Cd4d0"; // Example address

function App() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [view, setView] = useState('library'); // library, detail, add, myRentals, myBooks

  useEffect(() => {
    const initWeb3 = async () => {
      try {
        if (window.ethereum) {
          const web3Instance = new Web3(window.ethereum);
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const accounts = await web3Instance.eth.getAccounts();
          const contractInstance = new web3Instance.eth.Contract(
            BookRentalABI.abi,
            CONTRACT_ADDRESS
          );
          setWeb3(web3Instance);
          setContract(contractInstance);
          setAccount(accounts[0]);
          window.ethereum.on('accountsChanged', (accounts) => {
            setAccount(accounts[0]);
          });
          await loadBooks(contractInstance);
        } else {
          toast.error("Please install MetaMask to use this application");
        }
      } catch (error) {
        console.error("Error initializing web3:", error);
        toast.error("Failed to connect to blockchain");
      } finally {
        setLoading(false);
      }
    };
    initWeb3();
  }, []);

  const loadBooks = async (contractInstance) => {
    try {
      setLoading(true);
      const result = await contractInstance.methods.getAllBooks().call();
      const formattedBooks = result[0].map((id, index) => ({
        id: id,
        title: result[1][index],
        description: result[2][index],
        coverImage: result[3][index],
        dailyPrice: Web3.utils.fromWei(result[4][index], 'ether'),
        deposit: Web3.utils.fromWei(result[5][index], 'ether'),
        owner: result[6][index],
        isAvailable: result[7][index]
      }));
      setBooks(formattedBooks);
    } catch (error) {
      console.error("Error loading books:", error);
      toast.error("Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (bookData) => {
    try {
      setLoading(true);
      await contract.methods.listBook(
        bookData.title,
        bookData.description,
        bookData.coverImage,
        Web3.utils.toWei(bookData.dailyPrice, 'ether'),
        Web3.utils.toWei(bookData.deposit, 'ether')
      ).send({ from: account });
      toast.success("Book listed successfully!");
      await loadBooks(contract);
      setView('library');
    } catch (error) {
      console.error("Error adding book:", error);
      toast.error("Failed to list book");
    } finally {
      setLoading(false);
    }
  };

  const handleRentBook = async (bookId) => {
    try {
      setLoading(true);
      const bookDetails = await contract.methods.getBookDetails(bookId).call();
      const totalPayment = Web3.utils.toBN(bookDetails[3]).add(Web3.utils.toBN(bookDetails[4]));
      await contract.methods.rentBook(bookId).send({
        from: account,
        value: totalPayment
      });
      toast.success("Book rented successfully!");
      await loadBooks(contract);
      if (selectedBook && selectedBook.id === bookId) {
        const updatedDetails = await contract.methods.getBookDetails(bookId).call();
        setSelectedBook({
          ...selectedBook,
          isAvailable: false,
          renter: updatedDetails[6]
        });
      }
    } catch (error) {
      console.error("Error renting book:", error);
      toast.error("Failed to rent book");
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBook = async (bookId) => {
    try {
      setLoading(true);
      await contract.methods.returnBook(bookId).send({ from: account });
      toast.success("Book returned successfully!");
      await loadBooks(contract);
      if (selectedBook && selectedBook.id === bookId) {
        const updatedDetails = await contract.methods.getBookDetails(bookId).call();
        setSelectedBook({
          ...selectedBook,
          isAvailable: true,
          renter: '0x0000000000000000000000000000000000000000'
        });
      }
    } catch (error) {
      console.error("Error returning book:", error);
      toast.error("Failed to return book");
    } finally {
      setLoading(false);
    }
  };

  const handleReclaimBook = async (bookId) => {
    try {
      setLoading(true);
      await contract.methods.reclaimBook(bookId).send({ from: account });
      toast.success("Book reclaimed successfully!");
      await loadBooks(contract);
      if (selectedBook && selectedBook.id === bookId) {
        const updatedDetails = await contract.methods.getBookDetails(bookId).call();
        setSelectedBook({
          ...selectedBook,
          isAvailable: true,
          renter: '0x0000000000000000000000000000000000000000'
        });
      }
    } catch (error) {
      console.error("Error reclaiming book:", error);
      toast.error("Failed to reclaim book");
    } finally {
      setLoading(false);
    }
  };

  const handleBookSelect = async (bookId) => {
    try {
      setLoading(true);
      const details = await contract.methods.getBookDetails(bookId).call();
      setSelectedBook({
        id: bookId,
        title: details[0],
        description: details[1],
        coverImage: details[2],
        dailyPrice: Web3.utils.fromWei(details[3], 'ether'),
        deposit: Web3.utils.fromWei(details[4], 'ether'),
        owner: details[5],
        renter: details[6],
        rentedAt: details[7],
        isAvailable: details[8],
        rentalPeriod: details[9]
      });
      setView('detail');
    } catch (error) {
      console.error("Error fetching book details:", error);
      toast.error("Failed to load book details");
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-cyan-400 shadow-lg"></div>
          <span className="mt-6 text-cyan-300 font-semibold tracking-widest text-lg">Loading, please wait...</span>
        </div>
      );
    }
    switch (view) {
      case 'library':
        return (
          <BookList 
            books={books} 
            onBookSelect={handleBookSelect} 
            account={account}
          />
        );
      case 'detail':
        return (
          <BookDetail 
            book={selectedBook} 
            account={account} 
            onRent={handleRentBook}
            onReturn={handleReturnBook}
            onReclaim={handleReclaimBook}
            onBack={() => setView('library')}
          />
        );
      case 'add':
        return (
          <AddBookForm 
            onSubmit={handleAddBook} 
            onCancel={() => setView('library')}
          />
        );
      case 'myRentals':
        return (
          <MyRentals 
            contract={contract} 
            account={account} 
            web3={web3}
            onBookSelect={handleBookSelect}
            onReturn={handleReturnBook}
          />
        );
      case 'myBooks':
        return (
          <MyBooks 
            books={books.filter(book => book.owner.toLowerCase() === account.toLowerCase())} 
            onBookSelect={handleBookSelect}
            onReclaim={handleReclaimBook}
          />
        );
      default:
        return <div>Invalid view</div>;
    }
  };

  // --- DARK MODE & UNIQUE UI STYLES BELOW ---

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#121212] via-[#1a1a2e] to-[#232946] text-gray-100 font-sans transition-colors duration-300">
      {/* HEADER */}
      <div className="shadow-lg bg-gradient-to-r from-[#232946]/90 via-[#121212]/90 to-[#232946]/90 border-b border-[#232946]">
        <Header account={account} />
      </div>

      {/* MAIN CONTENT */}
      <main className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg tracking-tight mb-2">
              {view === 'library' && 'Book Rental Library'}
              {view === 'detail' && 'Book Details'}
              {view === 'add' && 'Add New Book'}
              {view === 'myRentals' && 'My Rented Books'}
              {view === 'myBooks' && 'My Listed Books'}
            </h1>
            <p className="text-gray-400 text-lg font-medium">
              Decentralized, secure, and beautiful book lending on-chain.
            </p>
          </div>
          {/* NAVIGATION BUTTONS */}
          <div className="flex flex-wrap gap-3">
            {view !== 'library' && (
              <button 
                onClick={() => setView('library')}
                className="flex items-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#232946] to-[#121212] shadow-lg border border-cyan-500/30 text-cyan-300 hover:from-cyan-800 hover:to-blue-900 hover:text-white transition-all duration-200"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to Library
              </button>
            )}
            <button 
              onClick={() => setView('library')}
              className={`flex items-center px-5 py-2.5 rounded-xl font-semibold shadow-lg border
                ${view === 'library'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-cyan-500'
                  : 'bg-[#181824]/80 text-cyan-200 border-transparent hover:bg-cyan-900/80 hover:text-white'}
                transition-all duration-200`}
            >
              <Book size={20} className="mr-2" />
              Library
            </button>
            <button 
              onClick={() => setView('myRentals')}
              className={`flex items-center px-5 py-2.5 rounded-xl font-semibold shadow-lg border
                ${view === 'myRentals'
                  ? 'bg-gradient-to-r from-purple-500 to-cyan-400 text-white border-purple-400'
                  : 'bg-[#181824]/80 text-purple-200 border-transparent hover:bg-purple-900/80 hover:text-white'}
                transition-all duration-200`}
            >
              <BookOpen size={20} className="mr-2" />
              My Rentals
            </button>
            <button 
              onClick={() => setView('myBooks')}
              className={`flex items-center px-5 py-2.5 rounded-xl font-semibold shadow-lg border
                ${view === 'myBooks'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-pink-400'
                  : 'bg-[#181824]/80 text-pink-200 border-transparent hover:bg-pink-900/80 hover:text-white'}
                transition-all duration-200`}
            >
              <Library size={20} className="mr-2" />
              My Books
            </button>
            <button 
              onClick={() => setView('add')}
              className={`flex items-center px-5 py-2.5 rounded-xl font-semibold shadow-lg border
                ${view === 'add'
                  ? 'bg-gradient-to-r from-green-400 to-cyan-400 text-white border-green-400'
                  : 'bg-[#181824]/80 text-green-200 border-transparent hover:bg-green-900/80 hover:text-white'}
                transition-all duration-200`}
            >
              <Plus size={20} className="mr-2" />
              Add Book
            </button>
          </div>
        </div>

        {/* CARD-LIKE GLASSMORPHISM CONTAINER */}
        <div className="rounded-3xl bg-[#181824]/60 backdrop-blur-lg shadow-2xl border border-[#232946]/40 p-8 min-h-[400px]">
          {renderContent()}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full py-6 mt-12 text-center text-gray-500 bg-gradient-to-r from-[#232946]/80 via-[#121212]/80 to-[#232946]/80 border-t border-[#232946]/40">
        <span className="tracking-wider font-medium">
          &copy; {new Date().getFullYear()} <span className="text-cyan-400 font-bold">Decentralized Book Rental</span> &mdash; Built with React &amp; Vite
        </span>
      </footer>

      {/* TOASTS */}
      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  );
}

export default App;
