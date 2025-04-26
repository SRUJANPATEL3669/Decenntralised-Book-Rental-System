module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // Match any network id
    },
  },

  // ✅ Add gas reporter to mocha
  mocha: {
    reporter: 'eth-gas-reporter',
    reporterOptions: {
      currency: 'INR',           // Optional: change to 'USD' if preferred
      showTimeSpent: true,
      onlyCalledMethods: true,
      noColors: true             // Optional: for clean console output
    }
  },

  // ✅ Enable optimizer
  compilers: {
    solc: {
      version: "0.8.20",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  },

  // ✅ Add plugins section if you want to add more in future
  plugins: [
    'truffle-plugin-verify'
  ]
};
