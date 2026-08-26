import ExpoModulesCore
import StoreKit

@available(iOS 15.0, *)
public final class OnlySignatureStoreKitModule: Module {
  private var observer: Task<Void, Never>?

  private func payload(_ transaction: Transaction, verified: Bool, state: String = "purchased") -> [String: Any] {
    ["transactionId": String(transaction.id), "productId": transaction.productID, "appAccountToken": transaction.appAccountToken?.uuidString.lowercased() as Any, "state": state, "verified": verified]
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
      guard let product = try await Product.products(for: [productId]).first else { throw NSError(domain: "OnlySignatureStoreKit", code: 2) }
      let result: Product.PurchaseResult
      do {
        if let value = appAccountToken, let token = UUID(uuidString: value) { result = try await product.purchase(options: [.appAccountToken(token)]) }
        else { result = try await product.purchase() }
      } catch let error as Product.PurchaseError {
        return ["transactionId": "", "productId": productId, "appAccountToken": appAccountToken as Any, "state": "request-failed", "verified": false, "errorCategory": String(describing: type(of: error))]
      } catch {
        return ["transactionId": "", "productId": productId, "appAccountToken": appAccountToken as Any, "state": "request-interrupted", "verified": false, "errorCategory": String(describing: type(of: error))]
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
