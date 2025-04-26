// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract BookRental is ReentrancyGuard {
    struct Book {
        string title;
        string description;
        string coverImageBase64; // base64-encoded image string
        uint256 dailyPrice;
        uint256 deposit;
        address owner;
        address renter;
        uint256 rentedAt;
        uint256 rentalPeriod;
        bool isAvailable;
    }

    mapping(uint256 => Book) public books;
    uint128 private _bookIdCounter;
    mapping(address => uint256[]) private userRentals;

    event BookListed(uint256 indexed bookId, string title, uint256 dailyPrice, uint256 deposit, address owner);
    event BookRented(uint256 indexed bookId, address renter, uint256 rentedAt, uint256 deposit);
    event BookReturned(uint256 indexed bookId, address renter, uint256 returnedAt, uint256 refundAmount, uint256 lateFee);

    function listBook(
        string memory _title,
        string memory _description,
        string memory _coverImageBase64,
        uint256 _dailyPrice,
        uint256 _deposit
    ) external {
        require(_dailyPrice > 0, "Daily price must be greater than 0");
        require(_deposit > 0, "Deposit must be greater than 0");

        uint256 bookId = _bookIdCounter;
        _bookIdCounter++;

        books[bookId] = Book({
            title: _title,
            description: _description,
            coverImageBase64: _coverImageBase64,
            dailyPrice: _dailyPrice,
            deposit: _deposit,
            owner: msg.sender,
            renter: address(0),
            rentedAt: 0,
            rentalPeriod: 0,
            isAvailable: true
        });

        emit BookListed(bookId, _title, _dailyPrice, _deposit, msg.sender);
    }

    function rentBook(uint256 _bookId) external payable nonReentrant {
        Book storage book = books[_bookId];

        require(book.owner != address(0), "Book does not exist");
        require(book.isAvailable, "Book is not available for rent");
        require(msg.sender != book.owner, "Owner cannot rent their own book");
        require(msg.value >= book.deposit + book.dailyPrice, "Insufficient payment");

        book.renter = msg.sender;
        book.rentedAt = block.timestamp;
        book.isAvailable = false;
        book.rentalPeriod = block.timestamp + 1 days;

        userRentals[msg.sender].push(_bookId);

        (bool success, ) = payable(book.owner).call{value: book.dailyPrice}("");
        require(success, "Failed to send payment to owner");

        if (msg.value > book.deposit + book.dailyPrice) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - (book.deposit + book.dailyPrice)}("");
            require(refundSuccess, "Failed to refund excess payment to renter");
        }

        emit BookRented(_bookId, msg.sender, block.timestamp, book.deposit);
    }

    function returnBook(uint256 _bookId) external nonReentrant {
        Book storage book = books[_bookId];

        require(book.owner != address(0), "Book does not exist");
        require(!book.isAvailable, "Book is not rented");
        require(msg.sender == book.renter, "Only the renter can return the book");

        uint256 rentalDays = (block.timestamp - book.rentedAt + 86399) / 86400;
        if (rentalDays == 0) rentalDays = 1;

        uint256 lateFee = 0;
        if (block.timestamp > book.rentalPeriod) {
            uint256 lateDays = (block.timestamp - book.rentalPeriod + 86399) / 86400;
            lateFee = book.dailyPrice * lateDays;
        }

        uint256 totalRentalCost = book.dailyPrice * (rentalDays - 1) + lateFee;
        uint256 refundAmount = book.deposit > totalRentalCost ? book.deposit - totalRentalCost : 0;

        if (totalRentalCost < book.deposit) {
            (bool ownerPaid, ) = payable(book.owner).call{value: totalRentalCost}("");
            require(ownerPaid, "Failed to send payment to owner");

            if (refundAmount > 0) {
                (bool renterRefunded, ) = payable(msg.sender).call{value: refundAmount}("");
                require(renterRefunded, "Failed to refund renter");
            }
        } else {
            (bool allToOwner, ) = payable(book.owner).call{value: book.deposit}("");
            require(allToOwner, "Failed to send deposit to owner");
        }

        book.isAvailable = true;
        removeFromUserRentals(msg.sender, _bookId);

        emit BookReturned(_bookId, msg.sender, block.timestamp, refundAmount, lateFee);

        book.renter = address(0);
        book.rentedAt = 0;
        book.rentalPeriod = 0;
    }

    function reclaimBook(uint256 _bookId) external nonReentrant {
        Book storage book = books[_bookId];

        require(book.owner != address(0), "Book does not exist");
        require(!book.isAvailable, "Book is already available");
        require(msg.sender == book.owner, "Only the book owner can reclaim");
        require(block.timestamp > book.rentalPeriod + 7 days, "Grace period not over");

        (bool paid, ) = payable(book.owner).call{value: book.deposit}("");
        require(paid, "Failed to send deposit to owner");

        emit BookReturned(_bookId, book.renter, block.timestamp, 0, book.deposit);

        address renterBeforeReset = book.renter;
        book.isAvailable = true;
        removeFromUserRentals(renterBeforeReset, _bookId);
        book.renter = address(0);
        book.rentedAt = 0;
        book.rentalPeriod = 0;
    }

    function removeFromUserRentals(address _user, uint256 _bookId) private {
        uint256[] storage rentals = userRentals[_user];
        uint256 length = rentals.length;

        for (uint256 i = 0; i < length;) {
            if (rentals[i] == _bookId) {
                rentals[i] = rentals[length - 1];
                rentals.pop();
                break;
            }
            unchecked {
                ++i;
            }
        }
    }

    function getAllBooks() external view returns (
        uint256[] memory,
        string[] memory,
        string[] memory,
        string[] memory,
        uint256[] memory,
        uint256[] memory,
        address[] memory,
        bool[] memory
    ) {
        uint256[] memory ids = new uint256[](_bookIdCounter);
        string[] memory titles = new string[](_bookIdCounter);
        string[] memory descriptions = new string[](_bookIdCounter);
        string[] memory images = new string[](_bookIdCounter);
        uint256[] memory prices = new uint256[](_bookIdCounter);
        uint256[] memory deposits = new uint256[](_bookIdCounter);
        address[] memory owners = new address[](_bookIdCounter);
        bool[] memory availability = new bool[](_bookIdCounter);

        for (uint256 i = 0; i < _bookIdCounter; i++) {
            Book memory book = books[i];
            ids[i] = i;
            titles[i] = book.title;
            descriptions[i] = book.description;
            images[i] = book.coverImageBase64;
            prices[i] = book.dailyPrice;
            deposits[i] = book.deposit;
            owners[i] = book.owner;
            availability[i] = book.isAvailable;
        }

        return (ids, titles, descriptions, images, prices, deposits, owners, availability);
    }

    function getBookDetails(uint256 _bookId) external view returns (
        string memory,
        string memory,
        string memory,
        uint256,
        uint256,
        address,
        address,
        uint256,
        bool,
        uint256
    ) {
        Book storage book = books[_bookId];
        return (
            book.title,
            book.description,
            book.coverImageBase64,
            book.dailyPrice,
            book.deposit,
            book.owner,
            book.renter,
            book.rentedAt,
            book.isAvailable,
            book.rentalPeriod
        );
    }

    function getUserRentals(address _user) external view returns (uint256[] memory) {
        return userRentals[_user];
    }
}