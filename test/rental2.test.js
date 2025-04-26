const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

class BookListing {
    constructor() {
        this.books = [];
    }

    addBook() {
        rl.question('Enter book title: ', (title) => {
            rl.question('Enter author: ', (author) => {
                rl.question('Enter price: ', (price) => {
                    this.books.push({
                        title,
                        author,
                        price: parseFloat(price)
                    });
                    console.log('\nBook added successfully!\n');
                    this.showMenu();
                });
            });
        });
    }

    listBooks() {
        console.log('\nCurrent Book Listings:');
        this.books.forEach((book, index) => {
            console.log(`${index + 1}. "${book.title}" by ${book.author} - $${book.price}`);
        });
        console.log();
        this.showMenu();
    }

    showMenu() {
        console.log('1. Add a new book');
        console.log('2. List all books');
        console.log('3. Exit');
        
        rl.question('Choose an option (1-3): ', (choice) => {
            switch(choice) {
                case '1':
                    this.addBook();
                    break;
                case '2':
                    this.listBooks();
                    break;
                case '3':
                    rl.close();
                    break;
                default:
                    console.log('Invalid option!\n');
                    this.showMenu();
            }
        });
    }

    start() {
        console.log('Welcome to Book Listing CLI\n');
        this.showMenu();
    }
}

const bookListing = new BookListing();
bookListing.start();

// Handle readline close
rl.on('close', () => {
    console.log('Goodbye!');
    process.exit(0);
});