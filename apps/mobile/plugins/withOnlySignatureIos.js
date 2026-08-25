const { withEntitlementsPlist, withInfoPlist } = require("expo/config-plugins");

module.exports = function withOnlySignatureIos(config) {
  config = withEntitlementsPlist(config, (result) => {
    result.modResults["com.apple.developer.default-data-protection"] =
      "NSFileProtectionComplete";
    return result;
  });
  config = withInfoPlist(config, (result) => {
    result.modResults.UIFileSharingEnabled = false;
    result.modResults.LSSupportsOpeningDocumentsInPlace = false;
    return result;
  });
  return config;
};
