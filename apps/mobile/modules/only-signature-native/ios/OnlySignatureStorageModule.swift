import ExpoModulesCore

public final class OnlySignatureStorageModule: Module {
  private let fileManager = FileManager.default

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
    let directory = fileManager.temporaryDirectory.appendingPathComponent("OnlySignatureExports", isDirectory: true)
    try fileManager.createDirectory(at: directory, withIntermediateDirectories: true, attributes: [.protectionKey: FileProtectionType.complete])
    try fileManager.setAttributes([.protectionKey: FileProtectionType.complete], ofItemAtPath: directory.path)
    var values = URLResourceValues()
    values.isExcludedFromBackup = true
    var mutable = directory
    try mutable.setResourceValues(values)
    return directory
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
    AsyncFunction("protectTemporaryFile") { (uri: String) in
      guard let url = URL(string: uri) else { throw NSError(domain: "OnlySignatureStorage", code: 1) }
      try self.fileManager.setAttributes([.protectionKey: FileProtectionType.complete], ofItemAtPath: url.path)
      var values = URLResourceValues(); values.isExcludedFromBackup = true
      var mutable = url; try mutable.setResourceValues(values)
    }
  }
}
