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

// Contract address - replace with your deployed contract address
const CONTRACT_ADDRESS = "0xE440448dA1f762A46bB6893eFbF1dbc0703Cd4d0"; // Example address

function App() {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [contract, setContract] = useState<any>(null);
  const [account, setAccount] = useState<string>('');
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [view, setView] = useState<string>('library'); // library, detail, add, myRentals, myBooks

  useEffect(() => {
    const initWeb3 = async () => {
      try {
        // Check if MetaMask is installed
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
          
          // Listen for account changes
          window.ethereum.on('accountsChanged', (accounts: string[]) => {
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

  const loadBooks = async (contractInstance: any) => {
    try {
      setLoading(true);
      const result = await contractInstance.methods.getAllBooks().call();
      console.log("Books loaded:", result);
      
      const formattedBooks = result[0].map((id: string, index: number) => ({
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

  const handleAddBook = async (bookData: any) => {
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

  const handleRentBook = async (bookId: string) => {
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
      
      // Refresh book details
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

  const handleReturnBook = async (bookId: string) => {
    try {
      setLoading(true);
      await contract.methods.returnBook(bookId).send({ from: account });
      
      toast.success("Book returned successfully!");
      await loadBooks(contract);
      
      // Refresh book details
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

  const handleReclaimBook = async (bookId: string) => {
    try {
      setLoading(true);
      await contract.methods.reclaimBook(bookId).send({ from: account });
      
      toast.success("Book reclaimed successfully!");
      await loadBooks(contract);
      
      // Refresh book details
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

  const handleBookSelect = async (bookId: string) => {
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
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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

  return (
    <div className="min-h-screen bg-gray-100">
      <Header account={account} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {view === 'library' && 'Book Rental Library'}
            {view === 'detail' && 'Book Details'}
            {view === 'add' && 'Add New Book'}
            {view === 'myRentals' && 'My Rented Books'}
            {view === 'myBooks' && 'My Listed Books'}
          </h1>
          
          <div className="flex space-x-2">
            {view !== 'library' && (
              <button 
                onClick={() => setView('library')}
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                <ArrowLeft size={18} className="mr-1" />
                Back to Library
              </button>
            )}
            
            <button 
              onClick={() => setView('library')}
              className={`flex items-center px-4 py-2 rounded-lg ${view === 'library' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              <Book size={18} className="mr-1" />
              Library
            </button>
            
            <button 
              onClick={() => setView('myRentals')}
              className={`flex items-center px-4 py-2 rounded-lg ${view === 'myRentals' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              <BookOpen size={18} className="mr-1" />
              My Rentals
            </button>
            
            <button 
              onClick={() => setView('myBooks')}
              className={`flex items-center px-4 py-2 rounded-lg ${view === 'myBooks' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              <Library size={18} className="mr-1" />
              My Books
            </button>
            
            <button 
              onClick={() => setView('add')}
              className={`flex items-center px-4 py-2 rounded-lg ${view === 'add' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white hover:bg-green-600'}`}
            >
              <Plus size={18} className="mr-1" />
              Add Book
            </button>
          </div>
        </div>
        
        {renderContent()}
      </main>
      
      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default App;