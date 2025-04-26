const BookRental = artifacts.require("BookRental");
const truffleAssert = require('truffle-assertions');
const { time } = require('@openzeppelin/test-helpers');


contract("BookRental", accounts => {
  const [owner, renter, thirdParty] = accounts;
  let bookRental;

  const bookTitle = "The Catcher in the Rye";
  const bookDescription = "A novel by J.D. Salinger";
  const coverImageBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRg=="; // Minimal base64 image placeholder
  const dailyPrice = web3.utils.toWei("0.01", "ether");
  const deposit = web3.utils.toWei("0.1", "ether");

  beforeEach(async () => {
    bookRental = await BookRental.new({ from: owner });
  });

  describe("Listing books", () => {
    it("should allow listing a book", async () => {
      const tx = await bookRental.listBook(
        bookTitle, 
        bookDescription, 
        coverImageBase64, 
        dailyPrice, 
        deposit, 
        { from: owner }
      );

      truffleAssert.eventEmitted(tx, 'BookListed', (ev) => {
        return ev.title === bookTitle &&
               ev.dailyPrice.toString() === dailyPrice.toString() &&
               ev.deposit.toString() === deposit.toString() &&
               ev.owner === owner;
      });

      const bookDetails = await bookRental.getBookDetails(0);
      assert.equal(bookDetails[0], bookTitle);
      assert.equal(bookDetails[1], bookDescription);
      assert.equal(bookDetails[2], coverImageBase64);
      assert.equal(bookDetails[3].toString(), dailyPrice);
      assert.equal(bookDetails[4].toString(), deposit);
      assert.equal(bookDetails[5], owner);
      assert.equal(bookDetails[8], true); // isAvailable is now at index 8
    });

    it("should reject listing with zero price or deposit", async () => {
      await truffleAssert.reverts(
        bookRental.listBook(bookTitle, bookDescription, coverImageBase64, 0, deposit, { from: owner }),
        "Daily price must be greater than 0"
      );

      await truffleAssert.reverts(
        bookRental.listBook(bookTitle, bookDescription, coverImageBase64, dailyPrice, 0, { from: owner }),
        "Deposit must be greater than 0"
      );
    });
  });

  describe("Renting books", () => {
    beforeEach(async () => {
      await bookRental.listBook(bookTitle, bookDescription, coverImageBase64, dailyPrice, deposit, { from: owner });
    });

    it("should allow renting a book with sufficient payment", async () => {
      const payment = web3.utils.toBN(deposit).add(web3.utils.toBN(dailyPrice));
      const tx = await bookRental.rentBook(0, { from: renter, value: payment });

      truffleAssert.eventEmitted(tx, 'BookRented', (ev) => {
        return ev.bookId.toNumber() === 0 &&
               ev.renter === renter &&
               ev.deposit.toString() === deposit.toString();
      });

      const bookDetails = await bookRental.getBookDetails(0);
      assert.equal(bookDetails[6], renter); // renter is now at index 6
      assert.equal(bookDetails[8], false); // isAvailable is now at index 8

      const userRentals = await bookRental.getUserRentals(renter);
      assert.equal(userRentals.length, 1);
      assert.equal(userRentals[0].toNumber(), 0);
    });

    it("should reject renting with insufficient payment", async () => {
      const insufficientPayment = web3.utils.toBN(deposit).sub(web3.utils.toBN("1"));

      await truffleAssert.reverts(
        bookRental.rentBook(0, { from: renter, value: insufficientPayment }),
        "Insufficient payment"
      );
    });

    it("should reject renting by the owner", async () => {
      const payment = web3.utils.toBN(deposit).add(web3.utils.toBN(dailyPrice));

      await truffleAssert.reverts(
        bookRental.rentBook(0, { from: owner, value: payment }),
        "Owner cannot rent their own book"
      );
    });

    it("should reject renting an already rented book", async () => {
      const payment = web3.utils.toBN(deposit).add(web3.utils.toBN(dailyPrice));

      await bookRental.rentBook(0, { from: renter, value: payment });

      await truffleAssert.reverts(
        bookRental.rentBook(0, { from: thirdParty, value: payment }),
        "Book is not available for rent"
      );
    });

    it("should revert when trying to rent a non-existent book", async () => {
      const nonExistentBookId = 999; // ID that hasn't been listed
      const payment = web3.utils.toBN(deposit).add(web3.utils.toBN(dailyPrice));
    
      await truffleAssert.reverts(
        bookRental.rentBook(nonExistentBookId, { from: renter, value: payment }),
        "Book does not exist"
      );
    });
  });

  describe("Returning books", () => {
    let payment;

    beforeEach(async () => {
      await bookRental.listBook(bookTitle, bookDescription, coverImageBase64, dailyPrice, deposit, { from: owner });
      payment = web3.utils.toBN(deposit).add(web3.utils.toBN(dailyPrice));
      await bookRental.rentBook(0, { from: renter, value: payment });
    });

    it("should allow the renter to return a book on time", async () => {
      const tx = await bookRental.returnBook(0, { from: renter });

      truffleAssert.eventEmitted(tx, 'BookReturned', (ev) => {
        return ev.bookId.toNumber() === 0 &&
               ev.renter === renter &&
               ev.refundAmount.toString() > "0" &&
               ev.lateFee.toString() === "0";
      });

      const bookDetails = await bookRental.getBookDetails(0);
      assert.equal(bookDetails[6], "0x0000000000000000000000000000000000000000"); // renter is now at index 6
      assert.equal(bookDetails[8], true); // isAvailable is now at index 8

      const userRentals = await bookRental.getUserRentals(renter);
      assert.equal(userRentals.length, 0);
    });

    it("should reject return by non-renter", async () => {
      await truffleAssert.reverts(
        bookRental.returnBook(0, { from: thirdParty }),
        "Only the renter can return the book"
      );
    });

    it("should deduct late fees for late returns", async () => {
      // Artificially manipulate blockchain time
      const timeJump = 2 * 24 * 60 * 60; // +2 days
      await time.increase(timeJump);

      const tx = await bookRental.returnBook(0, { from: renter });

      truffleAssert.eventEmitted(tx, 'BookReturned', (ev) => {
        return ev.bookId.toNumber() === 0 &&
               ev.renter === renter &&
               web3.utils.toBN(ev.lateFee).gt(web3.utils.toBN(0));
      });

      const bookDetails = await bookRental.getBookDetails(0);
      assert.equal(bookDetails[8], true); // isAvailable is now at index 8
    });

    it("should allow re-renting a book after it is returned", async () => {
      await bookRental.returnBook(0, { from: renter });
    
      const bookAfterReturn = await bookRental.getBookDetails(0);
      assert.equal(bookAfterReturn[8], true, "Book should be available after return"); // isAvailable is now at index 8
    
      const newPayment = web3.utils.toBN(deposit).add(web3.utils.toBN(dailyPrice));
      const tx = await bookRental.rentBook(0, { from: thirdParty, value: newPayment });
    
      truffleAssert.eventEmitted(tx, 'BookRented', (ev) => {
        return ev.bookId.toNumber() === 0 &&
               ev.renter === thirdParty &&
               ev.deposit.toString() === deposit.toString();
      });
    
      const bookAfterReRent = await bookRental.getBookDetails(0);
      assert.equal(bookAfterReRent[6], thirdParty); // renter is now at index 6
      assert.equal(bookAfterReRent[8], false, "Book should be marked as unavailable after re-renting"); // isAvailable is now at index 8
    
      // Assert rentedAt > 0 and rentalPeriod = rentedAt + 1 day (86400 seconds)
      const rentedAt = web3.utils.toBN(bookAfterReRent[7]); // rentedAt is now at index 7
      const rentalPeriod = web3.utils.toBN(bookAfterReRent[9]); // rentalPeriod is now at index 9
      
      assert(rentedAt.gt(web3.utils.toBN(0)), "rentedAt should be set");
      assert(rentalPeriod.eq(rentedAt.add(web3.utils.toBN(86400))), "rentalPeriod should be rentedAt + 1 day");
    
      const newUserRentals = await bookRental.getUserRentals(thirdParty);
      assert.equal(newUserRentals.length, 1);
      assert.equal(newUserRentals[0].toNumber(), 0);
    });
  });

  describe("Reclaiming book", () => {
    let payment;
  
    beforeEach(async () => {
      // Set up the book listing and rent it
      await bookRental.listBook(bookTitle, bookDescription, coverImageBase64, dailyPrice, deposit, { from: owner });
      payment = web3.utils.toBN(deposit).add(web3.utils.toBN(dailyPrice));
      await bookRental.rentBook(0, { from: renter, value: payment });
    });
  
    it("should allow the owner to reclaim the book after grace period", async () => {
      // Artificially manipulate blockchain time to simulate the passage of time
      const timeJump = 8 * 24 * 60 * 60 + 1; // +8 days
      await time.increase(timeJump);
  
      // Call the reclaimBook function
      const tx = await bookRental.reclaimBook(0, { from: owner });
  
      // Ensure the book is now available again
      const bookDetails = await bookRental.getBookDetails(0);
      assert.equal(bookDetails[8], true, "Book should be available after being reclaimed by the owner"); // isAvailable is now at index 8
  
      // Ensure the renter is removed from the book's state
      assert.equal(bookDetails[6], "0x0000000000000000000000000000000000000000", "Book renter should be reset"); // renter is now at index 6
  
      // Ensure the owner received the deposit
      truffleAssert.eventEmitted(tx, 'BookReturned', (ev) => {
        return ev.bookId.toNumber() === 0 &&
               ev.renter === renter &&
               ev.refundAmount.toString() === "0" && // No refund for the renter
               ev.lateFee.toString() === deposit.toString(); // Full deposit as late fee
      });
  
      // Ensure the renter is removed from the rental list
      const userRentals = await bookRental.getUserRentals(renter);
      assert.equal(userRentals.length, 0, "Renter should no longer have any rentals");
    });
  
    it("should not allow reclaiming a book before the grace period", async () => {
      // Try to reclaim before grace period (should fail)
      await truffleAssert.reverts(
        bookRental.reclaimBook(0, { from: owner }),
        "Grace period not over"
      );
    });
  });
});