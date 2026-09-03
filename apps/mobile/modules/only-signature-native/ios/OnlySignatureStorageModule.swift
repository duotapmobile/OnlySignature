import ExpoModulesCore

public final class OnlySignatureStorageModule: Module {
  private let fileManager = FileManager.default

  private enum StorageErrorCode: Int {
    case invalidFileURI = 10
    case unsupportedExportExtension = 11
    case sourceOutsideCaptureDirectory = 12
    case sourceIsSymbolicLink = 13
    case sourceIsNotReadableFile = 14
    case destinationOutsideExportDirectory = 15
    case destinationAlreadyExists = 16
    case exportPromotionFailed = 17
    case exportProtectionFailed = 18
    case exportVerificationFailed = 19
    case exportCleanupFailed = 20
    case exportDeletionFailed = 21
    case sourceExtensionMismatch = 22
  }

  private func storageError(_ code: StorageErrorCode) -> NSError {
    NSError(
      domain: "OnlySignatureStorage",
      code: code.rawValue,
      userInfo: [NSLocalizedDescriptionKey: "Protected export operation failed"]
    )
  }

  private func sanitizedStorageError(_ error: Error, fallback: StorageErrorCode) -> NSError {
    let nsError = error as NSError
    if nsError.domain == "OnlySignatureStorage",
       StorageErrorCode(rawValue: nsError.code) != nil {
      return nsError
    }
    return storageError(fallback)
  }

  private func fileURL(from value: String) throws -> URL {
    guard !value.isEmpty, !value.contains("\0") else {
      throw storageError(.invalidFileURI)
    }
    if value.hasPrefix("/") {
      return URL(fileURLWithPath: value).standardizedFileURL
    }
    guard let url = URL(string: value), url.isFileURL,
          url.query == nil, url.fragment == nil else {
      throw storageError(.invalidFileURI)
    }
    return url.standardizedFileURL
  }

  private func isStrictDescendant(_ child: URL, of parent: URL) -> Bool {
    let childComponents = child.pathComponents
    let parentComponents = parent.pathComponents
    guard childComponents.count > parentComponents.count else { return false }
    return Array(childComponents.prefix(parentComponents.count)) == parentComponents
  }

  private func rawCaptureDirectory() -> URL {
    URL(fileURLWithPath: NSTemporaryDirectory(), isDirectory: true)
      .appendingPathComponent("ReactNative", isDirectory: true)
      .standardizedFileURL
  }

  private func validatedCaptureFile(from uri: String) throws -> URL {
    let source = try fileURL(from: uri)
    let rawDirectory = rawCaptureDirectory()
    guard isStrictDescendant(source, of: rawDirectory) else {
      throw storageError(.sourceOutsideCaptureDirectory)
    }
    let sourceValues = try source.resourceValues(forKeys: [.isRegularFileKey, .isSymbolicLinkKey])
    guard sourceValues.isSymbolicLink != true else {
      throw storageError(.sourceIsSymbolicLink)
    }
    let canonicalDirectory = rawDirectory.resolvingSymlinksInPath()
    let canonicalSource = source.resolvingSymlinksInPath()
    guard isStrictDescendant(canonicalSource, of: canonicalDirectory) else {
      throw storageError(.sourceOutsideCaptureDirectory)
    }
    let rawRelativeComponents = Array(
      source.pathComponents.dropFirst(rawDirectory.pathComponents.count)
    )
    let canonicalRelativeComponents = Array(
      canonicalSource.pathComponents.dropFirst(canonicalDirectory.pathComponents.count)
    )
    guard rawRelativeComponents == canonicalRelativeComponents else {
      throw storageError(.sourceIsSymbolicLink)
    }
    guard sourceValues.isRegularFile == true,
          fileManager.isReadableFile(atPath: canonicalSource.path) else {
      throw storageError(.sourceIsNotReadableFile)
    }
    return canonicalSource
  }

  private func validatedExportExtension(_ value: String) throws -> String {
    let normalized = value.lowercased()
    guard normalized == "png" || normalized == "jpg" else {
      throw storageError(.unsupportedExportExtension)
    }
    return normalized
  }

  private func validatedExportURL(_ url: URL, inside directory: URL) throws -> URL {
    let rawDirectory = directory.standardizedFileURL
    let rawURL = url.standardizedFileURL
    guard isStrictDescendant(rawURL, of: rawDirectory) else {
      throw storageError(.destinationOutsideExportDirectory)
    }
    let canonicalDirectory = rawDirectory.resolvingSymlinksInPath()
    let canonicalURL = rawURL.resolvingSymlinksInPath()
    guard isStrictDescendant(canonicalURL, of: canonicalDirectory) else {
      throw storageError(.destinationOutsideExportDirectory)
    }
    let rawRelativeComponents = Array(
      rawURL.pathComponents.dropFirst(rawDirectory.pathComponents.count)
    )
    let canonicalRelativeComponents = Array(
      canonicalURL.pathComponents.dropFirst(canonicalDirectory.pathComponents.count)
    )
    guard rawRelativeComponents == canonicalRelativeComponents else {
      throw storageError(.destinationOutsideExportDirectory)
    }
    return canonicalURL
  }

  private func applyExportProtection(to url: URL) throws {
    do {
      try fileManager.setAttributes(
        [.protectionKey: FileProtectionType.complete],
        ofItemAtPath: url.path
      )
      var values = URLResourceValues()
      values.isExcludedFromBackup = true
      var mutable = url
      try mutable.setResourceValues(values)
    } catch {
      throw storageError(.exportProtectionFailed)
    }
  }

  private func hasCompleteFileProtection(_ attributes: [FileAttributeKey: Any]) -> Bool {
#if targetEnvironment(simulator)
    // The simulator filesystem does not emulate iOS Data Protection classes.
    // Device builds must still prove Complete Protection below.
    return true
#else
    guard let value = attributes[.protectionKey] else { return false }
    if let protection = value as? FileProtectionType {
      return protection == FileProtectionType.complete
    }
    if let rawProtection = value as? String {
      return rawProtection == FileProtectionType.complete.rawValue
    }
    return false
#endif
  }

  private func verifyProtectedExport(at url: URL) throws {
    do {
      let values = try url.resourceValues(forKeys: [
        .isExcludedFromBackupKey,
        .isRegularFileKey,
        .isSymbolicLinkKey,
      ])
      let attributes = try fileManager.attributesOfItem(atPath: url.path)
      guard values.isRegularFile == true,
            values.isSymbolicLink != true,
            values.isExcludedFromBackup == true,
            hasCompleteFileProtection(attributes),
            fileManager.isReadableFile(atPath: url.path) else {
        throw storageError(.exportVerificationFailed)
      }
    } catch {
      throw sanitizedStorageError(error, fallback: .exportVerificationFailed)
    }
  }

  private func removeOwnedFileIfPresent(_ url: URL?) -> Bool {
    guard let url, fileManager.fileExists(atPath: url.path) else { return true }
    do {
      try fileManager.removeItem(at: url)
      return true
    } catch {
      return false
    }
  }

  private func appSupportDirectory() throws -> URL {
    let base = try fileManager.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
    let directory = base.appendingPathComponent("OnlySignature", isDirectory: true)
    try fileManager.createDirectory(at: directory, withIntermediateDirectories: true, attributes: [.protectionKey: FileProtectionType.complete])
    try fileManager.setAttributes([.protectionKey: FileProtectionType.complete], ofItemAtPath: directory.path)
    var values = URLResourceValues()
    values.isExcludedFromBackup = true
    var mutable = directory
    try mutable.setResourceValues(values)
    return directory
  }

  private func stateURL() throws -> URL { try appSupportDirectory().appendingPathComponent("state.json") }
  private func backupStateURL() throws -> URL { try appSupportDirectory().appendingPathComponent("state.previous.json") }

  private func exportDirectory() throws -> URL {
    let base = try fileManager.url(for: .cachesDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
    let directory = base.appendingPathComponent("OnlySignatureExports", isDirectory: true)
    try fileManager.createDirectory(at: directory, withIntermediateDirectories: true, attributes: [.protectionKey: FileProtectionType.complete])
    try fileManager.setAttributes([.protectionKey: FileProtectionType.complete], ofItemAtPath: directory.path)
    var values = URLResourceValues()
    values.isExcludedFromBackup = true
    var mutable = directory
    try mutable.setResourceValues(values)
    let directoryValues = try directory.resourceValues(forKeys: [.isDirectoryKey, .isSymbolicLinkKey])
    guard directoryValues.isDirectory == true, directoryValues.isSymbolicLink != true else {
      throw storageError(.destinationOutsideExportDirectory)
    }
    return directory
  }

  private func promoteTemporaryExport(sourceURI: String, fileExtension: String) throws -> String {
    var validatedSource: URL?
    var partialDestination: URL?
    do {
      let source = try validatedCaptureFile(from: sourceURI)
      validatedSource = source
      let normalizedExtension = try validatedExportExtension(fileExtension)
      guard source.pathExtension.lowercased() == normalizedExtension else {
        throw storageError(.sourceExtensionMismatch)
      }
      let directory = try exportDirectory()
      let destination = directory.appendingPathComponent(
        UUID().uuidString,
        isDirectory: false
      ).appendingPathExtension(normalizedExtension)
      let validatedDestination = try validatedExportURL(destination, inside: directory)
      guard !fileManager.fileExists(atPath: validatedDestination.path) else {
        throw storageError(.destinationAlreadyExists)
      }
      partialDestination = validatedDestination

      try fileManager.copyItem(at: source, to: validatedDestination)
      try applyExportProtection(to: validatedDestination)
      try verifyProtectedExport(at: validatedDestination)

      guard removeOwnedFileIfPresent(source) else {
        throw storageError(.exportCleanupFailed)
      }
      validatedSource = nil
      partialDestination = nil
      return validatedDestination.absoluteString
    } catch {
      let destinationCleaned = removeOwnedFileIfPresent(partialDestination)
      let sourceCleaned = removeOwnedFileIfPresent(validatedSource)
      guard destinationCleaned && sourceCleaned else {
        throw storageError(.exportCleanupFailed)
      }
      throw sanitizedStorageError(error, fallback: .exportPromotionFailed)
    }
  }

  private func deleteTemporaryExport(uri: String) throws {
    do {
      let directory = try exportDirectory()
      let requested = try fileURL(from: uri)
      let target = try validatedExportURL(requested, inside: directory)
      guard fileManager.fileExists(atPath: target.path) else { return }
      let values = try target.resourceValues(forKeys: [.isRegularFileKey, .isSymbolicLinkKey])
      guard values.isRegularFile == true, values.isSymbolicLink != true else {
        throw storageError(.exportDeletionFailed)
      }
      try fileManager.removeItem(at: target)
    } catch {
      throw sanitizedStorageError(error, fallback: .exportDeletionFailed)
    }
  }

  public func definition() -> ModuleDefinition {
    Name("OnlySignatureStorage")
    AsyncFunction("readState") { () -> String? in
      let url = try self.stateURL()
      guard self.fileManager.fileExists(atPath: url.path) else { return nil }
      return try String(contentsOf: url, encoding: .utf8)
    }
    AsyncFunction("readBackupState") { () -> String? in
      let url = try self.backupStateURL()
      guard self.fileManager.fileExists(atPath: url.path) else { return nil }
      return try String(contentsOf: url, encoding: .utf8)
    }
    AsyncFunction("writeStateAtomically") { (value: String) in
      let url = try self.stateURL()
      let backup = try self.backupStateURL()
      let staging = url.appendingPathExtension("next")
      try value.write(to: staging, atomically: true, encoding: .utf8)
      try self.fileManager.setAttributes([.protectionKey: FileProtectionType.complete], ofItemAtPath: staging.path)
      if self.fileManager.fileExists(atPath: url.path) {
        if self.fileManager.fileExists(atPath: backup.path) { try self.fileManager.removeItem(at: backup) }
        try self.fileManager.copyItem(at: url, to: backup)
        try self.fileManager.setAttributes([.protectionKey: FileProtectionType.complete], ofItemAtPath: backup.path)
        var backupValues = URLResourceValues(); backupValues.isExcludedFromBackup = true
        var mutableBackup = backup; try mutableBackup.setResourceValues(backupValues)
        try self.fileManager.removeItem(at: url)
      }
      try self.fileManager.moveItem(at: staging, to: url)
      try self.fileManager.setAttributes([.protectionKey: FileProtectionType.complete], ofItemAtPath: url.path)
      var values = URLResourceValues(); values.isExcludedFromBackup = true
      var mutable = url; try mutable.setResourceValues(values)
    }
    AsyncFunction("deleteState") {
      let url = try self.stateURL()
      let backup = try self.backupStateURL()
      if self.fileManager.fileExists(atPath: url.path) { try self.fileManager.removeItem(at: url) }
      if self.fileManager.fileExists(atPath: backup.path) { try self.fileManager.removeItem(at: backup) }
    }
    AsyncFunction("cleanupTemporaryFiles") {
      let directory = try self.exportDirectory()
      for child in try self.fileManager.contentsOfDirectory(at: directory, includingPropertiesForKeys: nil) { try self.fileManager.removeItem(at: child) }
    }
    AsyncFunction("protectedTemporaryDirectory") { () -> String in try self.exportDirectory().absoluteString }
    AsyncFunction("promoteTemporaryExport") { (sourceURI: String, fileExtension: String) -> String in
      try self.promoteTemporaryExport(sourceURI: sourceURI, fileExtension: fileExtension)
    }
    AsyncFunction("deleteTemporaryExport") { (uri: String) in
      try self.deleteTemporaryExport(uri: uri)
    }
    AsyncFunction("protectTemporaryFile") { (uri: String) in
      guard let url = URL(string: uri) else { throw NSError(domain: "OnlySignatureStorage", code: 1) }
      try self.fileManager.setAttributes([.protectionKey: FileProtectionType.complete], ofItemAtPath: url.path)
      var values = URLResourceValues(); values.isExcludedFromBackup = true
      var mutable = url; try mutable.setResourceValues(values)
    }
    AsyncFunction("verifyTemporaryFileProtection") { (uri: String) in
      guard let url = URL(string: uri), url.isFileURL else { throw NSError(domain: "OnlySignatureStorage", code: 1) }
      let attributes = try self.fileManager.attributesOfItem(atPath: url.path)
      guard self.hasCompleteFileProtection(attributes) else {
        throw NSError(domain: "OnlySignatureStorage", code: 2)
      }
      let values = try url.resourceValues(forKeys: [.isExcludedFromBackupKey])
      guard values.isExcludedFromBackup == true else {
        throw NSError(domain: "OnlySignatureStorage", code: 3)
      }
      guard self.fileManager.isReadableFile(atPath: url.path) else {
        throw NSError(domain: "OnlySignatureStorage", code: 4)
      }
    }
  }
}
