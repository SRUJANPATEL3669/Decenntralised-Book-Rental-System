const BookRental = artifacts.require("BookRental");

module.exports = function (deployer) {
  deployer.deploy(BookRental);
};