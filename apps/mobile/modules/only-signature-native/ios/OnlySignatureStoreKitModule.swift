import ExpoModulesCore
import StoreKit

@available(iOS 15.0, *)
public final class OnlySignatureStoreKitModule: Module {
  private var observer: Task<Void, Never>?

  private func payload(_ transaction: Transaction, verified: Bool, state: String = "purchased") -> [String: Any] {
    var result: [String: Any] = [
      "transactionId": String(transaction.id),
      "productId": transaction.productID,
      "state": state,
      "verified": verified
    ]
    if let appAccountToken = transaction.appAccountToken {
      result["appAccountToken"] = appAccountToken.uuidString.lowercased()
    }
    return result
  }

  private func requestPayload(productId: String, appAccountToken: String?, state: String, errorCategory: String) -> [String: Any] {
    var result: [String: Any] = [
      "transactionId": "",
      "productId": productId,
      "state": state,
      "verified": false,
      "errorCategory": errorCategory
    ]
    if let value = appAccountToken {
      result["appAccountToken"] = UUID(uuidString: value)?.uuidString.lowercased() ?? value.lowercased()
    }
    return result
  }

  private func purchaseErrorPayload(_ error: Error, productId: String, appAccountToken: String?) -> [String: Any] {
    if error is Product.PurchaseError {
      return requestPayload(productId: productId, appAccountToken: appAccountToken, state: "request-failed", errorCategory: "product-purchase-error")
    }
    if let storeKitError = error as? StoreKitError {
      switch storeKitError {
      case .userCancelled:
        return requestPayload(productId: productId, appAccountToken: appAccountToken, state: "cancelled", errorCategory: "user-cancelled")
      case .notAvailableInStorefront:
        return requestPayload(productId: productId, appAccountToken: appAccountToken, state: "request-failed", errorCategory: "not-available-in-storefront")
      case .notEntitled:
        return requestPayload(productId: productId, appAccountToken: appAccountToken, state: "request-failed", errorCategory: "not-entitled")
      case .unsupported:
        return requestPayload(productId: productId, appAccountToken: appAccountToken, state: "request-failed", errorCategory: "unsupported")
      case .networkError:
        return requestPayload(productId: productId, appAccountToken: appAccountToken, state: "request-interrupted", errorCategory: "network-error")
      case .systemError:
        return requestPayload(productId: productId, appAccountToken: appAccountToken, state: "request-interrupted", errorCategory: "system-error")
      case .unknown:
        return requestPayload(productId: productId, appAccountToken: appAccountToken, state: "request-interrupted", errorCategory: "unknown-error")
      @unknown default:
        return requestPayload(productId: productId, appAccountToken: appAccountToken, state: "request-interrupted", errorCategory: "unrecognized-storekit-error")
      }
    }
    return requestPayload(productId: productId, appAccountToken: appAccountToken, state: "request-interrupted", errorCategory: "unexpected-error")
  }

  public func definition() -> ModuleDefinition {
    Name("OnlySignatureStoreKit")
    Events("onStoreKitTransaction")
    OnCreate {
      self.observer = Task { [weak self] in
        for await update in Transaction.updates {
          guard let self else { return }
          switch update {
          case .verified(let transaction): self.sendEvent("onStoreKitTransaction", self.payload(transaction, verified: true))
          case .unverified(let transaction, _): self.sendEvent("onStoreKitTransaction", self.payload(transaction, verified: false, state: "failed"))
          }
        }
      }
    }
    OnDestroy { self.observer?.cancel() }
    AsyncFunction("loadProduct") { (productId: String) -> [String: String] in
      guard let product = try await Product.products(for: [productId]).first else { throw NSError(domain: "OnlySignatureStoreKit", code: 2) }
      return ["productId": product.id, "displayPrice": product.displayPrice]
    }
    AsyncFunction("purchase") { (productId: String, appAccountToken: String?) -> [String: Any] in
      guard let tokenValue = appAccountToken, let token = UUID(uuidString: tokenValue) else {
        return self.requestPayload(productId: productId, appAccountToken: appAccountToken, state: "request-failed", errorCategory: "invalid-app-account-token")
      }
      let product: Product
      do {
        guard let availableProduct = try await Product.products(for: [productId]).first else {
          return self.requestPayload(productId: productId, appAccountToken: appAccountToken, state: "request-failed", errorCategory: "product-not-found")
        }
        product = availableProduct
      } catch {
        return self.requestPayload(productId: productId, appAccountToken: appAccountToken, state: "request-failed", errorCategory: "product-lookup-failed")
      }
      let result: Product.PurchaseResult
      do {
        result = try await product.purchase(options: [.appAccountToken(token)])
      } catch {
        return self.purchaseErrorPayload(error, productId: productId, appAccountToken: appAccountToken)
      }
      switch result {
      case .success(let verification):
        switch verification {
        case .verified(let transaction): return self.payload(transaction, verified: true)
        case .unverified(let transaction, _): return self.payload(transaction, verified: false, state: "failed")
        }
      case .pending: return ["transactionId": "", "productId": productId, "state": "pending", "verified": false]
      case .userCancelled: return ["transactionId": "", "productId": productId, "state": "cancelled", "verified": false]
      @unknown default: return ["transactionId": "", "productId": productId, "state": "failed", "verified": false]
      }
    }
    AsyncFunction("unfinishedSnapshot") { () -> [[String: Any]] in
      var transactions: [[String: Any]] = []
      for await result in Transaction.unfinished {
        switch result {
        case .verified(let transaction): transactions.append(self.payload(transaction, verified: true))
        case .unverified(let transaction, _): transactions.append(self.payload(transaction, verified: false, state: "failed"))
        }
      }
      return transactions
    }
    AsyncFunction("finish") { (transactionId: String) -> Bool in
      for await result in Transaction.unfinished {
        if case .verified(let transaction) = result, String(transaction.id) == transactionId { await transaction.finish(); return true }
      }
      return false
    }
  }
}
